const express = require("express");
const router = express.Router();
const { getCollection } = require("../../Config/DBConfig");
const {jwtVerify} = require('../../JwtVerify/JwtVerify');
const {adminVerify} = require('../../AdminVerify/AdminVerify');

// all user data send to frontend
router.get("/data", jwtVerify, adminVerify, async (req, res) => {
      try {
            const userCollection = getCollection("userData");
            let { page, pageSize } = req?.query;
            page = parseInt(page, 10) || 1;
            pageSize = parseInt(pageSize, 10) || 10;

            const result = await userCollection.find().toArray();

            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;

            const perPageShownData = result.slice(startIndex, endIndex);

            const totalPage = Math.ceil(result.length / pageSize);

            res.send({
                  perPageShownData,
                  totalCustomer: result.length,
                  totalPage,
            });
      } catch (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
      }
});

router.get("/data/:email/:uid", jwtVerify, adminVerify, async (req, res) => {
      const userCollection = getCollection("userData");
      let { email, uid } = req.params;

      const query = {
            email: email,
            userUID: uid,
      };

      const clientData = await userCollection.findOne(query);
      res.send(clientData);
});

module.exports = router;
