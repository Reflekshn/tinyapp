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
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }

  console.log('urlDataBase:', urlDatabase);

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = 'default_user';
  const templateVars = {
    user: users[user]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = 'default_user';
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[user]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const user = null;
  const templateVars = {
    user: users[user]
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {};

  if (!req.cookies['user_id']) {
    templateVars['user'] = null;
  } else {
    templateVars['user'] = users[req.cookies['user_id']];
  }

  console.log('users:', users);
  res.render('login', templateVars);
});

app.get('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.render('/login');
});

/////////////////////////////////////////
// POST route handlers
/////////////////////////////////////////
app.post('/urls/new', (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send('Invalid URL entered');
  } else {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send('Invalid URL entered');
  } else {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Invalid email address or password");
  }

  for (let id in users) {
    const user = users[id];
    if (user.email === req.body.email) {
      console.log(users);
      return res.status(400).send("Username/Email already taken");
    }
  }

  const generatedID = generateRandomString(10);
  users[generatedID] = {
    id: generatedID,
    email: req.body.email,
    password: req.body.password
  };
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.email);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

/////////////////////////////////////////
// Helper Functions
/////////////////////////////////////////

// Generate a 6 character long random alpha-numeric string
const generateRandomString = (length) => Math.random().toString(36).slice(2, length + 2);
