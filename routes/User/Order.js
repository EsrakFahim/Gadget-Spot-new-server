const express = require("express");
const router = express.Router();
const { getCollection } = require("../../Config/DBConfig");
const { jwtVerify } = require("../../JwtVerify/JwtVerify");

router.get("/", async (req, res) => {
      // add jwt after complete this route code
      try {
            const orderCollection = getCollection("Orders");
            const { email, days, pageNo, pageSize } = req.query; // Extract the days parameter from the query string
            const query = {
                  userEmail: email,
                  orderDate: {
                        $gte: new Date(
                              new Date().setDate(new Date().getDate() - days)
                        ), // Filter orders from the last 'days' days
                  },
            };
            const userOrders = await orderCollection.find(query).toArray();

            // Use MongoDB aggregation to group user orders by tran_id and orderDate
            const groupedOrders = await orderCollection
                  .aggregate([
                        { $match: query }, // Match documents for the given email and within the last 'days' days
                        {
                              $group: {
                                    _id: {
                                          tran_id: "$tran_id",
                                          orderDate: "$orderDate",
                                    }, // Group by tran_id and orderDate
                                    orders: { $push: "$$ROOT" }, // Push the whole document into the orders array
                              },
                        },
                        {
                              $project: {
                                    _id: 0, // Exclude the default _id field
                                    tran_id: "$_id.tran_id",
                                    orderDate: {
                                          $dateToString: {
                                                format: "%d/%m/%Y %H:%M", // Format orderDate as dd/mm/yyyy hh:mm
                                                date: "$_id.orderDate",
                                          },
                                    },
                                    orders: 1, // Include the orders array
                              },
                        },
                  ])
                  .toArray();

            // Sort grouped orders by orderDate in descending order
            groupedOrders.sort(
                  (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
            );

            var orderSize =  groupedOrders.length;


            // for pagination
            const startIndex = (pageNo - 1) * pageSize;
            const endIndex = pageNo * pageSize;

            const currentPageProduct = groupedOrders.slice(
                  startIndex,
                  endIndex
            );

            res.json({currentPageProduct,orderSize:orderSize});
      } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
      }
});

module.exports = router;
