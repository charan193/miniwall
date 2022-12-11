const express = require("express");
const handleValidation = require("../utils/handleValidation");

const {
	handleCreate, 
	handleCreateValidationChain, 
	handleGetAll, 
	handleGetById
} = require("../controllers/posts");


const router = express.Router();

router.post("/",
	handleCreateValidationChain, handleValidation, handleCreate);
router.get("/", handleGetAll);
router.get("/:id", handleGetById);

module.exports = router;