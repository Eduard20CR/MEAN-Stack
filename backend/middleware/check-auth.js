const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decodeToken = jwt.verify(token, process.env.JWY_KEY);

    req.userData = {
      email: decodeToken.email,
      userId: decodeToken.userId,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
