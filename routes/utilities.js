const express = require("express");
const router = express.Router();

const { getCollection } = require("../Config/DBConfig");

router.get("/", async (req, res) => {
      try {
            const productCollection = getCollection('products')
            // Fetch all products from the collection
            const allProducts = await productCollection.find().toArray();

            // Calculate the maximum price using reduce
            // Convert currentPrice strings to numbers and filter out invalid prices
            const validPrices = allProducts
                  .map((product) => parseInt(product.currentPrice))
                  .filter((price) => !isNaN(price));

            // Calculate the maximum price using Math.max
            const maxPriceFilter = Math.max(...validPrices);

            // console.log(maxPriceFilter);
            // Get the total number of products
            const totalProduct = allProducts.length;

            // Send utility data to the client
            res.send({
                  maxPriceFilter,
                  totalProduct,
                  allProducts,
            });
      } catch (error) {
            console.error(error);
            res.status(500).json({
                  error: "Internal Server Error",
            });
      }
});

module.exports = router;
