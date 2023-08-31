const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const passport = require("passport");

router.post("/register", async (req, res) => {
  try {
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // create the User
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save the User to the Database
    const user = await newUser.save();
    console.log("User Registed Successfully  !!!");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
}).post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json("Internal server error");
    }
    if (!user) {
      return res.status(401).json(info.message);
    }
    return res.json({ message: "Authentication successful", user });
  })(req, res, next);
});
module.exports = router;
