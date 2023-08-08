const express = require("express");
const router = express.Router();

const authentication = require("../middlewares/authentication");

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");

const postController = require("../controllers/post.controller");

/**
 * @route GET /posts/user/:userId?page=1&limit=10
 * @description Get all posts a specific user with userId
 * can see with pagination (including ones created by
 * their friends')
 * @access Login required
 */
router.get(
  "/user/:userId",
  authentication.loginRequired,
  validators.validate([
    // param("id").exists().isString().custom(validators.checkObjectId),
    // param("id").exists().bail().isString().custom(validators.checkObjectId),
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  postController.getPosts
);

/**
 * @route POST /posts
 * @description Create a new post
 * @body { content, image }
 * @access Login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([body("content", "Missing content").exists().notEmpty()]),
  postController.createPost
);

/**
 * @route PUT /posts/:id
 * @description Edit a post with a specific id
 * @body { content, image }
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  postController.updateSinglePost
);

/**
 * @route DELETE /posts/:id
 * @description Delete a post with a specific id
 * @access Login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  postController.deleteSinglePost
);

/**
 * @route GET /posts/:id
 * @description Get a post with a specific id
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  postController.getSinglePost
);

/**
 * @route GET /posts/:id/comments
 * @description Get comments on a specific post
 * @access Login required
 */
router.get(
  "/:id/comments",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  postController.getCommentsOfPost
);

module.exports = router;
