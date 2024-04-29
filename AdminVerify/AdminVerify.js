const { getCollection } = require("../Config/DBConfig");

// user admin verify
const adminVerify = async (req, res, next) => {
      const userCollection = getCollection("userData");
      const decodedEmail = req?.decoded?.email;
            console.log(decodedEmail)
      const query = {
            email: decodedEmail,
      };
      const findUser = await userCollection.findOne(query);
      if (findUser.role !== "admin") {
            return res.status(403).send("Forbidden access"); // Add return statement here
      }
      next();
};

module.exports = {adminVerify};
