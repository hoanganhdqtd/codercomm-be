const express = require("express");
const router = express.Router();

const authentication = require("../middlewares/authentication");

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");

const commentController = require("../controllers/comment.controller");

/**
 * @route POST /comments
 * @description Create a new comment
 * @body { content, postId }
 * @access Login required
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("postId", "Missing postId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  commentController.createComment
);

/**
 * @route PUT /comments/:id
 * @description Edit a comment with a specific id
 * @body { content }
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  commentController.updateSingleComment
);

/**
 * @route GET /comments/:id
 * @description Get detail of a comment with a specific id
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.getSingleComment
);

/**
 * @route DELETE /comments/:id
 * @description Delete a comment with a specific id
 * @access Login required
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.deleteSingleComment
);

module.exports = router;
