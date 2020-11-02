const Post = require('../models/post');

exports.getAllPosts = (req, res, next) => {
  const pageSize = Number(req.query.pagesize);
  const currentPage = Number(req.query.page);
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && postQuery) {
    postQuery
      .skip(pageSize * (currentPage - 1)) // Skips to starting position of query
      .limit(pageSize); // Limits number queried
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments();
    }).then(count => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: fetchedPosts,
      maxPosts: count
    })
  })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      })
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found'});
    }
  })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      })
    });
};

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(result => {
    console.log('save res', result);
    res.status(201).json({
      message: 'Posted successfully',
      post: {
        title: result.title,
        content: result.content,
        id: result._id,
        imagePath: result.imagePath
      }
    })
      .catch(error => {
        res.status(500).json({
          message: "Creating post failed!"
        })
      });
  });
};

exports.updatePost = (req, res, next) => {
  console.log(req.file);
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(result => {
    if (result.n > 0) {
      res.status(200).json({message: "Update successful"});
    } else {
      res.status(401).json({message: "Not authorized!"});
    }
  })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't update post!"
      })
    })
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {
    if (result.n > 0) {
      res.status(200).json({message: "Post deleted!"});
    } else {
      res.status(401).json({message: "Not authorized!"});
    }
  })
    .catch(error => {
      res.status(500).json({
        message: "Deleting post failed!"
      })
    });
};
