const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcrypt");
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const getUserByEmail = require("./helper");

app.use(cookieSession({
  name: 'session',
  keys: ['my secret key', 'backup secret key'],
}))

// const getUserByEmail = function (email, database) {
//   for (let user in database) {
//     if (database[user].email === email) {
//       return database[user].id;
//     }
//   }
// }


const cookieHasUser = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      console.log('this checks out')
      return true;
    }
  } return null;
};


	const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};



const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password:bcrypt.hashSync("dishwasher-funk", 10)
  }
}




const emailHasUser = function (email) {
  console.log(Object.keys(users));
  for (const user of Object.keys(users)) {
    console.log(users[user]);
    console.log(email);
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
  const loggedIn = !!users[req.session.user_id]
  console.log(loggedIn);

  if (loggedIn) {
    // res.redirect(`/urls/`)
    
    const templateVars = {
      urls: urlsForUser(req.session.user_id,urlDatabase),
    user: users[req.session.user_id]
 
    };
console.log('urls for user:', urlsForUser([req.session.user_id],urlDatabase))

    res.render("urls_index", templateVars);
  } else {
    res.send('<html><body>Please Log in First! Go to <a href="http://localhost:8080/login"> http://localhost:8080/login <a/></body></html>\n');
  }

});





app.get("/urls/new", (req, res) => {
  if (!(users[req.session.user_id])) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});



app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,

    user: users[req.session.user_id]
  };
  console.log(urlDatabase[req.params.shortURL].longURL)
  res.render("urls_show", templateVars);
});




app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  const userID = req.session.user_id
  console.log(userID);
  const theNewUrl = { longURL, userID }

  urlDatabase[shortURL] = theNewUrl;
  console.log(urlDatabase);
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
  const user = req.session.user_id
  const urls = urlsForUser(req.session.user_id,urlDatabase)
  const shortURL = req.params.shortURL;
  console.log(urlDatabase);
  
  if (!user) {
    res.status(404).send("Please login to delete urls")
  } else if (!urls[shortURL]) {
    res.status(404).send("you are not authorized to delete this URL") 
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls')
});



app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.user_id
  const theNewUrl = { longURL, userID }
  const urls = urlsForUser(userID, urlDatabase)
  if (!users) {
    res.status(404).send("Please login to edit urls")
  } else if (!urls[shortURL]) {
    res.status(404).send("you are not authorized to edit this URL") 
  }

  urlDatabase[shortURL] = theNewUrl;
  res.redirect(`/urls/${shortURL}`)

});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!getUserByEmail(email, users)) {
    res.status(403).send("There is no account made with this email address");
  } else {
    const user = getUserByEmail(email, users);
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403).send("The password you entered does not match the one associated with the provided email address");
    } else {
      // res.session('user_id', user.id);
      req.session.user_id = user.id;
      res.redirect('/urls')
    }
  }
});


app.post("/logout", (req, res) => {
  res.session('user_id');
  res.redirect(`/urls`)
});





app.get("/register", (req, res) => {
  const loggedIn = !!req.session.user_id
  if (loggedIn) {
    res.redirect(`/urls/`)
  } else {
    res.render("urls_register");
  }
});



app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    res.status(400).send("Please include both a valid email and password");
  } else if (getUserByEmail(email,users)) {
    res.status(400).send("An account already exists for this email address");
  } else {

    users[id] = {
      id,
      email,
      password: hashedPassword
    }

  }
  
  req.session.user_id = id;

  res.redirect(`/urls/`)
});




app.get("/login", (req, res) => {
  const loggedIn = users[req.session.user_id]
  if (loggedIn) {
    res.redirect(`/urls/`)
  } else {
    res.render("urls_login");
  }
});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
