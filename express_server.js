/////////////////////////////////////////
// Global Constants
/////////////////////////////////////////
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, lookupUserByEmail, urlsForUser, lookupShortURL } = require('./helpers');
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
    password: bcrypt.hashSync('abcd', 10)
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
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
})
);

/////////////////////////////////////////
// GET route handlers
/////////////////////////////////////////

// Root - redirects to the login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Url index of all stored urls
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.status(400).send('Please login or register a new user<br><a href="javascript:history.back()">Go Back</a>');
  }
  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    userID: users[userID]
  };
  res.render('urls_index', templateVars);
});

// Adding a new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect('/login');
  } else {
    const templateVars = {
      userID: users[userID]
    };
    res.render('urls_new', templateVars);
  }
});

// Viewing or modifying a specific URL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  // Ensure user is logged in, and that the provided short URL exists for that user
  if (!userID) {
    res.status(400).send('Please login or register a new user<br><a href="javascript:history.back()">Go Back</a>');
  } else if (!urlDatabase[shortURL]) {
    res.status(400).send('The provided URL does not exist for this user<br><a href="javascript:history.back()">Go Back</a>');
  } else if (urlDatabase[shortURL].userID !== userID) {
    res.status(400).send('The provided URL does not belong to this user<br><a href="javascript:history.back()">Go Back</a>');
  } else {
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      userID: users[userID]
    };
    res.render("urls_show", templateVars);
  }
});

// Redirect of a ShortURL to the actual webpage linked to it
app.get("/u/:shortURL", (req, res) => {
  const shortURL = lookupShortURL(urlDatabase, req.params.shortURL);

  // Make sure a valid shortened URL was provided
  if (!shortURL) {
    res.status(400).send('Invalid shortened URL provided<br><a href="javascript:history.back()">Go Back</a>');
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

// Register a new user
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {};

  // Check to see if a cookie exists and assign the value to a variable to send to the EJS template
  if (!userID) {
    templateVars['userID'] = null;
  } else {
    templateVars['userID'] = users[userID];
  }
  res.render('register', templateVars);
});

// Login page
app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    urls: urlDatabase,
    userID: null
  };

  // Check to see if a cookie exists and redirect to the correct page
  if (userID) {
    templateVars['userID'] = users[userID];
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
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (!userID) {
    res.status(400).send('Please login or register a new user<br><a href="javascript:history.back()">Go Back</a>');
  } else if (!longURL) {
    res.status(400).send('Invalid URL entered<br><a href="javascript:history.back()">Go Back</a>');
  } else {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID
    };
    res.redirect(`/urls`);
  }
});

// Editing a short URL in the database
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (!userID) {
    res.status(400).send('Please login or register a new user<br><a href="javascript:history.back()">Go Back</a>');
  } else if (!urlDatabase[shortURL]) {
    res.status(400).send('The provided URL does not exist for this user<br><a href="javascript:history.back()">Go Back</a>');
  } else if (urlDatabase[shortURL].userID !== userID) {
    res.status(400).send('The provided URL does not belong to this user<br><a href="javascript:history.back()">Go Back</a>');
  } else if (urlDatabase[shortURL].userID === userID) {
    if (!longURL) {
      res.status(400).send('Invalid URL entered<br><a href="javascript:history.back()">Go Back</a>');
    }
    urlDatabase[shortURL].longURL = longURL;
  }
  res.redirect('/urls');
});

// Deleting a short URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;

  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

// Registering a new user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Ensure an email and password has been entered
  if (!email || !password) {
    return res.status(400).send('Invalid email address or password<br><a href="javascript:history.back()">Go Back</a>');
  }

  // Check to see if user exists
  const user = lookupUserByEmail(req.body.email, users);
  if (user) {
    return res.status(400).send('Username/Email already taken<br><a href="javascript:history.back()">Go Back</a>');
  }

  const generatedID = generateRandomString(10);
  users[generatedID] = {
    id: generatedID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };

  // Log in and create the cookie for the newly registered user
  // eslint-disable-next-line camelcase
  req.session.user_id = users[generatedID].id;
  res.redirect('/urls');
});

// Logging in a user
app.post('/login', (req, res) => {
  const user = lookupUserByEmail(req.body.email, users);
  const password = req.body.password;

  // Check to see if you user exists, if so, check if the passwords match
  if (user === undefined) {
    return res.status(403).send('User does not exist<br><a href="javascript:history.back()">Go Back</a>');
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Password does not match<br><a href="javascript:history.back()">Go Back</a>');
  }

  // Everything checks out, set a cookie and take them to their homepage
  // eslint-disable-next-line camelcase
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Logging out a user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Setup the server to listen on the desired PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});