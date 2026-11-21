const NewsletterSubscription = require("../models/NewsletterSubscription");

const subscribeNewsletter = async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    await NewsletterSubscription.updateOne(
      { email },
      { $setOnInsert: { email } },
      { upsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "You have successfully subscribed!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to subscribe at this time.",
    });
  }
};

module.exports = { subscribeNewsletter };
