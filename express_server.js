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

const urlsForUser = function (id, urlDatabase) {
  let visibleURL = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      visibleURL[shortURL] = urlDatabase[shortURL]
    };
  }
  return visibleURL
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
    password: "1234",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "1234",
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
  const email = req.body.email
  const password = req.body.password
  if (userEmailExists(req.body.email)) {
   
  res
      .status(401)
      .send("An account already exists for this address. Please log in using this email");
  }
  if (!email || !password) {
    res
      .status(401)
      .send("Please provide an email and password.");
    
  }
  let newUserID = generateRandomString();
  const newUser = {
    id: newUserID,
    email: email,
    password: password,
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
      .status(401)
      .send("There is no account registered with that email. Please register.");
  }

  if (user && users[user].password !== req.body.password) {
    console.log("password and email dont match");
    res
      .status(401)
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
    urls: urlsForUser(req.cookies["user_id"], urlDatabase),
    user: users[req.cookies["user_id"]],
  };
  console.log(req.cookies["user_id"])
  console.log('Is this undefined?:', urlsForUser(req.cookies["user_id"]))
  //console.log(urlDatabase[req.params.shortURL].userID)
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
  } if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL].longURL
  const userID = urlDatabase[req.params.shortURL].userID
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  if (user.id === userID) {
    res.render("urls_show", templateVars);
    
  
  } if (user.id === undefined || user.id !== userID) {
    res
      .status(403)
      .send("You don't have permission to do this");
  }

  // console.log(longURL)
  // console.log(shortURL)
  console.log(user)
  console.log(userID)
  //res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; //undefined
  //console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => { //WIP
  //console.log("Deleting URL");
  const userID = urlDatabase[req.params.shortURL].userID
  const user = users[req.cookies["user_id"]]
 
  if (user.id === userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    
  
  } if (user.id === undefined || user.id !== userID) {
    res
      .status(403)
      .send("You don't have permission to do this");
  }
 
 console.log('user:', user)
 console.log('user ID:', userID)
});

app.post("/urls/:shortURL", (req, res) => {
  console.log("Edited URL");
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;

 
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/anon", (req,res)=>{
  res.render("urls_anon");

});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

/* SERVER LISTENING */

app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
