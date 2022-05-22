var express = require("express");
var router = express.Router();
const { loadData } = require("../models/Read_Comic");
const validators = require("../middlewares/validators");
const { loginRequired } = require("../middlewares/authentication");
const { header, body } = require("express-validator");
const { createNewPost } = require("../controller/post.controller");

/**
 * @method : GET
 * @path: /
 * @description: get comic list
 * @access: public
 **/

router.get("/", async function (req, res, next) {
  try {
    const loaded = await loadData();
    res.json(loaded);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @method : GET
 * @path: /
 * @description: get single comic
 * @access: public
 * @query: page (integer)
 **/

router.get("/:id", async function (req, res, next) {
  try {
    const loaded = await loadData();
    const { id } = req.params;
    const article = loaded.comic.filter((load) => load["article_id"] === id);
    res.json(article);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @method : POST
 * @path: /
 * @description: post comic
 * @access: login required
 * @query: page (integer)
 **/
router.post(
  "/crarticle",
  loginRequired,
  validators.validate([
    header("title", "Missing title").exists().notEmpty(),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  createNewPost
);

module.exports = router;
