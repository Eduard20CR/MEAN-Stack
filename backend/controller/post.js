const PostModel = require("./../models/post");

exports.addPost = (req, res, next) => {
  const url = `${req.protocol}://${req.get("host")}`;

  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
    imagePath: `${url}/images/${req.file.filename}`,
    creator: req.userData.userId,
  });

  post
    .save()
    .then((createdPost) => {
      console.log("Post saved");
      res.status(201).json({
        message: "Post added Succesfully",
        post: {
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ message: "Creating a post failed!" });
    });
};

exports.getPost = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = PostModel.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then((result) => {
      fetchedPosts = result;
      return PostModel.count();
    })
    .then((result) => {
      res.status(200).json({
        message: "Post fetched suceesfully",
        posts: fetchedPosts,
        maxPost: result,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: "Getting posts failed!" });
    });
};

exports.updatedPost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = `${req.protocol}://${req.get("host")}`;
    imagePath = `${url}/images/${req.file.filename}`;
  }

  const id = req.params.id;
  const updatedPost = new PostModel({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId,
  });
  PostModel.updateOne({ _id: id, creator: req.userData.userId }, updatedPost)
    .then((result) => {
      console.log(result);
      if (result.matchedCount > 0) {
        res.status(200).json({
          message: "Post updated suceesfully",
        });
      } else {
        res.status(401).json({
          message: "No autorized",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Updating a post failed!" });
    });
};

exports.deletePost = (req, res, next) => {
  const id = req.params.id;

  PostModel.deleteOne({ _id: id, creator: req.userData.userId })
    .then((result) => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: "Post deleted Succesfully",
        });
      } else {
        res.status(401).json({
          message: "No autorized",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting a post failed!" });
    });
};

exports.getPostById = (req, res, next) => {
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
      res.status(500).json({ message: "Post no found" });
    });
};
