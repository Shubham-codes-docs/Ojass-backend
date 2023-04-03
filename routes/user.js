const express = require("express");
const { body } = require("express-validator");
const user = require("../controllers/user");
const IS_AUTH = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().notEmpty(),
    body("branch").trim().notEmpty(),
    body("college").trim().notEmpty(),
    body("year").trim().notEmpty(),
    body("email").trim().notEmpty().isEmail(),
    body("dob").trim().notEmpty(),
    body("photo").trim().notEmpty(),
    body("mobile").trim().notEmpty().isLength({ min: 10, max: 10 }),
    body("password").trim().notEmpty(),
  ],
  user.signup
);

router.post("/validate-otp", user.validateOtp);
router.post("/resend-otp", user.resendOtp);

router.post(
  "/login",
  [body("email").trim().notEmpty(), body("password").trim().notEmpty()],
  user.login
);

router.post("/register-single-event", IS_AUTH, user.registerForSingleEvent);
router.post("/register-team", IS_AUTH, user.createTeam);
router.post("/confirm-team-invite", IS_AUTH, user.registerForTeamEvent);

router.get("/get-user-by-id", IS_AUTH, user.getUserById);

router.post("/create-checkout-session", IS_AUTH, user.stripe);

router.post("/verify-payment", IS_AUTH, user.verifyPayment);

router.post("/webhook", user.webhook);

module.exports = router;
