var express = require("express");
var router = express.Router();
var userModel = require("./users");
var postModel = require("./posts")
var passport = require("passport");
var upload = require("./multer");

var localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

// profile feed click board
router.get("/", function (req, res, next) {
  res.render("signup");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  }).populate("posts");
  console.log(user);
  res.render("profile", { user: user });
});

router.get("/created/pins", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  }).populate("posts");
  res.render("createdPosts", { user: user });
});

router.get("/create", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  }).populate("posts");

  res.render("create", { user: user });
});
router.get("/feed", async function (req, res, next) {
  const posts = await postModel.find()
  res.render("feed" , {posts});
});

router.post("/upload", isLoggedIn , upload.single("file"), async function (req, res, next) {
  if(!req.file){
    return res.status(404).send("no files were given");
  }
  
  const user = await userModel.findOne({username : req.session.passport.user });
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post("/fileupload", isLoggedIn , upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  user.dp = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.get("/login", function (req, res, next) {
  var falshError = req.flash("error");
  res.render("login", { err: falshError });
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

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
  console.log(userData);
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
