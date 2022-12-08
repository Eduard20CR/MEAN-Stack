const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = require("./../models/user");

exports.createUser = (req, res, next) => {
  const { email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((res) => {
      const user = new UserModel({
        email: email,
        password: res,
      });
      return user.save();
    })
    .then((result) => {
      res.status(202).json({ message: "User Created", result });
    })
    .catch((error) => {
      return res.status(501).json({
        message: "Invalid authentication credentials!",
      });
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let fetchUser;

  UserModel.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "No user found" });
      }
      fetchUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { email: fetchUser.email, userId: fetchUser._id },
        process.env.JWY_KEY,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token: token,
        id: fetchUser._id,
        expiresIn: 3600,
      });
    })
    .catch((err) => {
      res.status(404).json({ message: "Invalid authentication credentials!" });
    });
};
