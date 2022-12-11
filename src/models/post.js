const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
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
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Likes",
		},
	],
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comments",
		},
	],
});

// This is a pre-hook that will be called before the information is sent out
postSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

// This is a pre-hook that will be called before the information is saved into the database
postSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});


module.exports = mongoose.model("Posts", postSchema);
