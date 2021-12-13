const { assert } = require('chai');

const { lookupUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('lookupUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookupUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    // assert.equal(user.id, expectedUserID);
    assert(user);
  });

  it('should return null when user enters a non-existing email', function() {
    const user = lookupUserByEmail("lighthouse@example.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});
