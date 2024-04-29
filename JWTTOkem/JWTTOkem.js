const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getCollection } = require("../Config/DBConfig");

// send token to client site
router.get("/", async (req, res) => {
      const userCollection = getCollection("userData");
      const email = req?.query?.email;
      const query = { email: email };
      const varUser = await userCollection.findOne(query);
      console.log(varUser);
      if (varUser && email) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET);
            console.log(token);
            return res.send({ accessToken: token }); // Add the return statement here
      }
      return res.status(403).send("403 — Forbidden.");
});

module.exports = router;
