const { body } = require("express-validator");
const Post = require("../models/post");
const Like = require("../models/likes");

const handleCreateValidationChain = [
	body("postId").isLength({
		min: 6,
	})
];

function handleCreate(req, res) {
	
	const postId = req.body.postId;
	Post.findById(postId)
		.populate("likes").populate("likes.createdBy")
		.then((post) => {
			if (!post) {
				return res.status(404).json({
					message: `Not found Post with id ${postId}`,
				});
			}

			// check if author is trying to like his own post
			if (post.createdBy.toString() === req.user.id) {
				return res.status(403).json({
					message: "You cannot like your own post",
				});
			}

			// check if user already liked the post
			const alreadyLiked = post.likes.find((like) => like.createdBy.toString() === req.user.id);
			if (alreadyLiked) {
				return res.status(200).json({
					message: "You already liked this post",
				});
			}

			// create a like
			const like = new Like({
				createdBy: req.user.id,
				post: postId,
			});

			// save like in the database
			like.save()
				.then((data) => {
					// add like to post
					post.likes.push(data._id);
					post.save().then(() => {
						res.status(201).json({
							message: "Like created successfully",
							like: data,
						});
					}).catch((err) => {
						res.status(500).json({
							message: err.message || "Some error occurred while creating the Like.",
						});
					});
				}
				)
				.catch((err) => {
					res.status(500).json({
						message: err.message || "Some error occurred while creating the Like.",
					});
				});
		})
		.catch((err) => {
			res.status(500).json({
				message: err.message || `Error retrieving Post with id ${postId}`,
			});
		}
		);
}




module.exports = {
	handleCreate,
	handleCreateValidationChain
};