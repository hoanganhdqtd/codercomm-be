const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

/**
 * @route POST /users
 * @description Register
 * @body { name, email, password }
 * @access Public
 */

// the controllers still run if validators.validate() is not executed
router.post(
  "/",
  // body("name").isString().trim().notEmpty(),

  // body("name", "Invalid name").exists().trim().notEmpty(),
  validators.validate([
    // body("name", "Invalid name").exists().notEmpty(),

    // error message repetition when there're some missing fields
    // body("name", "Invalid name").exists().trim().notEmpty()

    // use bail() to solve error message repetition
    // when there're many validation steps on a single field
    body("name", "Invalid name").exists().bail().trim().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .bail()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().bail().notEmpty(),
  ]),
  userController.register
);

/**
 * @route GET /users?page=1&limit=10
 * @description Get users with pagination
 * @access Login required
 */
router.get("/", authentication.loginRequired, userController.getUsers);

/**
 * @route GET /users/me
 * @description Get current user's info
 * @access Login required
 */
router.get("/me", authentication.loginRequired, userController.getCurrentUser);

/**
 * @route GET /users/:id
 * @description Get a user's profile
 * @access Login required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.getSingleUser
);

/**
 * @route PUT /users/:id
 * @description update user's profile
 * @body { name, avatarUrl, coverUrl, aboutMe, city, country, company, jobTitle, facebookLink, instagramLink, linkedinLink, twitterLink }
 * @access Login required
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  userController.updateProfile
);

module.exports = router;
