const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Friend = require("../models/Friend");
const userController = {};

//1. Create account by email and password and name
userController.register = catchAsync(async (req, res, next) => {
  let { Fname, Lname, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) throw new AppError(409, "Email already exists", "Register Error");

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({
    Fname,
    Lname,
    email,
    password,
  });
  const accessToken = user.generateToken();
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successful"
  );
});

// 2. Users can login with email and password
userController.loginEmailPassword = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }, "+password");
  if (!user) {
    throw new AppError(400, "User not found", "Login error");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(400, "Password is not valid", "Login error");
  }
  const accessToken = user.generateToken();

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login successful"
  );
});

// 3. Owner can see their information
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(400, "User not found", "Get Current User Error");

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successful"
  );
});

// 4. Owner update profile
userController.updateProfile = catchAsync(async (req, res, next) => {
  let { newPassword, confirmPassword } = req.body;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user)
    throw new AppError(404, "Account not found", "Update Profile Error");

  const allows = ["name", "avatarUrl", "coverUrl", "about me"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  if (newPassword && confirmPassword) {
    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (isMatch) {
      throw new AppError(
        400,
        "New password must be different from old password",
        "Update user error"
      );
    }
    if (newPassword !== confirmPassword) {
      throw new AppError(
        400,
        "New Password and Confirm Password are not match",
        "Update user error"
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(newPassword, salt);
      user.password = password;
    }
  } else if (newPassword || confirmPassword) {
    throw new AppError(400, "Missing Password info", "Update user error");
  }
  await user.save();

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update Profile successfully"
  );
});

// 5. Users can see users list
userController.getAllUsers = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const filterConditions = [{ isDeleted: false, roles: "guest" }];
  const allow = ["name", "email"];
  allow.forEach((field) => {
    if (filter[field] !== undefined) {
      filterConditions.push({
        [field]: { $regex: filter.name, $options: "i" },
      });
    }
  });
  const filterCrireria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await User.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

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
  const usersWithFriendship = await Promise.all(promises);

  return sendResponse(
    res,
    200,
    true,
    { users: usersWithFriendship, totalPages, count },
    null,
    "Get all users successful"
  );
});

userController.getUserRole = catchAsync(async (req, res, next) => {
  const user = await User.find({ roles: "guest" });
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Get all user successful"
  );
});

// 6. User can see others information by id
userController.getSingleUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.id;

  let user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found", "Get Single User Error");

  user = user.toJSON();
  user.friendship = await Friend.findOne({
    $or: [
      { from: currentUserId, to: user._id },
      { from: user._id, to: currentUserId },
    ],
  });

  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "get single user successful"
  );
});

// 7. Admin can deactivate account by id
userController.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  let user = await User.findOneAndDelete({ _id: userId });
  if (!user) {
    throw new AppError(404, "User not found", "Update error ");
  }
  return sendResponse(res, 200, true, {}, null, "Delete User successful");
});

module.exports = userController;
