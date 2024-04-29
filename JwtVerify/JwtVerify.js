const jwt = require("jsonwebtoken");


// jwt check middleware
function jwtVerify(req, res, next) {
      const authJWTHeader = req.headers.authorization;
      // console.log(authJWTHeader);

      if (!authJWTHeader) {
            return res.status(401).send("Unauthorized access");
      }

      const token = authJWTHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                  return res.status(403).send("Forbidden access");
            }

            req.decoded = decoded;
            next();
      });
}


module.exports = {jwtVerify};