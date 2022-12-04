const express = require("express");
const PostModel = require("./../models/post");

const router = express.Router();

router.post("", (req, res, next) => {
  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
  });
  post
    .save()
    .then((createdPost) => {
      console.log("Post saved");
      res.status(201).json({
        message: "Post added Succesfully",
        idPost: createdPost._id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("", (req, res, next) => {
  PostModel.find()
    .then((result) => {
      res.status(200).json({
        message: "Post fetched suceesfully",
        posts: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  PostModel.findById(id)
    .then((result) => {
      if (result) {
        res.status(200).json({
          message: "Post fetched suceesfully",
          post: result,
        });
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const updatedPost = new PostModel({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
  });

  PostModel.updateOne({ _id: id }, updatedPost)
    .then((result) => {
      res.status(200).json({
        message: "Post updated suceesfully",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;

  PostModel.deleteOne({ _id: id })
    .then((result) => {
      res.status(200).json({
        message: "Post deleted Succesfully",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
