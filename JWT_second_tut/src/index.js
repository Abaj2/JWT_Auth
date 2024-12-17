require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} = require("./tokens.js");

const { fakeDB } = require("./fakeDB.js");
const { isAuth } = require("./isAuth.js");

// 1. Register a user
// 2. Login
// 3. Logout a user
// 4. Setup a protected route
// 5. Get a new accesstoken with a refresh token

const app = express();

// Use express middleware for easier cookie handling
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Needed to be able to read body date
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // support url encoded bodies

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user exist
    const user = fakeDB.find((user) => user.email === email);
    if (user) throw new Error("User already exists");
    const hashedPassword = await hash(password, 10);
    fakeDB.push({
      id: fakeDB.length,
      email,
      password: hashedPassword,
    });
    res.send({ message: "User Created" });
    console.log(fakeDB);
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("Missing token secrets in environment variables");
    }

    const user = fakeDB.find((user) => user.email === email);
    if (!user) throw new Error("User does not exist");

    const valid = await compare(password, user.password);
    if (!valid) throw new Error("Password not correct");

    const accesstoken = createAccessToken(user.id);
    const refreshtoken = createRefreshToken(user.id);

    user.refreshtoken = refreshtoken;
    console.log(fakeDB);

    sendRefreshToken(res, refreshtoken);
    sendAccessToken(res, req, accesstoken);
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

app.post("/logout", (_req, res) => {
  res.clearCookie("refreshtoken", { path: '/refresh_token' });
  return res.send({
    message: "Logged out",
  });
});

app.post("/protected", async (req, res) => {
  try {
    const userId = isAuth(req);
    if (userId !== null) {
      res.send({
        data: "This is protected data",
      });
    }
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

app.post("/refresh_token", (req, res) => {
  const token = req.cookies.refreshtoken
  if (!token) return req.send({ accesstoken: '' });
  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET)

  } catch (err) {
    return res.send({ accesstoken: "" })
  }
  const user = fakeDB.find(user => user.id === payload.id)
  if (!user) return res.send({ accesstoken: '' })

  if (user.refreshtoken !== token) {
    return res.send({ accesstoken: '' })
  }
  const accesstoken = createAccessToken(user.id)
  const refreshtoken= createRefreshToken(user.id)
  user.refreshtoken = refreshtoken;
  sendRefreshToken(res, refreshtoke);
  return res.send({ accesstoken })
})

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server listening on port ${process.env.PORT || 4000}`);
});

// Register a user
