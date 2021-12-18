const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

module.exports = async function auth(req, res, next) {
  try {
    // Gather the jwt access token from the request header
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "authenticatedUser");

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    // Pass fetched user instead of have to fetch user again in route handler because it wastes resources and time
    req.token = token;
    req.authenticatedUser = user;
    next();
  } catch (err) {
    res.status(401).json({ err: "Please authenticate." });
  }
};
