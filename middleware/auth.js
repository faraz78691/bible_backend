const jwt = require("jsonwebtoken");
const { fetchUserById } = require('../models/users')

const auth = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== undefined) {
      const bearer = bearerHeader.split(" ");
      req.token = bearer[1];
      const verifyUser = jwt.verify(req.token, 'SecretKey');
      const userdata = verifyUser.data.id
      console.log(verifyUser, "user verify");

      const user = await fetchUserById(verifyUser.data.id );
console.log(user);
      if (user !== null) {
        req.user_id = user[0].id
        next();
      }
      else {
        return res.json({
          message: "Access Forbidden",
          status: 401,
          success: "0",
        });
      }
    }
    else {
      return res.json({
        message: "Token Not Provided",
        status: 400,
        success: "0",
      });
    }
  }
  catch (err) {
    console.log(err);
    return res.json({
      message: "Access forbidden",
      status: 401,
      success: "0",
      Error:err
    });
  }
};

module.exports = auth;