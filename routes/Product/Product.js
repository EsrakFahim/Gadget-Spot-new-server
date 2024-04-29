const express = require("express");
const router = express.Router();
const {  ObjectId } = require("mongodb");


const { getCollection } = require("../../Config/DBConfig");

// Route to handle product data with optional pagination, sorting, and filtering
router.get("/data", async (req, res) => {
      const productCollection = getCollection("products");
      const productCategoryCollection = getCollection("productCategory");
      try {
            let { page, pageSize, sort, categories, minPrice, maxPrice } =
                  req.query;

            // Convert comma-separated categories string to an array
            categories = categories ? categories.split(",") : [];

            console.log(categories);

            const query = {};
            const productData = await productCollection.find(query).toArray();
            const productCategory = await productCategoryCollection
                  .find(query)
                  .toArray();

            const filterByPrice = productData.filter((product) => {
                  const productCurrentPrice = parseInt(product?.currentPrice);
                  return (
                        productCurrentPrice >= parseInt(minPrice) &&
                        productCurrentPrice <= parseInt(maxPrice)
                  );
            });

            let sortedProducts = [...filterByPrice];

            const sortingOptions = {
                  "Price: Low To High": (a, b) =>
                        a.currentPrice - b.currentPrice,
                  "Price: High To Low": (a, b) =>
                        b.currentPrice - a.currentPrice,
                  "Better Discount": (a, b) =>
                        ((b.openingPrice - b.currentPrice) / b.openingPrice) *
                              100 -
                        ((a.openingPrice - a.currentPrice) / a.openingPrice) *
                              100,
            };

            if (sort && sort !== "recommended") {
                  sortedProducts.sort(sortingOptions[sort]);
            }

            let filterCategoryProducts = sortedProducts;

            if (categories.length > 0) {
                  const matchProductByCategory = filterCategoryProducts.filter(
                        (product) => {
                              // Check if there is any common element between categories and product tags
                              return (
                                    product?.tags?.categoryTags &&
                                    product.tags.categoryTags.some((tag) =>
                                          categories.includes(tag)
                                    )
                              );
                        }
                  );

                  filterCategoryProducts = matchProductByCategory;
            }

            // for pagination
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;

            const currentPageProduct = filterCategoryProducts.slice(
                  startIndex,
                  endIndex
            );
            const totalPage = Math.ceil(
                  filterCategoryProducts.length / pageSize
            );

            res.send({
                  currentPageProduct,
                  totalPage,
                  productCategory,
                  totalProductShown: filterCategoryProducts.length,
            });
      } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
      }
});

// send client site product details
router.get("/details/:id", async (req, res) => {
      const productCollection = getCollection("products");

      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) };
      // console.log(query)
      const productDetails = await productCollection.find(query).toArray();

      // console.log(findProduct);
      if (productDetails) {
            // If the product is found, send it back to the client
            res.json(productDetails);
      } else {
            // If the product is not found, send an appropriate response
            res.status(404).json({ error: "Product not found" });
      }
});


module.exports = router;
