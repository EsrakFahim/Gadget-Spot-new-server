const express = require("express");
const router = express.Router();
const {  ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const {jwtVerify} = require('../../JwtVerify/JwtVerify')



// payment with stripe
router.post("/stripe", jwtVerify, async (req, res) => {
      const cartProduct = req.body;
      const newTran_id = new ObjectId().toString();

      const line_items = cartProduct?.map((items) => ({
            price_data: {
                  currency: "BDT",
                  product_data: {
                        name: items.productTitle,
                        // images:items?.productImage[1]?.imgData?.data?.display_url
                  },
                  unit_amount: items.currentPrice * 100,
            },
            quantity: items.productQuantity,
      }));

      try {
            const session = await stripe.checkout.sessions.create({
                  line_items: line_items,
                  mode: "payment",
                  success_url: `${process.env.CLIENT_SITE_URL}/payment/success/${newTran_id}`,
            });

            res.json({ id: session.id });
      } catch (error) {
            // Handle any errors that occur during the Stripe API call
            console.error("Error creating Stripe session:", error);
            res.status(500).json({
                  error: "Internal server error",
            });
      }
});

module.exports = router;
