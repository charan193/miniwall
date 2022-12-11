const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Users",
		required: true,
	},
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Posts",
		required: true,
	},
});

// This is a pre-hook that will be called before the information is sent out
likeSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

module.exports = mongoose.model("Likes", likeSchema);
