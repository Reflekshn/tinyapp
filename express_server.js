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

// Database object of registered users
const users = {
  "user1": {
    id: "user1",
    email: "user1@example.com",
    password: "abcd"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "efgh"
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
app.use(express.urlencoded({extended: false}));
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
  const user = 'user1';
  const templateVars = {
    urls: urlDatabase,
    user: users[user]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = 'user1';
  const templateVars = {
    user: users[user]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = 'user1';
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
  const user = 'user1';
  const templateVars = {
    user: users[user]
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = 'user1';
  const templateVars = {
    user: users[user]
  };
  res.render('login', templateVars);
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
    email: req.body.username,
    password: req.body.password
  };
  console.log(users);
  res.cookie('user_id', generatedID);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // res.cookie('username', req.body.username);
  res.redirect('urls');
});

app.post('/logout', (req, res) => {
  // res.clearCookie('username');
  res.redirect('urls');
});

/////////////////////////////////////////
// Helper Functions
/////////////////////////////////////////

// Generate a 6 character long random alpha-numeric string
const generateRandomString = (length) => Math.random().toString(36).slice(2, length + 2);
