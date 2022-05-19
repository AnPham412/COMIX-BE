const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const data = require("./comix.json");

const loadData = async () => {
  const total = data.length;
  return { comic: data, total: total };
};

module.exports = { loadData };
