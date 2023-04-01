const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OjassIdSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("OjassId", OjassIdSchema);
