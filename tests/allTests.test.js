const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config({path: ".env.test"});

// remove deprication warning
mongoose.set("strictQuery", true);

/* Connecting to the database before each test. */
beforeEach(async () => {
	await mongoose.connect(process.env.MONGODB_URL);
});

/* Dropping the database and closing connection after each test. */
afterEach(async () => {
	// await mongoose.connection.dropCollection("users");
	// await mongoose.connection.dropCollection("posts");
	// await mongoose.connection.dropCollection("comments");
	// await mongoose.connection.dropCollection("likes");
	// await mongoose.connection.close();
});

// Drop the database and close the connection after all tests.
afterAll(async () => {
	// Since user is not allowed to drop the database, we will drop the collections instead.
	await mongoose.connection.dropCollection("users");
	await mongoose.connection.dropCollection("posts");
	await mongoose.connection.dropCollection("comments");
	await mongoose.connection.dropCollection("likes");
	await mongoose.connection.close();
});


// Caching between tests
const usersToBeCreated = [
	"Olga",
	"Nick",
	"Mary"
];

const password = "123456";
const cache = {
	users: {
		Olga: {
			accessToken: null,
			posts: [],
			comments: [],
			likes: [],
		},
		Nick: {
			accessToken: null,
			posts: [],
			comments: [],
			likes: [],
		},
		Mary: {
			accessToken: null,
			posts: [],
			comments: [],
			likes: [],
		},
	}
};


/* Testing the API endpoints. */

/* Create a new User */
describe("Olga, Nick and Mary register in the application and access the API.", () => {
	it("should create a new users - Olga, Nick, Mary", async () => {

		for (let i = 0; i < usersToBeCreated.length; i++) {
			const userName = usersToBeCreated[i];
			const res = await request(app).post("/api/users/register").send({
				username: userName,
				password: password,
			});
			expect(res.statusCode).toBe(201);
			expect(res.body).toHaveProperty("message", "User created successfully");
		}
	});
});

// Olga, Nick and Mary will use the oAuth v2 authorisation service to get their tokens.
// The tokens will be used to access the API endpoints.
describe("Olga, Nick and Mary will use the oAuth v2 authorisation service to get their tokens.", () => {
	it("should login the users - Olga, Nick, Mary", async () => {
		for (let i = 0; i < usersToBeCreated.length; i++) {
			const userName = usersToBeCreated[i];
			const res = await request(app).post("/api/users/login").send({
				username: userName,
				password: password,
			});
			expect(res.statusCode).toBe(200);
			expect(res.body).toHaveProperty("message", "Login successful");
			expect(res.body).toHaveProperty("accessToken");
			cache.users[userName].accessToken = res.body.accessToken;
		}
	});
});


// Olga calls the API (any endpoint) without using a token. This call should be unsuccessful as the user is unauthorised.
describe("Olga calls the API without using a token", () => {
	it("should return 401", async () => {
		const res = await request(app).get("/api/posts");
		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "No token provided");
	});
});

