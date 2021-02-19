const { assert } = require("chai");

const {
  userEmailExists,
  generateRandomString,
  urlsForUser,
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.discogs.com", userID: "userRandomID" },
};

describe("userEmailExists", function () {
  it("should return a user with valid email", function () {
    const user = userEmailExists("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it("should return undefined for a user email that is not in the database", function () {
    const user = userEmailExists("god@godsquad.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("generateRandomString", function () {
  it("should return a string when called", function () {
    const string = generateRandomString();
    assert.isString(string);
  });

  describe("urlsForUser", function () {
    it("should return an object when userRandomID is called", function () {
      const user = urlsForUser("userRandomID", urlDatabase);

      assert.isObject(user);
    });
  });
});
