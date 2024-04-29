// Importing necessary modules for the Express server
const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(
      cors({
            origin: "*",
            methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
      })
);

const { connectToDatabase, getCollection } = require("./Config/DBConfig");
const JWT = require("./JWTTOkem/JWTTOkem");
const appJS = require("./routes/utilities");
const Search = require("./routes/Search/Search");
const UserRouter = require("./routes/User/User");
const ShopProductRouter = require("./routes/Product/Product");
const Category = require("./routes/Category/Category");
const CartRouter = require("./routes/Cart/Cart");
const AdminChecker = require("./routes/AdminChecker/AdminChecker");
const AdminProductRouter = require("./AdminRoutes/Products");
const AdminCouponRouter = require("./AdminRoutes/Coupon");
const AdminUserDataRouter = require("./AdminRoutes/UsersAccess");
const paymentSSL = require("./routes/Payment/SSLCommerzPayment");
const paymentStripe = require("./routes/Payment/stripePayment");
const paymentSuccess = require("./routes/Payment/PaymentRedirecting/Success");

connectToDatabase()
      .then(() => {
            console.log("Connected to database");

            app.get("/alldata", async (req, res) => {
                  const productCollection = getCollection("products");
                  const query = {};
                  const result = await productCollection.find(query).toArray();
                  res.send(result);
            });

            // Use other route files as needed
            app.use("/jwt", JWT);
            app.use("/utilities", appJS);
            app.use("/search", Search);
            app.use("/user", UserRouter);
            app.use("/cart", CartRouter);
            app.use("/product", ShopProductRouter);
            app.use("/category", Category);
            app.use("/admin/user", AdminChecker);
            app.use("/admin/product", AdminProductRouter);
            app.use("/admin/user", AdminUserDataRouter);
            app.use("/admin/coupon", AdminCouponRouter);
            app.use("/payment", paymentSSL);
            app.use("/payment", paymentStripe);
            app.use("/payment/success", paymentSuccess);

            // Start the server
            app.listen(port, () => {
                  console.log(`Server is running on port ${port}`);
            });
      })
      .catch((error) => {
            console.error("Error connecting to database:", error);
      });
