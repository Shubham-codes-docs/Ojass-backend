const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Student = require("../models/studentUser");
const Event = require("../models/events");
const mailer = require("../utils/mailer");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const randomIdGenerator = require("../utils/randomIdGenerator");

exports.stripe = async (req, res, next) => {
  const paymentId = await stripe.customers.create({
    metadata: {
      userId: req.userId,
    },
  });

  const newUser = {};
  if (paymentId) {
    newUser.paymentId = paymentId.id;
  }

  await User.findByIdAndUpdate(req.userId, { $set: newUser }, { new: true });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    return next(error);
  }
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price_data: {
          currency: "inr",
          product_data: {
            name: "Registration fee",
          },
          unit_amount: 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer: paymentId.id,
    success_url: `https://www.ojass.org/success`,
    cancel_url: `https://www.ojass.org/home`,
  });

  // res.redirect(303, session.url);
  res.send({ url: session.url });
};

// Stripe webhoook

exports.webhook = async (req, res) => {
  let data;
  let eventType;
  // Webhook signing is recommended, but if the secret is not configured in `config.js`,
  // retrieve the event data directly from the request body.
  data = req.body.data.object;
  eventType = req.body.type;

  // Handle the checkout.session.completed event
  if (eventType === "checkout.session.completed") {
    paymentId = data.customer;
    const user = await User.findOne({ paymentId });
    const id = user._id;
    const newUser = {};
    newUser.paymentStatus = true;

    await User.findByIdAndUpdate(id, { $set: newUser }, { new: true });
  }

  res.status(200).end();
};

exports.verifyPayment = async (req, res, next) => {
  const id = req.userId;
  const user = await User.findById(id);

  if (user.paymentStatus === false) {
    const error = new Error("Payment not completed");
    error.statusCode = 200;
    return next(error);
  }
  success = true;
  res.json({ success });
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    return next(error);
  }
  const { studentType } = req.body;

  if (studentType !== "school") {
    const {
      name,
      branch,
      college,
      year,
      email,
      dob,
      photo,
      mobile,
      whatsapp,
      password,
      registrationId,
      bankName,
      accountNumber,
      ifscCode,
      accountName,
      accomodation,
      tshirtSize,
      studentType,
    } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const error = new Error("User with given emailId already exists");
        error.statusCode = 200;
        return next(error);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const otp = Math.floor(Math.random() * 9000 + 1000);
      const otpExpiration = Date.now() + 900000;
      const initials = name.charAt(0) + name.charAt(name.length - 1);
      const ojassId = await randomIdGenerator(initials, studentType);

      let mailOptions = {
        from: "ojass2023@nitjsr.ac.in",
        to: email,
        subject: "Verify account.",
        text: `You have successfully created your account for Ojass-2023. Your Ojass Id is ${ojassId}.Your otp for verification is ${otp}. This would expire after 15 minutes. 
        Please verify your account to successfully register for events`,
      };

      mailer.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          res.status(200).json({ msg: err });
        } else {
          console.log("Message Sent" + info);
        }
      });

      const newUser = new User({
        name,
        branch,
        college,
        year,
        email,
        dob,
        photo,
        mobile,
        whatsapp,
        password: hashedPassword,
        otp,
        otpExpiration,
        registrationId,
        bankName,
        accountNumber,
        ifscCode,
        accountName,
        ojassId,
        accomodation,
        tshirtSize,
        studentType,
      });

      await newUser.save();

      res
        .status(201)
        .json({ otp, success: 1, msg: "User registered successfully!" });
    } catch (err) {
      return next(new Error(err));
    }
  } else {
    try {
      const {
        name,
        schoolName,
        schoolClass,
        email,
        dob,
        photo,
        mobile,
        parentNumber,
        password,
        tshirtSize,
        studentType,
      } = req.body;
      const existingUser = await Student.findOne({ email });
      if (existingUser) {
        const error = new Error("User with given emailId already exists");
        error.statusCode = 200;
        return next(error);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const otp = Math.floor(Math.random() * 9000 + 1000);
      const otpExpiration = Date.now() + 900000;
      const initials = name.charAt(0) + name.charAt(name.length - 1);
      const ojassId = await randomIdGenerator(initials, studentType);

      let mailOptions = {
        from: "ojass2023@nitjsr.ac.in",
        to: email,
        subject: "Verify account.",
        text: `You have successfully created your account for Ojass-2023. Your Ojass Id is ${ojassId}.Your otp for verification is ${otp}. This would expire after 15 minutes. 
        Please verify your account to successfully register for events`,
      };

      mailer.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          res.status(200).json({ msg: err });
        } else {
          console.log("Message Sent" + info);
        }
      });

      const newUser = new Student({
        name,
        schoolName,
        schoolClass,
        email,
        dob,
        photo,
        mobile,
        parentNumber,
        password: hashedPassword,
        otp,
        otpExpiration,
        ojassId,
        studentType,
        tshirtSize,
      });

      await newUser.save();

      res
        .status(201)
        .json({ otp, success: 1, msg: "User registered successfully!" });
    } catch (err) {
      return next(new Error(err));
    }
  }
};

