
const { validationResult } = require("express-validator");

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {import("express").NextFunction} 
 * @returns 
 */
const checkValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {

		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

module.exports = checkValidation;