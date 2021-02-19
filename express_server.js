/* REQUIRES */
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const {
  userEmailExists,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

/* MIDDLEWARE */
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["larry", "curly", "moe"],
  })
);

/* DATABASES */
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.discogs.com", userID: "aJ48lW" },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "1234",
  },

  user: {
    id: "user",
    email: "d@d.com",
    password: "$2a$10$y6dVwLQDI.hfjCcM/PJrVO8nQvX9f5mkaXl3kO6hC4cSpMiyx1Jie",
  },
};

/*ROUTES*/
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const email = req.body.email;
  const templateVars = {
    user: users[req.session.user_id],
    email,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (userEmailExists(email, users)) {
        return res
          .status(401)
          .send(
            "An account already exists for this address. Please log in using this email"
          );
      }

      if (!email || !password) {
        return res.status(401).send("Please provide an email and password.");
      }

      let newUserID = generateRandomString();
      users[newUserID] = {
        id: newUserID,
        email,
        password: hash,
      };

      req.session.user_id = newUserID;
      res.redirect(`/urls`);
    });
  });
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmailName = userEmailExists(req.body.email, users);
  const user = users[userEmailName];
  const password = req.body.password;

  if (!userEmailName) {
    res
      .status(401)
      .send("There is no account registered with that email. Please register.");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      req.session.user_id = user.id;
      res.redirect(`/urls`);
    }
    if (!result) {
      res
        .status(401)
        .send(
          "Your email and password do not match. Please try logging in again."
        );
    }
  });
});

app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  console.log("this is users", users);

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[user],
  };

  if (!user) {
    res.status(403).send("You don't have permission to do this");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  const email = req.body.email;
  const templateVars = {
    user: users[user],
    email,
  };

  if (!user) {
    res.status(403).send("You don't have permission to do this");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userID = urlDatabase[req.params.shortURL].userID;
  const email = req.body.email;
  const templateVars = {
    email,
    shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[user],
  };

  if (user === undefined || user !== userID) {
    res.status(403).send("You don't have permission to do this");
  }
  if (user === userID) {
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = urlDatabase[req.params.shortURL].userID;
  const user = req.session.user_id;
  if (user === undefined || user !== userID) {
    res.status(403).send("You don't have permission to do this");
  }
  if (user === userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.get("*", (req, res) => {
  res.status(404).send("404: You've taken a wrong turn.");
});

/* SERVER LISTENING */
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
