const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },

    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },

    aboutMe: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    company: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    facebookLink: { type: String, default: "" },
    instagramLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
    twitterLink: { type: String, default: "" },

    isDeleted: { type: Boolean, default: false, select: false },
    friendCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// overwrite methods
userSchema.methods.toJSON = function () {
  // remove fields from info returned
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};

// generate JWT
userSchema.methods.generateToken = async function () {
  // const accessToken = await jwt.sign({ _id: this._id, name: this.name, email: this.email }, JWT_SECRET_KEY, {
  //   expiresIn: "30d",
  // });
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
  return accessToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
