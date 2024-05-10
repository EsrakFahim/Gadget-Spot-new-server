const express = require('express');
const router = express.Router();
const {getCollection} = require('../../../Config/DBConfig')
const {jwtVerify} = require('../../../JwtVerify/JwtVerify')

router.post("/:trnID",/* jwtVerify, */ async (req, res) => {
      // console.log('success url hit')
      const productCartCollection = getCollection('productsCart');
      const userOrderCollection = getCollection('Orders');
      try {
            const query = {
                  tran_id: req.params.trnID,
            };
            const userCartProducts = await productCartCollection
                  .find(query)
                  .toArray();

                  userCartProducts.paymentStatus = true; // Update paymentStatus to true
                  userCartProducts.paymentCompleteTime = new Date(); // Add new payment complete date

            // console.log(userCartProducts)
            // Update paymentStatus to true and insert each document into userOrderCollection
            for (const product of userCartProducts) {
                  product.paymentStatus = true; // Update paymentStatus to true
                  product.paymentCompleteTime = new Date(); // Add new payment complete date
                  await userOrderCollection.insertOne(product);
            }

            // Delete the corresponding cart data from productCartCollection
            const deleteCartData =
                  await productCartCollection.deleteMany(query);
            if (deleteCartData?.deletedCount > 0) {
                  res.redirect(
                        `${process.env.CLIENT_SITE_URL}/payment/success/${req.params.trnID}`
                  );
            } else {
                  res.status(500).send(
                        "An error occurred during payment processing."
                  );
            }

            // Redirect to the desired URL after successful payment processing
      } catch (error) {
            // Handle errors gracefully
            console.error(
                  "Error occurred during payment processing:",
                  error
            );
            // Send an error response to the client
            res.status(500).send(
                  "An error occurred during payment processing."
            );
      }
});

module.exports = router;