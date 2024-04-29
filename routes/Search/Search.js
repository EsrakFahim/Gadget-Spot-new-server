const express = require('express');
const router = express.Router();

const { getCollection } = require("../../Config/DBConfig");


router.get("/", async (req, res) => {
      const productCollection = getCollection('products')
      const query = req.query.q;


      if (query) {
            try {
                  // Your search logic here, you can customize the query as per your collection structure
                  const result = await productCollection
                        .find({
                              $or: [
                                    {
                                          productTitle: {
                                                $regex: query,
                                                $options: "i",
                                          },
                                    }, // Case-insensitive search for productTitle
                                    {
                                          "tags.categoryTags": {
                                                $regex: query,
                                                $options: "i",
                                          },
                                    }, // Case-insensitive search for categoryTags
                                    {
                                          "tags.productTags": {
                                                $regex: query,
                                                $options: "i",
                                          },
                                    }, // Case-insensitive search for productTags
                              ],
                        })
                        .toArray();
                  // console.log(result);
                  res.send(result);
            } catch (error) {
                  console.error("Error searching products:", error);
                  throw error;
            }
      } else {
            res.send([]);
      }
});


module.exports = router