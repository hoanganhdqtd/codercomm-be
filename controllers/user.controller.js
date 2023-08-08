const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const Friend = require("../models/Friend");
const bcrypt = require("bcryptjs");

const userController = {};

// userController.register = async (req, res, next) => {
//   try {
//     // Get data from request
//     const { name, email, password } = req.body;

//     // Validation
//     let user = await User.findOne({ email });
//     if (user) {

//     }

//     // Process

//     // Response
//     // res.send("User registration");
//     // sendResponse(res, statusCode, isSuccessful, data, error, message)
//     sendResponse(
//       res,
//       200,
//       true,
//       { name, email, password },
//       null,
//       "Create User successfully"
//     );
//   } catch (err) {
//     next(err);
//   }
// };

userController.register = catchAsync(async (req, res, next) => {
  // Get data from request
  let { name, email, password } = req.body;

  // Business logic validation
  let user = await User.findOne({ email });
  if (user) {
    throw new AppError(404, "User already exists", "Registration Error");
  }

  // Process

  // user = await User.create({ name, email, password });

  // encrypt password before saving to database
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });

  // JWT access token
  const accessToken = await user.generateToken();

  // Response
  // res.send("User registration");
  // sendResponse(res, statusCode, isSuccessful, data, error, message)
  sendResponse(
    res,
    200,
    true,
    // { name, email, password },
    { user, accessToken },
    null,
    "Create User successfully"
  );
});

userController.getUsers = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  let { page, limit, ...filter } = req.query;

  // Validation

  // page number
  page = parseInt(page) || 1;
  // number of results per page
  limit = parseInt(limit) || 10;

  // Process

  const filterConditions = [{ isDeleted: false }];

  if (filter.name) {
    filterConditions.push({
      name: { $regex: filter.name, $options: "i" },
    });
  }

  // filterCriteria: all filterConditions
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // count: number of users
  const count = await User.countDocuments(filterCriteria);

  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // add friendship field (relationship with the currentUser)
  // to each user
  const promises = users.map(async (user) => {
    let temp = user.toJSON();
    temp.friendship = await Friend.findOne({
      $or: [
        { from: currentUserId, to: user._id },
        { from: user._id, to: currentUserId },
      ],
    });
    return temp;
  });

  // list of users with relationship (friendship) with the
  // currentUser
  const usersWithFriendShip = await Promise.all(promises);

  // Send response
  return sendResponse(
    res,
    200,
    true,
    { users: usersWithFriendShip, totalPages, count },
    null,
    "Get users successfully"
  );
});

// used for refreshing
// browser gets accessToken from Local Storage
// => send accessToken to "/me" for the user's info
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  // Get data
  // req.userId: see authentication.loginRequired
  const currentUserId = req.userId;

  // Validation
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(400, "User not found", "Get Current User Error");
  }

  // Process

  // Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successfully"
  );
});

// used when opening a user's profile page
userController.getSingleUser = catchAsync(async (req, res, next) => {
  // Get data

  // currentUserId used for identifying relationship
  // between the current user and the user with the
  // specific id (friendship field)
  const currentUserId = req.userId;
  const userId = req.params.id;

  // Validation
  let user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, "User not found", "Get Single User Error");
  }

  // Process
  user = user.toJSON(); // to add friendship field
  user.friendship = await Friend.findOne({
    $or: [
      { from: currentUserId, to: userId },
      { from: userId, to: currentUserId },
    ],
  });

  // Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get single user successfully"
  );
});

userController.updateProfile = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const userId = req.params.id;

  // Validate
  // check if the current user is allowed to update profile
  // admin || currentUserId === userId
  if (currentUserId !== userId) {
    throw new AppError(400, "Permission required", "Update User Error");
  }
  let user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, "User not found", "Update User Error");
  }

  // Process

  // fields allowed to update
  const allows = [
    "name",
    "avatarUrl",
    "coverUrl",
    "aboutMe",
    "city",
    "country",
    "company",
    "jobTitle",
    "facebookLink",
    "instagramLink",
    "linkedinLink",
    "twitterLink",
    "isDeleted",
    "friendCount",
    "postCount",
  ];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();

  // Response
  return sendResponse(res, 200, true, user, null, "Update user successfully");
});

module.exports = userController;
