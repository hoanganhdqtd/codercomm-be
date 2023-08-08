const Friend = require("../models/Friend");
const User = require("../models/User");

const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

const friendController = {};

const calculateFriendCount = async (userId) => {
  const friendCount = await Friend.countDocuments({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  await User.findByIdAndUpdate(userId, { friendCount });
};

friendController.sendFriendRequest = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const toUserId = req.body.to;

  // Validation
  // check if toUserId exists
  const user = await User.findById(toUserId);
  if (!user) {
    throw new AppError(400, "User not found", "Send Friend Request Error");
  }

  // Process
  // check if any friend request between 2 users exists
  let friend = await Friend.findOne({
    $or: [
      { from: currentUserId, to: toUserId },
      { from: toUserId, to: currentUserId },
    ],
  });

  if (!friend) {
    // create a friend request
    friend = await Friend.create({
      from: currentUserId,
      to: toUserId,
      status: "pending",
    });
  } else {
    switch (friend.status) {
      // status === "pending" => error: already sent
      case "pending":
        if (friend.from.equals(currentUserId)) {
          throw new AppError(
            "400",
            "You have already sent a request to this user",
            "Add Friend Error"
          );
        } else {
          throw new AppError(
            400,
            "You have already received a request from this user",
            "Add Friend Error"
          );
        }

      // status === "accepted" => error: already friends
      case "accepted":
        throw new AppError(
          400,
          "The user is already your friend",
          "Add Friend Error"
        );

      // status === "declined" => update status to "pending"
      case "declined":
        friend.from = currentUserId;
        friend.to = toUserId;
        friend.status = "pending";
        await friend.save();
        return sendResponse(
          res,
          200,
          true,
          friend,
          null,
          "Request has been sent"
        );

      // ?
      default:
        throw new AppError(400, "Friend status undefined", "Add Friend Error");
    }
  }

  // Send response
  sendResponse(res, 200, true, friend, null, "Request has been sent");
});

// ?
friendController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    // Get data
    // ?
    let { page, limit, ...filter } = { ...req.query };
    const currentUserId = req.userId;

    // Validation
    let requestList = await Friend.find({
      to: currentUserId,
      status: "pending",
    });

    // Process
    const requestIds = requestList.map((friend) => {
      if (friend.from._id.equals(currentUserId)) {
        return friend.to;
      }
      return friend.from;
    });

    const filterConditions = [{ _id: { $in: requestIds } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }
    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 1;
    const count = await User.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    // Send response
    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages, count },
      null,
      "Get received friend requests successfully"
    );
  }
);

friendController.getSentFriendRequestList = catchAsync(
  async (req, res, next) => {
    // Get data
    let { page, limit, ...filter } = { ...req.query };
    const currentUserId = req.userId;

    // Validation
    let requestList = await Friend.find({
      from: currentUserId,
      status: "pending",
    });

    // Process
    const recipientIds = requestList.map((friend) => {
      if (friend.from._id.equals(currentUserId)) {
        return friend.to;
      }
      return friend.from;
    });

    const filterConditions = [{ _id: { $in: recipientIds } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }
    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 1;
    const count = await User.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    // Send response
    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages, count },
      null,
      "Get sent friend requests successfully"
    );
  }
);

friendController.getFriendList = catchAsync(async (req, res, next) => {
  // Get data
  let { page, limit, ...filter } = { ...req.query };
  const currentUserId = req.userId;

  // Validation
  let friendList = await Friend.find({
    $or: [{ from: currentUserId }, { to: currentUserId }],
    status: "accepted",
  });

  // Process
  // ?
  const friendIds = friendList.map((friend) => {
    if (friend.from._id.equals(currentUserId)) {
      return friend.to;
    }
    return friend.from;
  });

  const filterConditions = [{ _id: { $in: friendIds } }];
  if (filter.name) {
    filterConditions.push({ ["name"]: { $regex: filter.name, $options: "i" } });
  }
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 1;
  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // ?
  const usersWithFriendship = users.map((user) => {
    let temp = user.toJSON();
    temp.friendship = friendList.find((friendship) => {
      if (friendship.from.equals(user._id) || friendship.to.equals(user._id)) {
        return { status: friendship.status };
      }
      return false;
    });
    return temp;
  });

  // Send response
  return sendResponse(
    res,
    200,
    true,
    { users: usersWithFriendship, totalPages, count },
    null,
    "Get friend list successfully"
  );
});

// to update the friend request's "status" field
friendController.reactFriendRequest = catchAsync(async (req, res, next) => {
  // Get data
  const fromUserId = req.params.userId; // who sent (created) the friend request
  const currentUserId = req.userId; // who replied to the friend request
  const { status } = req.body; // "accepted" | "declined"

  // Validation
  // check if the user with fromUserId has sent a friend request
  // to the current user

  let friend = await Friend.findOne({
    from: fromUserId,
    to: currentUserId,
    status: "pending",
  });

  if (!friend) {
    throw new AppError(
      400,
      "Friend request not found",
      "Friend Request Reaction Error"
    );
  }

  // Process
  friend.status = status;
  await friend.save();

  // in case of "accepted", update friendCount for both
  if (status === "accepted") {
    await calculateFriendCount(currentUserId);
    await calculateFriendCount(fromUserId);
  }

  // Send response
  sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "React friend request successfully"
  );
});

friendController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId; // sender
  const toUserId = req.params.userId;

  // Validation
  const friend = await Friend.findOne({
    from: currentUserId,
    to: toUserId,
    status: "pending",
  });
  if (!friend) {
    throw new AppError(
      400,
      "Friend request not found",
      "Cancel Friend Request Error"
    );
  }

  // Process

  // friend.delete is not a function
  // ?
  // await friend.delete();
  await Friend.findOneAndDelete({
    from: currentUserId,
    to: toUserId,
    status: "pending",
  });

  // Send response
  sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "Friend request has been canceled"
  );
});

friendController.removeFriend = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId; // who wants to unfriend
  const friendId = req.params.userId;

  // Validation
  const friend = await Friend.findOne({
    $or: [
      { from: currentUserId, to: friendId },
      { from: friendId, to: currentUserId },
    ],
    status: "accepted",
  });

  if (!friend) {
    throw new AppError(400, "Friend not found", "Remove Friend Error");
  }

  // Process
  // await friend.delete(); // does not work

  await Friend.findOneAndDelete({
    $or: [
      { from: currentUserId, to: friendId },
      { from: friendId, to: currentUserId },
    ],
    status: "accepted",
  });

  await calculateFriendCount(currentUserId);
  await calculateFriendCount(friendId);

  // Send response
  sendResponse(res, 200, true, friend, null, "Remove friend successfully");
});

module.exports = friendController;
