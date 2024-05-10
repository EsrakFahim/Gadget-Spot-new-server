const express = require("express");
const router = express.Router();
const SSLCommerzPayment = require("sslcommerz-lts");
const {  ObjectId } = require("mongodb");
const crypto = require("crypto");
const { getCollection } = require("../../Config/DBConfig");
const { jwtVerify } = require("../../JwtVerify/JwtVerify");

const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
const is_live = false;

//  payment section
router.post("/SSLCommerz", jwtVerify, async (req, res) => {
      const productCartCollection = getCollection("productsCart");
      const { email, uid } = req.body.currentPaymentUser;
      const newTran_id = new ObjectId().toString();

      // Get the current date and time
      const timestamp = new Date().toISOString().replace(/[-:]/g, "");

      // Generate a random alphanumeric string (you can adjust the length as needed)
      const randomString = crypto.randomBytes(4).toString("hex");

      // Concatenate the timestamp and random string
      const orderNumber = "#" + timestamp + randomString;

      // Hash the concatenated string to ensure uniqueness
      const hashedOrderNumber = crypto
            .createHash("sha1")
            .update(orderNumber)
            .digest("hex");

      const query = {
            userEmail: email,
            userAuthUID: uid,
      };

      //get user all cart product data
      const userCartProducts = await productCartCollection
            .find(query)
            .toArray();

      const totalPrice = userCartProducts?.reduce((total, product) => {
            return total + product.productQuantity * product.currentPrice;
      }, 0);

      const data = {
            total_amount: totalPrice,
            currency: "BDT",
            tran_id: newTran_id, // use unique tran_id for each api call
            success_url: `http://localhost:5000/payment/success/${newTran_id}`,
            fail_url: `${process.env.CLIENT_SITE_URL}`,
            cancel_url: `${process.env.CLIENT_SITE_URL}`,
            ipn_url: "http://localhost:3030/ipn",
            shipping_method: "Courier",
            product_name: "Computer.",
            product_category: "Electronic",
            product_profile: "general",
            cus_name: "Customer Name",
            cus_email: email,
            cus_add1: "Dhaka",
            cus_add2: "Dhaka",
            cus_city: "Dhaka",
            cus_state: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: "01711111111",
            cus_fax: "01711111111",
            ship_name: "Customer Name",
            ship_add1: "Dhaka",
            ship_add2: "Dhaka",
            ship_city: "Dhaka",
            ship_state: "Dhaka",
            ship_postcode: 1000,
            ship_country: "Bangladesh",
      };

      // update user cart with orderDate,tran_id,paymentStatus
      userCartProducts.forEach(async (product) => {
            await productCartCollection.updateOne(
                  { _id: new ObjectId(product._id) },
                  {
                        $set: {
                              paymentStatus: false,
                              orderDate: new Date(),
                              tran_id: newTran_id,
                              orderNumber: orderNumber,
                        },
                  }
            );
      });

      // console.log(data, store_id, store_passwd);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
            // Redirect the user to payment gateway
            let GatewayPageURL = apiResponse.GatewayPageURL;
            res.send({ url: GatewayPageURL });
            // console.log("Redirecting to: ", GatewayPageURL);
            // console.log(data);
      });
});

module.exports = router;
