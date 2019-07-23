const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const secret = config.get("secret");

//user route test
router.get("/", (req, res) => {
  res.status(200).json({
    message: "User Router"
  });
});

//user register route
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        res.status(409).json({
          email: "Email already exists"
        });
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: "200", // Size
          r: "pg", // Rating
          d: "mm" // Default
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar
        });

        bcryptjs.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcryptjs.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((doc, err) => {
                if (err) {
                  res.status(400).json({
                    error: e
                  });
                } else {
                  res.status(200).json({
                    email: doc.email,
                    name: doc.name
                  });
                }
              })
              .catch(e => {
                res.status(400).json({
                  error: e
                });
              });
          });
        });
      }
    })
    .catch(e => {
      console.log(e);
    });
});

//login route
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      res.status(404).json({
        message: "User doesnot exist!"
      });
    }

    bcryptjs.compare(req.body.password, user.password).then(passMatch => {
      if (passMatch) {
        const payLoad = {
          email: user.email,
          name: user.name,
          avatar: user.avatar
        };

        jwt.sign(payLoad, secret, { expiresIn: 3600 }, (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token: `Bearer ${token}`
          });
        });
      } else {
        return res.status(404).json({
          password: "Incorrect Password"
        });
      }
    });
  });
});

module.exports = router;
