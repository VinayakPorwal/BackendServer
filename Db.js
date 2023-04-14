const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

mongoose
  .connect(
    // for devlopment
    // "mongodb://localhost:27017/fookreywebs",
    //for production
    "mongodb+srv://fookrey420:Vinayak%4002@cluster0.8mvxk.mongodb.net/fookreywebs?retryWrites=true&w=majority",
    { useUnifiedTopology: true }
  )
  .catch((err) => console.log(err.reason));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error in connecting to database"));

db.once("open", function () {
  console.log("Connected to database db");
});

module.exports = db;
