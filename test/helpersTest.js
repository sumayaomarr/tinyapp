const { assert } = require('chai');
const { getUserByEmail } = require('../helper.js');

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

describe('getUserByEmail', function() {
  it('return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(expectedOutput, user)
  });

  it('return undefined when pass an email that does not exist in our user database', function() {
    const user = getUserByEmail("example@email.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user);
  });

});