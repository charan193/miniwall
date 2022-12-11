const { validateAccessToken } = require("../utils/jwtTokens");

function authorizeRoute ( req , res , next ) { 
	validateAccessToken(req, res, next);
}

module.exports = authorizeRoute;