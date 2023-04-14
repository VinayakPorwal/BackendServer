// Require the necessary modules
const cors = require("cors");
const bodyParser = require("body-parser");
// const path = require("path");
const db = require("./db");
// const authRouter = require("./routes/auth");
// const projectRouter = require("./routes/project");

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up middleware
app.use(bodyParser.json());
app.use(cors());

// // Set up routes
// app.use("/auth", authRouter);
// app.use("/projects", projectRouter);

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "no route handler found" }).end();
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});
