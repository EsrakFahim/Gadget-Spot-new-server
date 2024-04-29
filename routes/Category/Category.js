const express = require("express");
const router = express.Router();
const { getCollection } = require("../../Config/DBConfig");

// Route to handle category data
router.get("/", async (req, res) => {
      const productCollection = getCollection("products");
      let itemTypeCategory = [];
      const query = {};
      const productsData = await productCollection.find(query).toArray();
      // item type sent to client site for filtering
      productsData.forEach((product) => {
            if (!itemTypeCategory.includes(product.itemType)) {
                  itemTypeCategory.push(product.itemType);
            }
      });
      res.send(itemTypeCategory);
});

router.get("/product", async (req, res) => {
      const productCategoryCollection = getCollection("productCategory");
      const result = await productCategoryCollection.find().toArray();
      res.send(result);
});

module.exports = router;
