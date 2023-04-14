// // Require the necessary modules
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const path = require("path");
// const db = require("./Db");
// const authRouter = require("./routes/auth");
// const projectRouter = require("./routes/project");

// // Create a new express app
// const app = express();

// // Set up middleware
// app.use(bodyParser.json());
// app.use(cors());

// // Set up routes
// app.use("/auth", authRouter);
// app.use("/projects", projectRouter);

// app.get("/", async (req, res) => {
//   res.sendFile(path.join(__dirname, "./index.html"));
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "no route handler found" }).end();
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});
