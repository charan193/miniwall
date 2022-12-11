const Post = require("../models/post");
const Comment = require("../models/comment");
const {
	body
} = require("express-validator");

const handleCreateValidationChain = [
	body("content").isLength({
		min: 6,
	}),
	body("postId").isLength({
		min: 6,
	}),
];

function handleCreate(req, res) {
	// get the post id from the url
	const postId = req.body.postId;
	// check if the post exists
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				return res.status(404).json({
					message: `Not found Post with id ${postId}`,
				});
			}

			// check if author is trying to comment on his own post
			if (post.createdBy.toString() === req.user.id) {
				return res.status(403).json({
					message: "You cannot comment on your own post",
				});
			}

			// create the comment
			const comment = new Comment({
				content: req.body.content,
				createdBy: req.user.id,
				post: postId,
			});

			comment.save()
				.then((data) => {
					// add the comment to the post
					post.comments.push(data._id);
					post.save().then(() => {
						res.status(201).json({
							message: "Comment created successfully",
							comment: data,
						});
					}).catch((err) => {
						res.status(500).json({
							message: err.message || "Some error occurred while creating the Comment.",
						});
					});
				}
				)
				.catch((err) => {
					res.status(500).json({
						message: err.message || "Some error occurred while creating the Comment.",
					});
				});
		}
		)
		.catch((err) => {
			res.status(500).json({
				message: err.message || `Error retrieving Post with id ${postId}`,
			});
		}
		);
}



module.exports = {
	handleCreate,
	handleCreateValidationChain,
};