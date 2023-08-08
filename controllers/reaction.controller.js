const mongoose = require("mongoose");
const Reaction = require("../models/Reaction");

const { catchAsync, sendResponse, AppError } = require("../helpers/utils");

const calculateReactions = async (targetId, targetType) => {
  const stats = await Reaction.aggregate([
    // ?
    // { $match: { targetId: mongoose.Types.ObjectId(targetId) } },
    { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
    {
      $group: {
        _id: "$targetId",
        like: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "like"] }, 1, 0],
          },
        },
        dislike: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "dislike"] }, 1, 0],
          },
        },
      },
    },
  ]);
  console.log("stats:", stats);
  // check if stats is not an empty array
  const reactions = {
    like: (stats[0] && stats[0].like) || 0,
    dislike: (stats[0] && stats[0].dislike) || 0,
  };

  await mongoose.model(targetType).findByIdAndUpdate(targetId, { reactions });
  return reactions;
};

const reactionController = {};

reactionController.saveReaction = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const { targetType, targetId, emoji } = req.body;

  // Validation
  // check if target exists

  // to get a document with targetId of a model (either Post or Comment)
  const targetObj = await mongoose.model(targetType).findById(targetId);
  if (!targetObj) {
    throw new AppError(400, `${targetType} not found`, "Create Reaction Error");
  }

  // find the reaction if exists
  let reaction = await Reaction.findOne({
    targetType,
    targetId,
    author: currentUserId,
  });

  // if there is no reaction in the DB => create new
  if (!reaction) {
    reaction = await Reaction.create({
      targetType,
      targetId,
      author: currentUserId,
      emoji,
    });
  } else {
    // if there is previous reaction in the DB => compare the emojis
    if (reaction.emoji === emoji) {
      // if they are the same, delete it

      // ?
      // await reaction.delete();

      await Reaction.deleteOne({
        targetType,
        targetId,
        author: currentUserId,
        emoji,
      });
    } else {
      // if they are not the same, save the last
      reaction.emoji = emoji;
      // await reaction.save(); // ? does not work
      await Reaction.save();
    }
  }

  // compute numbers of likes and dislikes
  const reactions = await calculateReactions(targetId, targetType);

  return sendResponse(
    res,
    200,
    true,
    reactions,
    null,
    "Save reaction successfully"
  );
});

module.exports = reactionController;
