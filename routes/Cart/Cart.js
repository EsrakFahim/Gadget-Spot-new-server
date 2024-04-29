const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollection } = require("../../Config/DBConfig");

router.post("/product/add", async (req, res) => {
      const productCartCollection = getCollection("productsCart");
      const query = req.body;
      const { userEmail, userAuthUID } = query;
      try {
            const addCartCheck = await productCartCollection.findOne({
                  productId: query?.productId,
                  userAuthUID: userAuthUID,
                  userEmail: userEmail,
            });

            if (!addCartCheck) {
                  const result = await productCartCollection.insertOne(query);
                  res.send({
                        result,
                        successMsg: `${query?.productTitle} is added to cart`,
                  });
            } else {
                  res.send({
                        errorMsg: `${query?.productTitle} is already added in cart`,
                  });
            }
      } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
      }
});

router.get("/product/get", async (req, res) => {
      const productCartCollection = getCollection("productsCart");
      const userEmail = req.query.email;
      const userUID = req.query.uid;
      const query = {
            userAuthUID: userUID,
            userEmail: userEmail,
      };
      try {
            const result = await productCartCollection.find(query).toArray();
            res.send(result);
      } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
      }
});

// update cart product quantity
router.put("/product/:id", async (req, res) => {
      const productCartCollection = getCollection("productsCart");
      const id = req.params.id;
      const findProduct = { _id: new ObjectId(id) };
      // console.log(findProduct)
      const updateContent = req.body;
      const option = { upset: true }; // Corrected the option name

      const updateContentSet = {
            $set: {
                  productQuantity: updateContent?.productQuantity,
                  // Add other fields that you want to update
            },
      };

      try {
            const result = await productCartCollection.updateOne(
                  findProduct,
                  updateContentSet,
                  option
            );
            res.send(result);
      } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
      }
});

// remove a product from user cart as user make request
router.delete("/product/remove/:id", async (req, res) => {
      const productCartCollection = getCollection("productsCart");
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCartCollection.deleteOne(query);
      res.send(result);
});

module.exports = router;
