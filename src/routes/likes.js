const express = require("express");

const {
	handleCreate,
	handleCreateValidationChain
} = require("../controllers/likes");
const handleValidation = require("../utils/handleValidation");


const router = express.Router();

// Create a new Like
router.patch("/" , handleCreateValidationChain, handleValidation, handleCreate);

module.exports = router;