const User = require("../models/user");
const {
	body
} = require("express-validator");
const tokenStuff = require("../utils/jwtTokens");

const handleRegisterValidationChain = [
	body("username").isLength({
		min: 3,
	}),
	body("password").isLength({
		min: 6,
	}),
];


function handleRegister(req, res) {
	const { username, password } = req.body;
	// Check if the user already exists
	User.findOne({
		username
	})
		.then((user) => {
			if (user) {
				return res.status(400).json({ message: "User already exists" });
			}

			const newUser = new User({ username, password });
			newUser.save()
				.then(() => {
					res.status(201).json({ message: "User created successfully" });
				})
				.catch((err) => {
					res.status(500).json({ message: err.message });
				});

		})
		.catch((err) => {
			res.status(500).json({ message: err.message });
		});
}


function handleLogin(req, res) {
	const { username, password } = req.body;
	User.findOne({ username })
		.then((user) => {
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			if (user.password !== password) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			const accessToken = tokenStuff.createAccessToken(user);

			res.status(200).json({ message: "Login successful", accessToken });
		})
		.catch((err) => {
			res.status(500).json({ message: err.message });
		});
}


module.exports = {
	handleRegister,
	handleRegisterValidationChain,
	handleLogin
};