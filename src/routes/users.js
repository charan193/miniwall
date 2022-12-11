const express = require("express");
const handleValidation = require("../utils/handleValidation");

const {
	handleRegisterValidationChain,
	handleRegister,
	handleLogin
} = require("../controllers/users");


const router = express.Router();

router.post("/register", handleRegisterValidationChain, handleValidation, handleRegister);

router.post("/login", handleRegisterValidationChain, handleValidation, handleLogin);

module.exports = router;