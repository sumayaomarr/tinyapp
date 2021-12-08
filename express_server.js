const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const cookieParser = require('cookie-parser');

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
     username: req.cookies["username"]
    };
    console.log(req.cookies)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
   };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
  username: req.cookies["username"]
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
  const username = req.body.username;
  res.cookie('username',username); 
  res.redirect(`/urls/`)

});


app.post("/logout", (req, res) => {
  res.clearCookie('username'); 
  res.redirect(`/urls/`)
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
