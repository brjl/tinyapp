/* REQUIRES */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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
      return true;
    } else {
      return false;
    }
  }
};

/* DATABASES */

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.post("/login", (req, res) => {
  console.log(req.body.username);
  //set a cookie named username to the value submitted in the request body via the login form
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  console.log("register");
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  //If someone tries to register with an email that is already in the users object, send back a response with the 400 status code. Checking for an email in the users object is something we'll need to do in other routes as well. Consider creating an email lookup helper function to keep your code DRY

  if (userEmailExists(req.body.email) === true) {
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

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  //console.log(req.cookies["user_id"])
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
  res.clearCookie("username");

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
