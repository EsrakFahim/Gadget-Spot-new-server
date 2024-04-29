const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollection } = require("../Config/DBConfig");
const { jwtVerify } = require("../JwtVerify/JwtVerify");
const { adminVerify } = require("../AdminVerify/AdminVerify");

// send all product to admin panel
router.get("/get", jwtVerify, adminVerify, async (req, res) => {
      const productCollection = getCollection("products");
      try {
            let { page, pageSize } = req.query;

            // Convert page and pageSize to integers
            page = parseInt(page, 10) || 1;
            pageSize = parseInt(pageSize, 10) || 10; // Set a default pageSize if not provided

            // console.log(page, pageSize);

            const allProductsGet = await productCollection.find().toArray();

            // for pagination
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;

            const currentPageProduct = allProductsGet.slice(
                  startIndex,
                  endIndex
            );

            const totalPage = Math.ceil(allProductsGet.length / pageSize);

            // console.log("currentPageProduct:", currentPageProduct);

            res.send({
                  currentPageProduct,
                  allProductsLength: allProductsGet?.length,
                  totalPage,
            });
      } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
      }
});

// post new product in DB
router.post("/add/new", jwtVerify, adminVerify, async (req, res) => {
      const productCategoryCollection = getCollection("productCategory");
      const productCollection = getCollection("products");

      try {
            const query = req.body;
            const categoryTags = query?.tags?.categoryTags || [];
            // console.log(query?.tags?.categoryTags);

            // Extract unique categories
            const uniqueCategories = [...new Set(categoryTags)];

            for (const category of uniqueCategories) {
                  const existingCategories =
                        await productCategoryCollection.findOne({
                              category,
                        });

                  if (!existingCategories) {
                        await productCategoryCollection.insertOne({
                              category,
                        });
                  }
            }

            const result = await productCollection.insertOne(query);
            res.send(result);
      } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
      }
});

router.put("/update/:id", jwtVerify, adminVerify, async (req, res) => {
      const productCollection = getCollection("products");
      const id = req?.params?.id;
      const findProduct = { _id: new ObjectId(id) };
      const updateTags = req.body;

      try {
            const product = await productCollection.findOne(findProduct);

            if (!product) {
                  res.status(404).send("Product not found");
                  return;
            }

            const updateContentSet = {
                  $set: {
                        "tags.productTags": updateTags, // Update the "productData" subfield within "tags"
                  },
            };

            const result = await productCollection.updateOne(
                  findProduct,
                  updateContentSet,
                  { upsert: true }
            );

            res.status(200).send({
                  message: "Product tags updated successfully",
                  result,
            });
      } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
      }
});

// delete product from DB
router.delete("/delete", jwtVerify, adminVerify, async (req, res) => {
      const productCollection = getCollection("products");
      const { id } = req?.query;
      const productId = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(productId);
      res.send(result);
});

module.exports = router;
