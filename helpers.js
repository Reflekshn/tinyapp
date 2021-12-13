/////////////////////////////////////////
// Helper Functions
/////////////////////////////////////////

// Lookup a user in the database by email and returns their associated ID
const lookupUserByEmail = (email, userDatabase) => {
  let user;
  for (let id in userDatabase) {
    if (userDatabase[id].email === email) {
      user = userDatabase[id];
    }
  }
  return user;
};

// Lookup a short URL in the database by the shortURL and returns that object if found
const lookupShortURL = (urls, shortURL) => {
  let shortenedURL;

  for (let url in urls) {
    if (url === shortURL) {
      shortenedURL = url;
    }
  }
  return shortenedURL;
};

// Filter out only the URLS from the database that are linked to the passed in user
const urlsForUser = (id, urlDatabase) => {
  let filteredURLS = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredURLS[url] = urlDatabase[url];
    }
  }
  return filteredURLS;
};

// Generate a 6 character long random alpha-numeric string
const generateRandomString = (length) => Math.random().toString(36).slice(2, length + 2);

module.exports = {
  lookupUserByEmail,
  lookupShortURL,
  urlsForUser,
  generateRandomString
};