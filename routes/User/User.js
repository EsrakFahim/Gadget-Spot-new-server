const express = require("express");
const router = express.Router();

const { getCollection } = require("../../Config/DBConfig");
// user data post to DB
router.post("/details", async (req, res) => {
      const userCollection = getCollection('userData')
      const userData = req.body;
      const result = await userCollection.insertOne(userData);
      // console.log('done')
      res.send(result);
});

// update user in DB
router.put("/details/edit/:uid", async (req, res) => {
      const userCollection = getCollection('userData')
      const UID = req.params.uid;
      const updateData = req.body;
      const findUser = {
            userUID: UID,
      };
      const option = { upsert: true };
      const updateContentSet = {
            $set: {
                  userName: updateData?.userName,
                  email: updateData?.userEmail,
                  userPhoneNumber: updateData?.phoneNumber,
            },
      };
      try {
            const result = await userCollection.updateOne(
                  findUser,
                  updateContentSet,
                  option
            );
            res.send(result);
      } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
      }
});


module.exports = router