const express = require("express");
const { body } = require("express-validator");
const admin = require("../controllers/admin");
const IS_AUTH = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty(),
  ],
  admin.adminSignUp
);

router.post(
  "/login",
  [body("email").trim().notEmpty(), body("password").trim().notEmpty()],
  admin.adminLogin
);

router.put("/toggle-tshirt-and-kit", IS_AUTH, admin.toggleTshirtOrKitStatus);

module.exports = router;
