const express = require("express");

const paymentRouter = express.Router();

const {
  createPayment,
updatePaymentStatus,
getPayments,
getPaymentById
} = require("../controllers/payment.controler.js");

const protect = require("../middleware/auth.middleware.js");
const roleCheck = require("../middleware/roleCheck.middleware.js");
const bodyParser = require("body-parser");

paymentRouter.use(protect);

paymentRouter.post("/initiate", roleCheck(["Client"]), createPayment);

paymentRouter.post("/update", roleCheck(["Admin" ]), updatePaymentStatus);

paymentRouter.get("/all", roleCheck(["Admin"]), getPayments);

paymentRouter.get("/:paymentId", roleCheck(["Admin" , "Client"]), getPaymentById);

module.exports = paymentRouter;
