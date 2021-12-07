const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Object to store our database of shorthand url's
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Setup the server to listen on the desired PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Set various route handlers
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