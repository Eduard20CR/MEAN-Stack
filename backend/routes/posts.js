const express = require("express");

const AuthMiddleware = require("./../middleware/check-auth");
const PostController = require("./../controller/post");
const Multer = require("./../middleware/file");

const router = express.Router();

router.post("", AuthMiddleware, Multer, PostController.addPost);

router.get("", PostController.getPost);

router.get("/:id", PostController.getPostById);

router.put("/:id", AuthMiddleware, Multer, PostController.updatedPost);

router.delete("/:id", AuthMiddleware, PostController.deletePost);

module.exports = router;
