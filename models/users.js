const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Events",
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  captain: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    registrationId: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Events",
      },
    ],
    eventsWithTeam: [
      {
        type: teamSchema,
        required: false,
      },
    ],
    kit: {
      type: Boolean,
      required: false,
    },
    tshirt: {
      type: Boolean,
      required: false,
    },
    bankName: {
      type: String,
      required: false,
    },
    accountNumber: {
      type: String,
      required: false,
    },
    ifscCode: {
      type: String,
      required: false,
    },
    accountName: {
      type: String,
      required: false,
    },
    otp: {
      type: Number,
      required: false,
    },
    otpExpiration: {
      type: Number,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