exports.resendOtp = async (req, res, next) => {
  const { email } = req.body;
  try {
    let user;
    user = User.findOne({ email });
    if (!user) {
      user = Student.findOne({ email });
    }
    const otp = Math.floor(Math.random() * 9000 + 1000);
    const otpExpiration = Date.now() + 900000;

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();
    let mailOptions = {
      from: "ojass2023@nitjsr.ac.in",
      to: email,
      subject: "Verify account.",
      text: `You have successfully created your account for Ojass-2023. Your Ojass Id is ${user.ojassId}.Your otp for verification is ${otp}. This would expire after 15 minutes. 
      Please verify your account to successfully register for events`,
    };

    mailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(200).json({ msg: err });
      } else {
        console.log("Message Sent" + info);
      }
    });
    res
      .status(201)
      .json({ otp, success: 1, msg: "User registered successfully!" });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.validateOtp = async (req, res, next) => {
  const { otp } = req.body;
  try {
    let user;
    user = await User.findOne({
      otp,
      otpExpiration: { $gt: Date.now() },
    });
    if (!user) {
      user = await Student.findOne({
        otp,
        otpExpiration: { $gt: Date.now() },
      });
    }
    if (!user) {
      const error = new Error("Invalid Otp");
      error.statusCode = 200;
      return next(error);
    } else {
      user.isVerified = true;
      await user.save();
      res
        .status(200)
        .json({ msg: "Account verified successfully", success: 1 });
    }
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    next(error);
  }
  const { email, password } = req.body;
  try {
    let user;
    console.log(email, password);
    user = User.findOne({ email });
    if (!user) {
      user = Student.findOne({ email });
    }
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.name,
          type: "user",
          ojassId: user.ojassId,
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({
        msg: "User logged in successfully",
        token,
        success: 1,
        ojassId: user.ojassId,
      });
    } else {
      res.status(200).json({ msg: "Passwords do not match", success: 0 });
    }
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.registerForSingleEvent = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { eventName } = req.body;

  try {
    let user;
    user = User.findById({ _id: req.userId });
    if (!user) {
      user = Student.findById({ _id: req.userId });
    }

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    if (
      user.paymentStatus == false &&
      eventName !== "Biz-Tech Quiz with a Scientific Twist"
    ) {
      const error = new Error("Payment not completed");
      error.statusCode = 200;
      return next(error);
    }

    if (!user.isVerified) {
      const error = new Error("User not verified");
      error.statusCode = 200;
      return next(error);
    }

    const event = await Event.findOne({ "Event Name": eventName });
    if (!event) {
      const error = new Error("No event found");
      error.statusCode = 200;
      return next(error);
    }

    if (user.paymentStatus == false) {
      const error = new Error("Payment not completed");
      error.statusCode = 200;
      return next(error);
    }

    user.events = [...user.events, event._id];
    event.participants = [...event.participants, user._id];
    await user.save();
    await event.save();
    let mailOptions = {
      from: "ojass2023@nitjsr.ac.in",
      to: user.email,
      subject: "Successfull Registration for Ojass 2023",
      text: `You have successfully registered for the event ${eventName} in Ojass-2023`,
    };

    mailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(200).json({ msg: err });
      } else {
        console.log("Message Sent" + info);
        res.status(200).json({ msg: "Email Sent" });
      }
    });

    res.status(200).json({ msg: "Registration successfull", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.createTeam = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { eventName, teamName, members } = req.body;

  try {
    let user;
    user = User.findById({ _id: req.userId });
    if (!user) {
      user = Student.findById({ _id: req.userId });
    }
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    if (user.paymentStatus == false) {
      const error = new Error("Payment not completed");
      error.statusCode = 200;
      return next(error);
    }

    if (!user.isVerified) {
      const error = new Error("User not verified");
      error.statusCode = 200;
      return next(error);
    }

    const event = await Event.findOne({ "Event Name": eventName });
    if (!event) {
      const error = new Error("No event found");
      error.statusCode = 200;
      return next(error);
    }

    if (event.minSize && event.minSize > members.length + 1) {
      const error = new Error(
        `There should be a minimum of ${event.minSize}members in the team`
      );
      error.statusCode = 200;
      return next(error);
    }

    if (event["Team Size"] < members.length + 1) {
      const error = new Error(
        `There should be a maximum of ${event["Team Size"]}members in the team`
      );
      error.statusCode = 200;
      return next(error);
    }

    const memberSearch = await User.find({
      ojassId: { $in: members },
      isVerified: true,
    });
    if (memberSearch.length !== members.length) {
      const invalidIds = memberSearch.filter(function (el) {
        return members.indexOf(el) < 0;
      });
      const error = new Error(
        `Please check the ids of the given users. Some of them are either incorrect or not verified`
      );
      error.statusCode = 200;
      return next(error);
    }

    const teamMembers = memberSearch.map((m) => {
      return {
        member: m._id,
        inviteStatus: false,
        mail: m.email,
      };
    });

    const team = {
      captain: user,
      teamName,
      event,
      members: [{ member: user._id, inviteStatus: true }, ...teamMembers],
    };

    user.eventsWithTeam = [...user.eventsWithTeam, team];
    const savedUser = await user.save();

    const teamId = savedUser.eventsWithTeam.filter((e) => {
      return e.event.equals(event._id);
    });

    event.participants = [...event.participants, teamId[0]._id];
    await event.save();
    let mailOptions = {
      from: "ojass2023@nitjsr.ac.in",
      to: user.email,
      subject: "Successfull Registration for Ojass 2023",
      html: `You have successfully registered for the event ${eventName} in Ojass-2023`,
    };

    mailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(200).json({ msg: err });
      } else {
        console.log("Message Sent" + info);
        res.status(200).json({ msg: "Email Sent" });
      }
    });

    teamMembers.forEach((m) => {
      let mailOptions = {
        from: "ojass2023@nitjsr.ac.in",
        to: m.mail,
        subject: "Invitation for team registeration ",
        html: `<p>You have been invited by ${user.name} 
        to join his team for the event ${eventName} in Ojass-2023.
        Click the button below to accept the invite.
        <a href="https://www.ojass.org/ConfirmInvite?eventName=${eventName}&captainEmail=${user.email}">Register</a>`,
      };

      mailer.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          res.status(200).json({ msg: err });
        } else {
          console.log("Message Sent" + info);
          res.status(200).json({ msg: "Email Sent" });
        }
      });
    });

    res.status(200).json({ msg: "Registration successfull", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.registerForTeamEvent = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { eventName, captainEmail } = req.body;

  try {
    let user;
    user = User.findById({ _id: req.userId });
    if (!user) {
      user = Student.findById({ _id: req.userId });
    }
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    if (user.paymentStatus == false) {
      const error = new Error("Payment not completed");
      error.statusCode = 200;
      return next(error);
    }

    if (!user.isVerified) {
      const error = new Error("User not verified");
      error.statusCode = 200;
      return next(error);
    }

    const event = await Event.findOne({ "Event Name": eventName });
    if (!event) {
      const error = new Error("No event found");
      error.statusCode = 200;
      return next(error);
    }

    let captain;
    captain = await User.findOne({
      email: captainEmail,
      "eventsWithTeam.event": event._id,
    });

    if (!captain) {
      captain = await Student.findOne({
        email: captainEmail,
        "eventsWithTeam.event": event._id,
      });
    }

    if (!captain) {
      const error = new Error("No captain has registered for this event");
      error.statusCode = 200;
      return next(error);
    }

    let team = captain.eventsWithTeam.filter((e) => {
      return e.event.equals(event._id);
    });
    const updatedTeam = team[0];
    updatedTeam.members.forEach((m) => {
      if (m.member.equals(user._id)) {
        m.inviteStatus = true;
      }
    });
    captain.updateOne(
      {
        $email: captainEmail,
        eventsWithTeam: { $elemMatch: { event: event._id } },
      },
      { $set: { "eventsWithTeam.$": updatedTeam } }
    );
    user.eventsWithTeam = [...user.eventsWithTeam, updatedTeam];
    await user.save();
    await captain.save();

    let mailOptions = {
      from: "ojass2023@nitjsr.ac.in",
      to: user.email,
      subject: "Successfull Registration for Ojass 2023",
      text: `You have successfully registered for the event ${eventName} in Ojass-2023`,
    };

    mailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(200).json({ msg: err });
      } else {
        console.log("Message Sent" + info);
        res.status(200).json({ msg: "Email Sent" });
      }
    });

    res.status(200).json({ msg: "Registration successfull", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  try {
    let user;
    user = User.findById({ _id: req.userId });
    if (!user) {
      user = Student.findById({ _id: req.userId });
    }
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }
    res.status(200).json({ ...user._doc, success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.editBankDetails = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { bankName, accountNumber, ifscCode, accountName } = req.body;

  try {
    let user;
    user = User.findById({ _id: req.userId });
    if (!user) {
      user = Student.findById({ _id: req.userId });
    }
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    user.bankName = bankName;
    user.accountNumber = accountNumber;
    (user.ifscCode = ifscCode), (user.accountName = accountName);
    await user.save();
    res
      .status(200)
      .json({ msg: "Account details updated successfully", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};
