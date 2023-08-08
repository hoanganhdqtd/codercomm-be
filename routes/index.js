var express = require("express");
var router = express.Router();

/* GET home page. */
// router.get("/", function (req, res, next) {
//   // res.render('index', { title: 'Express' });
//   res.send({ status: "OK", data: "Hello" });
// });

// auth API
const authApi = require("./auth.api");
router.use("/auth", authApi);

// user API
const userApi = require("./user.api");
router.use("/users", userApi);

// post API
const postApi = require("./post.api");
router.use("/posts", postApi);

// comment API
const commentApi = require("./comment.api");
router.use("/comments", commentApi);

// reaction API
const reactionApi = require("./reaction.api");
router.use("/reactions", reactionApi);

// friend API
const friendApi = require("./friend.api");
router.use("/friends", friendApi);

module.exports = router;
