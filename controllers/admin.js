const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const User = require("../models/users");

exports.adminSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    return next(error);
  }
  const { email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      const error = new Error("Admin with given emailId already exists");
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ success: 1, msg: "Admin registered successfully!" });
  } catch (err) {
    return next(new Error(err));
  }
};

exports.adminLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    next(error);
  }
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      const error = new Error("No user found");
      error.statusCode = 404;
      return next(error);
    }
    const result = await bcrypt.compare(password, admin.password);
    if (result) {
      const token = jwt.sign(
        {
          adminId: admin._id,
          type: "admin",
        },
        process.env.JWT_SECRET
      );
      res
        .status(200)
        .json({ msg: "User logged in successfully", token, success: 1 });
    } else {
      res.status(200).json({ msg: "Passwords do not match", success: 0 });
    }
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.toggleTshirtOrKitStatus = async (req, res, next) => {
  if (!req.isAuth && req.type !== "admin") {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    return next(error);
  }

  const { item, status } = req.body;

  try {
    const user = await User.findById({ _id: req.userId });
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;
      return next(error);
    }

    user[item] = status;
    await user.save();
    res
      .status(200)
      .json({ msg: `${item} status updated successfully`, success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};
