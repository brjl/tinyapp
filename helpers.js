const userEmailExists = function (email, urlDatabase) {
  for (const user in urlDatabase) {
    if (urlDatabase[user].email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { userEmailExists };