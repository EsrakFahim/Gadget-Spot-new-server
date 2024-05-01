const express = require("express");
const router = express.Router();
const { getCollection } = require("../../Config/DBConfig");
const { jwtVerify } = require("../../JwtVerify/JwtVerify");

router.get("/", async (req, res) => {
      try {
            const orderCollection = getCollection("Orders");
            const { email } = req.query;
            const query = {
                  userEmail: email,
            };
            const userOrders = await orderCollection.find(query).toArray();

            // Use MongoDB aggregation to group user orders by tran_id and orderDate
            const groupedOrders = await orderCollection
                  .aggregate([
                        { $match: query }, // Match documents for the given email
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

            res.json(groupedOrders);
      } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
      }
});

module.exports = router;
