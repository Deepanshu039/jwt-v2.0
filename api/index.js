const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require('cors')

app.use(express.json());
app.use(cors());

const users = [
  {
    id: "1",
    username: "saran@gmail.com",
    name: "saran",
    password: "saran0908",
    isAdmin: true,
    role: "manager",
    has_permission: true,
  },
  {
    id: "2",
    username: "rahul@gmail.com",
    name: "rahul",
    password: "rahul0908",
    isAdmin: false,
    role: "developer",
    has_permission: true,
  },
  {
    id: "3",
    username: "kiwi@gmail.com",
    name: "kiwi",
    password: "kiwi0908",
    isAdmin: false,
    role: "intern",
    has_permission: true,
  },
];

let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expiresIn: "5s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log({username, password});
  const user = users.find((u) => {
    return u.username === username && u.password === password ;
  });
  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("Username or password incorrect!");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully.");
});

app.get("/", (req, res)=> {
    res.status(200).json("hellow from backend!");
})

app.listen(5000, () => console.log("Backend server is running!"));