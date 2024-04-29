const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getCollection } = require("../Config/DBConfig");
const {adminVerify} = require('../AdminVerify/AdminVerify')
const {jwtVerify} = require('../JwtVerify/JwtVerify')

// coupon code post to DB
router.post(
      "/add",
      jwtVerify,
      adminVerify,
      async (req, res) => {
            const couponCollection = getCollection("couponCodes");
            const couponData = req.body;
            const result = await couponCollection.insertOne(couponData);
            // console.log('done')
            res.send(result);
      }
);

router.get(
      "/get/all",
      jwtVerify,
      adminVerify,
      async (req, res) => {
            const couponCollection = getCollection("couponCodes");
            try {
                  let { page, pageSize } = req.query;

                  // Convert page and pageSize to integers
                  page = parseInt(page, 10) || 1;
                  pageSize = parseInt(pageSize, 10) || 10; // Set a default pageSize if not provided

                  // console.log(page, pageSize);

                  const result = await couponCollection.find().toArray();

                  // for pagination
                  const startIndex = (page - 1) * pageSize;
                  const endIndex = page * pageSize;

                  const currentPageCoupons = result.slice(startIndex, endIndex);

                  const totalPage = Math.ceil(result.length / pageSize);

                  // console.log("currentPageProduct:", currentPageProduct);

                  res.send({
                        currentPageCoupons,
                        allCouponsLength: result?.length,
                        totalPage,
                  });
            } catch (error) {
                  console.error("Error fetching products:", error);
                  res.status(500).send("Internal Server Error");
            }
      }
);


module.exports = router;