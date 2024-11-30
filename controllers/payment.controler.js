const Payment = require("../models/payment.schema.js");
const Project = require("../models/project.schema.js");

const stripe = require("stripe");
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
  
      // Validate amount is greater than zero
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than zero.' });
      }
  
      // Fetch the associated project to ensure its validity
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
  
  
  const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
     
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
  
       
        const payment = await Payment.findOneAndUpdate(
          { stripePaymentId: paymentIntent.id },
          { status: 'Paid' },
          { new: true }
        );
  
        if (!payment) {
          console.error('Payment record not found for stripePaymentId:', paymentIntent.id);
          return res.status(404).json({ error: 'Payment record not found.' });
        }
  
        console.log(`Payment ${paymentIntent.id} succeeded.`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
  
        
        const payment = await Payment.findOneAndUpdate(
          { stripePaymentId: paymentIntent.id },
          { status: 'Failed' },
          { new: true }
        );
  
        if (!payment) {
          console.error('Payment record not found for stripePaymentId:', paymentIntent.id);
          return res.status(404).json({ error: 'Payment record not found.' });
        }
  
        console.error(`Payment ${paymentIntent.id} failed.`);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
   
    res.json({ received: true });
  };
  
  module.exports = { createPayment, stripeWebhook };