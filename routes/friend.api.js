const express = require("express");
const router = express.Router();

const authentication = require("../middlewares/authentication");

const validators = require("../middlewares/validators");

const { body, param } = require("express-validator");

const friendController = require("../controllers/friend.controller");

/**
 * @route POST /friends/requests
 * @description Send a friend request
 * @body { to: userId }
 * @access Login required
 */
router.post(
  "/requests",
  authentication.loginRequired,
  validators.validate([
    body("to").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.sendFriendRequest
);

// /friends/incoming
/**
 * @route GET /friends/requests/incoming
 * @description Get the list of received pending friend requests
 * @access Login required
 */
router.get(
  "/requests/incoming",
  authentication.loginRequired,
  friendController.getReceivedFriendRequestList
);

/**
 * @route GET /friends/requests/outgoing/
 * @description Get the list of sent pending friend requests
 * @access Login required
 */
router.get(
  "/requests/outgoing",
  authentication.loginRequired,
  friendController.getSentFriendRequestList
);

/**
 * @route GET /friends
 * @description Get the list of friends
 * @access Login required
 */
router.get("/", authentication.loginRequired, friendController.getFriendList);

/**
 * @route PUT /friends/requests/:userId
 * @description Accept / reject the friend request from a user with userId
 * @body { status: "accepted" or "declined" }
 * @access Login required
 */
router.put(
  "/requests/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    body("status").exists().isString().isIn(["accepted", "declined"]),
  ]),
  friendController.reactFriendRequest
);

/**
 * @route DELETE /friends/requests/:userId
 * @description Cancel the friend request to a user
 * @access Login required
 */
router.delete(
  "/requests/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.cancelFriendRequest
);

/**
 * @route DELETE /friends/:userId
 * @description Remove a friend (unfriend)
 * @access Login required
 */
router.delete(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.removeFriend
);

module.exports = router;
