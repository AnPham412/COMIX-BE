var express = require("express");
var router = express.Router();
const { loadData } = require("../models/Comic");

/**
 * @method : GET
 * @path: /
 * @description: get homepage
 * @access: public
 * @query: page (integer)
 **/

router.get("/", async function (req, res, next) {
  try {
    const loaded = await loadData();
    res.json(loaded);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
