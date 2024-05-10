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
const UserOrderRouter = require("./routes/User/Order");
const ShopProductRouter = require("./routes/Product/Product");
const Category = require("./routes/Category/Category");
const CartRouter = require("./routes/Cart/Cart");
const AdminChecker = require("./routes/AdminChecker/AdminChecker");
const AdminProductRouter = require("./routes/AdminRoutes/Products");
const AdminCouponRouter = require("./routes/AdminRoutes/Coupon");
const paymentSuccess = require("./routes/Payment/PaymentRedirecting/Success");
const AdminUserDataRouter = require("./routes/AdminRoutes/UsersAccess");
const paymentSSL = require("./routes/Payment/SSLCommerzPayment");
const paymentStripe = require("./routes/Payment/stripePayment");

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
            app.use("/user/order", UserOrderRouter);
            app.use("/cart", CartRouter);
            app.use("/product", ShopProductRouter);
            app.use("/category", Category);
            app.use("/admin/user", AdminChecker);
            app.use("/payment/success", paymentSuccess);
            app.use("/admin/product", AdminProductRouter);
            app.use("/admin/user", AdminUserDataRouter);
            app.use("/admin/coupon", AdminCouponRouter);
            app.use("/payment", paymentSSL);
            app.use("/payment", paymentStripe);

            // Start the server
            app.listen(port, () => {
                  console.log(`Server is running on port ${port}`);
            });
      })
      .catch((error) => {
            console.error("Error connecting to database:", error);
      });
