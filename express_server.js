/////////////////////////////////////////
// Global Constants
/////////////////////////////////////////
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080


/////////////////////////////////////////
// Setup procedures
/////////////////////////////////////////

// Database object of shorthand URL's
const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'default_user'
  },
  i3BoGr: {
    longURL: 'http://www.google.com',
    userID: 'default_user'
  }
};

// Database object of registered users containing one default user to start with
const users = {
  'default_user': {
    id: 'default_user',
    email: 'default_user@example.com',
    password: 'abcd'
  }
};


/////////////////////////////////////////
// Setup procedures
/////////////////////////////////////////

// Set the view engine to EJS
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

// Initialize our packages
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup the server to listen on the desired PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/////////////////////////////////////////
// GET route handlers
/////////////////////////////////////////

// Root - redirects to the login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Url index of all stored urls
app.get('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  } else {
    console.log('urlDataBase:', urlDatabase);  // DEVELOPMENT ONLY. REMOVE FOR FINAL RELEASE.
    const templateVars = {
      urls: urlDatabase,
      'user': users[req.cookies['user_id']]
    };
    res.render('urls_index', templateVars);
  }
});

// Adding a new URL
app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  } else {
    const templateVars = {
      'user': users[req.cookies['user_id']]
    };
    res.render('urls_new', templateVars);
  }
});

// Viewing or modifying a specific URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      'user': users[req.cookies['user_id']]
    };
    res.render("urls_show", templateVars);
  }
});

// Redirect of a ShortURL to the actual webpage linked to it
app.get("/u/:shortURL", (req, res) => {
  const shortURL = lookupShortURL(urlDatabase, req.params.shortURL);
  console.log('BACK IN THE SHORTURL REDIRECT FUNCTION');
  console.log(shortURL);

  // Make sure a valid shortened URL was provided
  if (!shortURL) {
    res.status(400).send('Invalid shortened URL provided<br><a href="javascript:history.back()">Go Back</a>');
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

// Register a new user
app.get('/register', (req, res) => {
  const templateVars = {};

  // Check to see if a cookie exists and assign the value to a variable to send to the EJS template
  if (!req.cookies['user_id']) {
    templateVars['user'] = null;
  } else {
    templateVars['user'] = users[req.cookies['user_id']];
  }
  res.render('register', templateVars);
});

// Login page
app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    'user': null
  };

  console.log(users);

  // Check to see if a cookie exists and redirect to the correct page
  if (req.cookies['user_id']) {
    templateVars['user'] = users[req.cookies['user_id']];
    res.render('urls_index', templateVars);
  } else {
    res.render('login', templateVars);
  }
});

/////////////////////////////////////////
// POST route handlers
/////////////////////////////////////////

// Adding a new short URL to the database
app.post('/urls/new', (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send('Invalid URL entered<br><a href="javascript:history.back()">Go Back</a>');
  } else {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL
    };
    res.redirect(`/urls`);
  }
});

// Editing a short URL in the database
app.post('/urls/:shortURL/edit', (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send('Invalid URL entered<br><a href="javascript:history.back()">Go Back</a>');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

// Deleting a short URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Registering a new user
app.post('/register', (req, res) => {
  // Ensure an email and password has been entered
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Invalid email address or password<br><a href="javascript:history.back()">Go Back</a>');
  }

  // Check to see if user exists
  const user = lookupUserByEmail(users, req.body.email);
  if (user) {
    return res.status(400).send('Username/Email already taken<br><a href="javascript:history.back()">Go Back</a>');
  }

  const generatedID = generateRandomString(10);
  users[generatedID] = {
    id: generatedID,
    email: req.body.email,
    password: req.body.password
  };

  console.log(urlDatabase);  // DEVELOPMENT ONLY. REMOVE FOR FINAL RELEASE.
  res.redirect('/login');
});

// Logging in a user
app.post('/login', (req, res) => {
  const user = lookupUserByEmail(users, req.body.email);
  const password = req.body.password;

  // Check to see if you user exists, if so, check if the passwords match
  if (user === undefined) {
    return res.status(403).send('User does not exist<br><a href="javascript:history.back()">Go Back</a>');
  } else if (user.password !== password) {
    return res.status(403).send('Password does not match<br><a href="javascript:history.back()">Go Back</a>');
  }

  // Everything checks out, set a cookie and take them to their homepage
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

// Logging out a user
app.post('/logout', (req, res) => {
  console.log(urlDatabase);  // DEVELOPMENT ONLY. REMOVE FOR FINAL RELEASE.
  console.log(users);  // DEVELOPMENT ONLY. REMOVE FOR FINAL RELEASE.
  res.clearCookie('user_id');
  res.redirect('/login');
});

/////////////////////////////////////////
// Helper Functions
/////////////////////////////////////////

// Lookup a user in the database by email and returns their associated ID
const lookupUserByEmail = (users, email) => {
  let user;
  for (let id in users) {
    if (users[id].email === email) {
      user = users[id];
    }
  }
  return user;
};

// Lookup a short URL in the database by the shortURL and returns that object if found
const lookupShortURL = (urls, shortURL) => {
  let shortenedURL;

  console.log('NOW IN THE lookupShortURL FUNCTION');
  console.log('urls: ', urls);
  console.log('shortURL provided: ', shortURL);
  for (let url in urls) {
    console.log('URL key: ', url);
    if (url === shortURL) {
      console.log("IF STATEMENT SUCCEEDED");
      shortenedURL = url;
    }
  }
  return shortenedURL;
};

// Generate a 6 character long random alpha-numeric string
const generateRandomString = (length) => Math.random().toString(36).slice(2, length + 2);