// Olga posts a text using her token.
describe("Olga posts a text using her token", () => {
	it("should return 201", async () => {
		const res = await request(app).post("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Olga.accessToken}`
		}).send({
			title: "Olga's post",
			description: "Olga's post description",
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("message", "Post created successfully");
		cache.users.Olga.posts.push(res.body.post);
	});
});

// Nick posts a text using his token.
describe("Nick posts a text using his token", () => {
	it("should return 201", async () => {
		const res = await request(app).post("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Nick.accessToken}`
		}).send({
			title: "Nick's post",
			description: "Nick's post description",
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("message", "Post created successfully");
		cache.users.Nick.posts.push(res.body.post);
	});
});

// Mary posts a text using her token.
describe("Mary posts a text using her token", () => {
	it("should return 201", async () => {
		const res = await request(app).post("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Mary.accessToken}`
		}).send({
			title: "Mary's post",
			description: "Mary's post description",
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("message", "Post created successfully");
		cache.users.Mary.posts.push(res.body.post);
	});
});

// Nick and Olga browse available posts in chronological order in the MiniWall; there should be three posts available. 
// Note, that we don’t have any likes yet.
describe("Nick and Olga browse available posts in chronological order in the MiniWall", () => {
	it("should return 200", async () => {
		// Olga browses the posts.
		const res = await request(app).get("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Nick.accessToken}`
		});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Posts retrieved successfully");
		expect(res.body.posts.length).toBe(3);
		// Check if the posts are in chronological order.
		expect(res.body.posts[0].title).toBe(cache.users.Mary.posts[0].title);
		expect(res.body.posts[1].title).toBe(cache.users.Nick.posts[0].title);
		expect(res.body.posts[2].title).toBe(cache.users.Olga.posts[0].title);
	});
});

// Nick and Olga comment Mary’s post in a round-robin fashion (one after the other).
describe("Nick and Olga comment Mary’s post in a round-robin fashion", () => {
	it("should return 201", async () => {
		// Olga comments Mary's post.
		const res = await request(app).post("/api/comments").set({
			"Authorization": `Bearer ${cache.users.Olga.accessToken}`
		}).send({
			postId: cache.users.Mary.posts[0].id,
			content: "Olga's comment",
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("message", "Comment created successfully");
		cache.users.Olga.comments.push(res.body.comment);

		// Nick comments Mary's post.
		const res2 = await request(app).post("/api/comments").set({
			"Authorization": `Bearer ${cache.users.Nick.accessToken}`
		}).send({
			postId: cache.users.Mary.posts[0].id,
			content: "Nick's comment",
		});
		expect(res2.statusCode).toBe(201);
		expect(res2.body).toHaveProperty("message", "Comment created successfully");
	});
});

// Mary comments her post. This call should be unsuccessful; an owner cannot comment owned posts.
describe("Mary comments her post", () => {
	it("should return 403", async () => {
		const res = await request(app).post("/api/comments").set({
			"Authorization": `Bearer ${cache.users.Mary.accessToken}`
		}).send({
			postId: cache.users.Mary.posts[0].id,
			content: "Mary's comment",
		});
		expect(res.statusCode).toBe(403);
		expect(res.body).toHaveProperty("message", "You cannot comment on your own post");
	});
});

// Mary can see posts in a chronological order (newest posts are on the top as there are no likes yet).
describe("Mary can see posts in a chronological order", () => {
	it("should return 200", async () => {
		const res = await request(app).get("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Mary.accessToken}`
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Posts retrieved successfully");
		expect(res.body.posts.length).toBe(3);
		// Check if the posts are in chronological order.
		expect(res.body.posts[0].title).toBe(cache.users.Mary.posts[0].title);
		expect(res.body.posts[1].title).toBe(cache.users.Nick.posts[0].title);
		expect(res.body.posts[2].title).toBe(cache.users.Olga.posts[0].title);
	});
});


// Mary can see the comments for her posts.
describe("Mary can see the comments for her posts", () => {
	it("should return 200", async () => {
		const res = await request(app).get("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Mary.accessToken}`
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Posts retrieved successfully");
		expect(res.body.posts.length).toBe(3);
		// find Mary's post
		const post = res.body.posts.find(post => post.id === cache.users.Mary.posts[0].id);
		expect(post.comments.length).toBe(2);
		expect(post.comments[0].content).toBe("Nick's comment");
		expect(post.comments[1].content).toBe("Olga's comment");
	});
});

// Nick and Olga like Mary’s posts.
describe("Nick and Olga like Mary’s posts", () => {
	it("should return 201", async () => {
		// Olga likes Mary's post.
		const res = await request(app).patch("/api/likes").
			set({
				"Authorization": `Bearer ${cache.users.Olga.accessToken}`
			}).send({
				postId: cache.users.Mary.posts[0].id,
			});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("message", "Like created successfully");
		cache.users.Olga.likes.push(res.body.like);
			
		// Nick likes Mary's post.
		const res2 = await request(app).patch("/api/likes").
			set({
				"Authorization": `Bearer ${cache.users.Nick.accessToken}`
			}).send({
				postId: cache.users.Mary.posts[0].id,
			});

		expect(res2.statusCode).toBe(201);
		expect(res2.body).toHaveProperty("message", "Like created successfully");
		cache.users.Nick.likes.push(res2.body.like);
	});
});

// Mary likes her posts. This call should be unsuccessful; an owner cannot like their posts.
describe("Mary likes her posts", () => {
	it("should return 403", async () => {
		const res = await request(app).patch("/api/likes").set({
			"Authorization": `Bearer ${cache.users.Mary.accessToken}`
		}).send({
			postId: cache.users.Mary.posts[0].id,
		});
		expect(res.statusCode).toBe(403);
		expect(res.body).toHaveProperty("message", "You cannot like your own post");
	});
});

// Mary can see that there are two likes in her posts.
describe("Mary can see that there are two likes in her posts", () => {
	it("should return 200", async () => {
		const res = await request(app).get("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Mary.accessToken}`
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Posts retrieved successfully");
		expect(res.body.posts.length).toBe(3);
		// find Mary's post
		const post = res.body.posts.find(post => post.id === cache.users.Mary.posts[0].id);
		expect(post.likes.length).toBe(2);
		expect(post.likes[0].userId).toBe(cache.users.Olga.id);
		expect(post.likes[1].userId).toBe(cache.users.Nick.id);
	});
});

// Nick can see the list of posts, since Mary’s post has two likes it is shown at the top.
describe("Nick can see the list of posts, since Mary’s post has two likes it is shown at the top", () => {
	it("should return 200", async () => {
		const res = await request(app).get("/api/posts").set({
			"Authorization": `Bearer ${cache.users.Nick.accessToken}`
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Posts retrieved successfully");
		expect(res.body.posts.length).toBe(3);
		// Check if the posts are in chronological order.
		expect(res.body.posts[0].title).toBe(cache.users.Mary.posts[0].title);
		expect(res.body.posts[1].title).toBe(cache.users.Nick.posts[0].title);
		expect(res.body.posts[2].title).toBe(cache.users.Olga.posts[0].title);
	});
});
