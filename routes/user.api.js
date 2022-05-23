const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const validators = require("../middlewares/validators");
const { body, param } = require("express-validator");
const bodyParser = require("body-parser");
const { loginRequired, isAdmin } = require("../middlewares/authentication");

const {
  register,
  loginEmailPassword,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  getUserRole,
  getSingleUser,
  deleteUser,
} = userController;

/**
 * @route POST /users
 * @description Register new user
 * @access Public
 */
router.post(
  "/regist",
  bodyParser,
  validators.validate([
    body("First name", "Invalid name").exists().notEmpty(),
    body("Last name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  register
);

/**
 * @route POST /users
 * @description Login by email and password
 * @access Login required
 */
router.post("/login", loginEmailPassword);

/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", loginRequired, getCurrentUser);

/**
 * @route GET /users?page=1&limit=10
 * @description Get users with pagination
 * @access Login required
 */
router.get("/userlist", loginRequired, getAllUsers);

/**
 * @route GET /users/:id
 * @description Get a user profile
 * @access Login required
 */
router.get(
  "/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  getSingleUser
);

/**
 * @route PUT /users/:id
 * @description Update user profile
 * @access Login required
 */
router.put("/me/update", loginRequired, updateProfile);

/**
 * @route DEL /users
 * @description Delete user by id
 * @access Login required
 */
router.delete("/delete/:userId", loginRequired, isAdmin, deleteUser);

router.get("/role/all", loginRequired, getUserRole);

module.exports = router;
