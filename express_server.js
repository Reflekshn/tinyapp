const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080; // default port 8080

// Object to store our database of shorthand url's
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Initialize the body parser module
app.use(bodyParser.urlencoded({extended: true}));

// Setup the server to listen on the desired PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Define GET route handlers
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log('req.params: ', req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Define POST route handlers
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

// Generate a 6 character long random alpha-numeric string
const generateRandomString = () => Math.random().toString(36).slice(2, 8);
