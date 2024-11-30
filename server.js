require("dotenv").config();
const express = require("express");
const path = require("path");

const cors = require("cors");
const bodyParser = require("body-parser");

const userRouter = require("./routes/user.route.js");
const projectRouter = require("./routes/project.route.js");
const paymentRouter = require("./routes/payment.route.js");
connectDB = require("./config/db.js");

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));


app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);


app.get("/", (req, res) => {
  res.send("Quiz Application");
});



// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Set the server to listen on a port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
