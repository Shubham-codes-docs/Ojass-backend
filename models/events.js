const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const winnerSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  position: {
    type: Number,
    required: true,
  },
});

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
  winners: [
    {
      type: winnerSchema,
      required: false,
    },
  ],
});

module.exports = mongoose.model("Events", eventSchema);
