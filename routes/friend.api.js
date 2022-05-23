const express = require("express");
const router = express.Router();
const { loginRequired } = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const friendController = require("../controller/friend.controller");
const { body, param } = require("express-validator");

/**
 * @route POST /friends/requests
 * @description Send a friend request
 * @access Login required
 */
router.post(
  "/requests",
  loginRequired,
  validators.validate([
    body("to").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.sendFriendRequest
);

/**
 * @route GET /friends/requests/incoming
 * @description Get the list of received pending requests
 * @access Login required
 */
router.get(
  "/requests/incoming",
  loginRequired,
  friendController.getReceivedFriendRequestList
);

/**
 * @route GET /friends/requests/outgoing
 * @description Get the list of sent pending requests
 * @access Login required
 */
router.get(
  "/requests/outgoing",
  loginRequired,
  friendController.getSentFriendRequestList
);

/**
 * @route PUT /friends/requests/:userId
 * @description Accept/Reject a received pending requests
 * @access Login required
 */
router.put(
  "/requests/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    body("status").exists().isString().isIn(["accepted", "declined"]),
  ]),
  friendController.reactFriendRequest
);

/**
 * @route DELETE /friends/requests/:userId
 * @description Cancel a friend request
 * @access Login required
 */
router.delete(
  "/requests/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.cancelFriendRequest
);

/**
 * @route GET /friends
 * @description Get the list of friends
 * @access Login required
 */
router.get("/friendlist", loginRequired, friendController.getFriendList);

/**
 * @route DELETE /friends/:userId
 * @description Remove a friend
 * @access Login required
 */
router.delete(
  "/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.removeFriend
);

module.exports = router;
