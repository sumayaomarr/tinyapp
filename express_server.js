const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');

const users = {
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
}


const emailHasUser = function (email) {
  console.log(Object.keys(users));
  for (const user of Object.keys(users)) {
    console.log(users[user]);
    console.log(email);
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

function generateRandomString() {
  let result = "";

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  console.log(req.cookies)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const longUrl = req.body.longURL;
  const shortURL = generateRandomString(longUrl)
  urlDatabase[shortURL] = longUrl;
  res.redirect(`/urls/`)
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you want to access does not match any long URLs in our system.");
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect('/urls')
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longUrl = req.body.longURL;
  urlDatabase[shortURL] = longUrl;
  res.redirect(`/urls/${shortURL}`)

});

app.post("/login", (req, res) => {
  const user = req.body.email;
  const password = req.body.password;
  if (!emailHasUser(email, user)) {
    res.status(403).send("There is no account made with this email address");
  } else {
    const userID = userIdFromEmail(email, user);
    if (!bcrypt.compareSync(password, user[userID].password)) {
      res.status(403).send("The password you entered does not match the one associated with the provided email address");
    } else {
  res.cookie('user_id', user);
  res.redirect(`/urls/`)
    }
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls/`)
});

app.get("/register", (req, res) => {

  res.render("urls_registerC");

});



app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(email)) {
    res.status(400).send("An account already exists for this email address");
  } else {

    users[id] = {
      id,
      email,
      password
    }

  }
  res.cookie('user_id', id);
  
  res.redirect(`/urls/`)
});

app.get("/login", (req, res) => {

  res.render("urls_login");

});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
