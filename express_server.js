const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require("./helper");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["my secret key", "backup secret key"],
  })
);

const PORT = 8080;

// ==================================================================

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// ==================================================================

app.get("/", (req, res) => {
  const loggedIn = !!users[req.session.user_id];
if (loggedin){
  res.redirect("/urls");
} else {
  res.redirect("/login");
}
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// redirects to /urls if logged in, otherwise to /login
app.get("/urls", (req, res) => {
  const loggedIn = !!users[req.session.user_id];
  const user = users[req.session.user_id];

  if (loggedIn) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id],
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
    // res.send(
    //   '<html><body>Please Log in First! Go to <a href="/login"> login <a/></body></html>\n'
    // );
  }
});

// allows logged in users to create new urls
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

// shows urls that belong to the user, if they are logged in
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const urls = urlsForUser(userID, urlDatabase);
  if (!userID) {
    res.status(404).send("Please login to edit urls");
  } else if (!urls[shortURL]) {
    res.status(404).send("you are not authorized to edit this URL");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

// send user to the long url: ex.google.com by typing the shorturl in the browser if logged in --  http://localhost:8080/u/F9h5a9
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res
      .status(404)
      .send(
        "The short URL you want to access does not match any long URLs in our system."
      );
  }
});

// login users
app.get("/login", (req, res) => {
  const loggedIn = users[req.session.user_id];
  if (loggedIn) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = {
      user: users[loggedIn],
    };
    res.render("urls_login", templateVars);
  }
});

// REGISTER new users
app.get("/register", (req, res) => {
  const loggedIn = req.session.user_id;
  if (loggedIn) {
    res.redirect(`/urls/`);
  } 
  const templateVars = {
    user: users[loggedIn],
  };
  res.render("urls_register", templateVars);

  
});

// new url creation - POST
// adds new url to database, redirects to short url page
app.post("/urls", (req, res) => {

  const { user_id } = req.session;
  if (!user_id) {
    return res.status(400).send("Please Login First!");
  }

  const validUser = users[user_id];
  if (!validUser) {
    return res.status(400).send("This is not a valid user!")
  }

  const {longURL} = req.body
  if (!longURL){
    return res.status(400).send("Please enter a valid longURL!")
  }
 
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID: user_id} 
  res.redirect(`/urls/${shortURL}`);
});

// users delete thier urls and redirects to /urls page.
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_id;
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const shortURL = req.params.shortURL;

  if (!user) {
    return res.status(404).send("Please login to delete urls");
  } else if (!urls[shortURL]) {
   return res.status(404).send("you are not authorized to delete this URL");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// new url creation - POST
// adds new url to database, redirects to my urls page
app.post("/urls/:shortURL", (req, res) => {
  
  const { user_id } = req.session;
  if (!user_id) {
    return res.status(400).send("Please Login First!");
  }

  const validUser = users[user_id];
  if (!validUser) {
    return res.status(400).send("This is not a valid user!")
  }

  const {longURL} = req.body
  if (!longURL){
    return res.status(400).send("Please enter a valid longURL!")
  }
 
  const {shortURL} = req.params;
  urlDatabase[shortURL] = {longURL, userID: user_id} 
  res.redirect(`/urls/`);
});

// new user creation - POST
// register new users if they provide valid email and password or not already registered and redirect to /urls page.
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Please include both a valid email and password");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists for this email address");
  } else {
    users[id] = {
      id,
      email,
      password: hashedPassword,
    };
  }
  req.session.user_id = id;
  res.redirect(`/urls/`);
});

// lets users login if account is already registered and provides correct email adress and password.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send("There is no account made with this email address");
  } else {
    const user = getUserByEmail(email, users);

    if (!bcrypt.compareSync(password, user.password)) {
      res
        .status(403)
        .send(
          "The password you entered does not match the one associated with the provided email address"
        );
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }
});

// post - logouts user if logged in.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
