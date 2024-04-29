const express = require("express");
const router = express.Router();
const { getCollection } = require("../../Config/DBConfig");

router.get("/check/:email", async (req, res) => {
      const userCollection = getCollection("userData");
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
});

module.exports = router;
