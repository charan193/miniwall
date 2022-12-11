const Post = require("../models/post");
const {
	body
} = require("express-validator");

const handleCreateValidationChain = [
	body("title").isLength({
		min: 6,
	}),
	body("description").isLength({
		min: 6,
	}),
];

function handleCreate(req, res) {
	const post = new Post({
		title: req.body.title,
		description: req.body.description,
		createdBy: req.user.id,
	});
	post.save()
		.then((data) => {
			res.status(201).json({
				message: "Post created successfully",
				post: data,
			});
		}

		)
		.catch((err) => {
			res.status(500).json({
				message: err.message || "Some error occurred while creating the Post.",
			});
		});
}


function handleGetAll(req, res) {
	Post.find().populate("createdBy")
		.populate("comments").populate("comments.createdBy")
		.populate("likes").populate("likes.createdBy")
		.then((data) => {

			// Sort the posts by the number of likes, if the number of likes is the same, sort by the date of update
			data.sort((a, b) => {
				if (a.likes.length === b.likes.length) {
					return b.updatedAt - a.updatedAt;
				}
				return b.likes.length - a.likes.length;
			});

			// Sort the comments by the date of creation
			data.forEach((post) => {
				post.comments.sort((a, b) => b.createdAt - a.createdAt);
			});

			res.status(200).json({
				message: "Posts retrieved successfully",
				posts: data,
			});
		})
		.catch((err) => {
			res.status(500).json({
				message: err?.message || "Some error occurred while retrieving posts.",
			});
		}
		);
}

function handleGetById(req, res) {
	const id = req.params.id;
	Post.findById(id)
		.populate("createdBy")
		.populate("comments").populate("comments.createdBy")
		.populate("likes").populate("likes.createdBy")
		.then((data) => {
			if (!data) {
				res.status(404).json({
					message: `Not found Post with id ${id}`,
				});
			} else {
				res.status(200).json(data);
			}
		}

		)
		.catch((err) => {
			res.status(500).json({
				message: err.message || `Error retrieving Post with id ${id}`,
			});
		}
		);
}

module.exports = {
	handleCreate,
	handleCreateValidationChain,
	handleGetAll,
	handleGetById,
};