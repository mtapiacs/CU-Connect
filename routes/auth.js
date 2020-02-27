const express = require("express");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

//! LOGIN
// GET-POST => /login
router.get("/login", authController.getLogin);
router.post(
	"/login",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email.")
			.normalizeEmail(),
		body("password", "Password has to be valid.")
			.isLength({ min: 5 })
			.isAlphanumeric()
			.trim()
	],
	authController.postLogin
);

//! SIGNUP
// GET-POST => /signup
router.get("/signup", authController.getSignup);
router.post(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email!")
			.custom(async (value, { req }) => {
				const userDoc = await User.findOne({ email: value });
				if (userDoc) {
					return Promise.reject(
						"E-mail exists already, please pick a different one."
					);
				}
			})
			.normalizeEmail(),
		body(
			"password",
			"Please enter a password with only numbers and text and at least 5 characters."
		)
			.isLength({ min: 5 })
			.isAlphanumeric()
			.trim(),
		body("confirmPassword")
			.trim()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords have to match!");
				}
				return true;
			})
	],
	authController.postSignup
);

//! LOGOUT
// POST => /logout
router.post("/logout", isAuth.General, authController.postLogout);

//! PASSWORD REST
// GET-POST => /reset & GET /reset/:token
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);

// POST => /new-password
router.post("/new-password", authController.postNewPassword);

module.exports = router;
