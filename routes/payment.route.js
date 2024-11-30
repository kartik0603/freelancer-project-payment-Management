const express = require("express");

const paymentRouter = express.Router();

const {
  createPayment,
  stripeWebhook,
} = require("../controllers/payment.controler.js");

const protect = require("../middleware/auth.middleware.js");
const roleCheck = require("../middleware/roleCheck.middleware.js");
const bodyParser = require("body-parser");

paymentRouter.use(protect);

paymentRouter.post("/initite", roleCheck(["Client"]), createPayment);

paymentRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = paymentRouter;
