require("dotenv/config");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");

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
    origin: "http://localhost3000:",
    credentials: true,
  })
);

// Needed to be able to read body date
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // support url encoded bodies

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server listening on port ${process.env.PORT || 4000}`);
});
