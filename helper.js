
const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
}




const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};




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


const cookieHasUser = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      console.log('this checks out')
      return true;
    }
  } return null;
};





module.exports = { getUserByEmail, urlsForUser, emailHasUser,generateRandomString, cookieHasUser };