/* REQUIRES */
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

/* MIDDLEWARE */
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* HELPER FUNCTIONS */

function generateRandomString() {
  return crypto.randomBytes(3).toString("hex");
}

const userEmailExists = function (email) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function (id) {
  let visibleURL = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) [(visibleURL[url] = urlDatabase[url])];
  }
};

/* DATABASES */

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.discogs.com", userID: "aJ48lW" },
};

const users = {
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

/*ROUTES*/

app.get("/", (req, res) => {
  res.send("Hello! There's nothing here. Sorry about that.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  console.log("register");
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (userEmailExists(req.body.email)) {
    res.send(
      400,
      "An account already exists for this address. Please log in using this email"
    );
  }
  if (!req.body.email || !req.body.password) {
    res.send(400, "Please provide an email and password.");
  }
  let newUserID = generateRandomString();
  const newUser = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password,
  };
  users[newUserID] = newUser;
  res.cookie("user_id", newUserID);
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

/*

A user sees the correct information in the header
email: "user@example.com",
    password: "purple-monkey-dinosaur",
*/

app.post("/login", (req, res) => {
  let user = userEmailExists(req.body.email);
  if (!user) {
    console.log("no user email registration found");
    res
      .status(403)
      .send("There is no account registered with that email. Please register.");
  }

  if (user && users[user].password !== req.body.password) {
    console.log("password and email dont match");
    res
      .status(403)
      .send(
        "Your email and password do not match. Please try logging in again."
      );
  }
  if (user && users[user].password === req.body.password) {
    console.log("Success! You are logged in!");
    res.cookie("user_id", user);
    //console.log(users[req.cookies["user_id"]])
    res.redirect(`/urls`);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  //console.log(urlDatabase[shortURL])
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: urlDatabase[req.params.shortURL].userID,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("Deleting URL");
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  console.log("Edited URL");
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

/* SERVER LISTENING */

app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
