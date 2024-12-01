require("dotenv").config();

const Payment = require("../models/payment.schema.js");
const Project = require("../models/project.schema.js");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// error handling
const handleError = (res, message, status = 500) => {
  console.error(message);
  return res.status(status).json({ error: message });
};

// Create a payment and initiate Stripe payment 
const createPayment = async (req, res) => {
  try {
      const { projectId, amount, currency } = req.body;

      if (!projectId || !amount || !currency) {
          return res.status(400).json({ error: 'Project ID, amount, and currency are required.' });
      }

    
      if (amount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than zero.' });
      }

      
      const project = await Project.findById(projectId);
      if (!project) {
          return res.status(404).json({ error: 'Project not found.' });
      }

      // Create a Stripe payment 
      const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), 
          currency: currency.toLowerCase(),
          metadata: { projectId: projectId },
      });

      // Save payment 
      const payment = new Payment({
          projectId,
          amount,
          currency,
          status: 'Pending',  
          stripePaymentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
      });

      await payment.save();

      res.status(201).json({
          message: 'Payment initiated successfully',
          clientSecret: paymentIntent.client_secret,
          payment,
      });

  } catch (error) {
      console.error('Error creating payment:', error);
      handleError(res, 'Failed to create payment. Please try again later.');
  }
};


// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ error: 'Payment ID and status are required.' });
    }

    const validStatuses = ['Pending', 'Paid', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

  
    const payment = await Payment.findOneAndUpdate(
      { _id: paymentId },
      { status: status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    res.status(200).json({
      message: `Payment status updated to ${status}`,
      payment,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    handleError(res, 'Failed to update payment status. Please try again later.');
  }
};

// Get all payments with project details and payment status
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; 
    const payments = await Payment.find()
      .populate('projectId', 'name description') 
      .select('amount currency status projectId stripePaymentId createdAt')
      .skip((page - 1) * limit) 
      .limit(parseInt(limit)); 

    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No payments found.' });
    }

    res.status(200).json({
      message: 'Payments fetched successfully',
      payments,
      pagination: {
        page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    handleError(res, 'Failed to fetch payments. Please try again later.');
  }
};

// Get payment by its ID 
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required.' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('projectId', 'name description') 
      .select('amount currency status projectId stripePaymentId createdAt')
      .lean(); 

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    res.status(200).json({
      message: 'Payment details fetched successfully',
      payment,
    });
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    handleError(res, 'Failed to fetch payment details. Please try again later.');
  }
};


  
  module.exports = { createPayment, updatePaymentStatus , getPayments, getPaymentById };