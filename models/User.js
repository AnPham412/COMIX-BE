const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    aboutMe: { type: String },
    avatarUrl: { type: String, require: false, default: "" },
    coverUrl: { type: String, require: false, default: "" },

    postCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, select: false },
    roles: {
      type: String,
      require: true,
      enum: ["admin", "guest"],
      default: "staff",
    },
  },
  { timestamps: true }
);

userSchema.plugin(require("./plugins/isDeletedFalse"));

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.isDeleted;
  return obj;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign(
    { _id: this._id, role: this.role },
    JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  return accessToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
