
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = "access-token";


const createAccessToken = (user) => {
	return jwt.sign({ name: user.username, id: user._id }, ACCESS_TOKEN_SECRET, {
		expiresIn: "60m",
	});
};

const validateAccessToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.status(401).json({ message: "No token provided" });
	jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: "Invalid token" });
		req.user = user;
		next();
	});
};


module.exports = {
	createAccessToken,
	validateAccessToken
};