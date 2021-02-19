const crypto = require("crypto");

function generateRandomString() {
  return crypto.randomBytes(3).toString("hex");
}

const userEmailExists = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function (id, urlDatabase) {
  let visibleURL = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      visibleURL[shortURL] = urlDatabase[shortURL];
    }
  }
  return visibleURL;
};

module.exports = { userEmailExists, generateRandomString, urlsForUser };
