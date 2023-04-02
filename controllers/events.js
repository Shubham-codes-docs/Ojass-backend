const Event = require("../models/events");
const User = require("../models/users");

exports.addEvents = async (req, res, next) => {
  const { name } = req.body;

  if (req.type !== "admin" || !req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    return next(error);
  }

  try {
    const newEvent = new Event({
      name,
    });
    await newEvent.save();
    res.status(201).json({ msg: "Event added successfully", success: 1 });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    next(error);
  }
};

exports.addWinnersToEvents = async (req, res, next) => {
  const { email, name, position } = req.body;

  if (req.type !== "admin" || !req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    return next(error);
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;
      return next(error);
    }
    const event = await Event.findOne({ "Event Name": name });
    if (!event) {
      const error = new Error("No event found");
      error.statusCode = 404;
      return next(error);
    }

    const winner = {
      id: user._id,
      position,
    };

    event.winners = [...event.winners, winner];
    await event.save();
    res.status(200).json({ msg: "Winner added", success: 1 });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    next(error);
  }
};

exports.addMin = async (req, res, next) => {
  const events = await Event.updateMany(
    { "TEAM SIZE": { $gt: 1 } },
    { $set: { minSize: 2 } }
  );
  res.status(200).json({ msg: "done" });
};

exports.deleteAllEvents = async (req, res, next) => {
  await Event.deleteMany({});
  res.status(200).json({ msg: "done" });
};
