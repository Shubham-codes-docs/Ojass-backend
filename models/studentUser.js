const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const memberSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  inviteStatus: {
    type: Boolean,
    required: true,
  },
});

const teamSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Events",
    required: true,
  },
  members: [
    {
      type: memberSchema,
      required: false,
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

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    schoolClass: {
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
    parentNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    studentType: {
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
    paymentStatus: {
      type: Boolean,
      default: false,
      required: false,
    },
    paymentId: {
      type: String,
      required: false,
    },
    ojassId: {
      type: String,
      require: true,
    },
    tshirtSize: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("studentUser", studentSchema);
