const mongoose = require("mongoose");
const app = require("./app");

require("dotenv").config();

const port = process.env.PORT || 3000;
const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
	console.log("MongoDB URL is not set");
	process.exit(1);
}

// remove deprication warning
mongoose.set("strictQuery", true);

console.log("Connecting to MongoDB...");
mongoose.connect(
	mongodbUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).then(() => {
	console.log("Connected to MongoDB");
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}).catch((err) => {
	console.log(err);
}
);


