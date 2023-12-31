var express = require("express");
var router = express.Router();
var userModel = require("./users");
var passport = require("passport");

var localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

// profile feed click board
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/profile", isLoggedIn, function (req, res, next) {
  res.render("profile");
});

router.get("/feed", function (req, res, next) {
  res.render("feed");
});

router.get("/signin", function (req, res, next) {
  res.render("login");
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post("/register", function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });

  userModel.register(userData, req.body.password)
  .then(function(){
      passport.authenticate("local")(req, res, function(){
          res.redirect('/profile');
      })
  })
  console.log(userData);
})

router.post("/login",  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/signin",
  }),
  function (req, res) {}
);

router.get("/logout", function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
