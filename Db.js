const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://fookrey420:Vinayak%4002@cluster0.8mvxk.mongodb.net/fookreywebs?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("MongoDB connected!");
});
