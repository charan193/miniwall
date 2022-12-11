const express = require("express");
const handleValidation = require("../utils/handleValidation");

const {
	handleCreate, 
	handleCreateValidationChain, 
} = require("../controllers/comments");


const router = express.Router();

// Create a new Comment
router.post("/",
	handleCreateValidationChain, handleValidation, handleCreate);

module.exports = router;