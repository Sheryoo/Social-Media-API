const router = require("express").Router();
const Post = require("../models/posts");
const User = require("../models/user");
// Create a Post

router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPsot = await newPost.save();
    res.status(200).json(savedPsot);
  } catch (error) {
    res.status(404).json(error);
  }
});
// Edit a Post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId == req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json(post);
    } else {
      res.status(403).json("You Can Only Update Your Posts");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
// Delete a Post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId == req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post Deleted successfully !!!");
    } else {
      res.status(403).json("You Can Only Delete Your Posts");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
// Like a Post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      await post.updateOne({ $inc: { likesNumber: 1 } });
      res.status(200).json("You Liked The post Successfully !!!");
    } else {
      res.status(403).json("this Post Already Liked By You !!!");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
// Dislike a Post
router.put("/:id/dislike", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      await post.updateOne({ $inc: { likesNumber: -1 } });
      res.status(200).json("You Disliked The post Successfully !!!");
    } else {
      res.status(403).json("this Post Already Disliked By You !!!");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
// Get a Post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { createdAt, updatedAt, __v, ...show } = post._doc;
    res.status(200).send(show);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Get Timeline Posts
router.get("/user/timeline", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const userposts = await Post.find({ userId: currentUser.id });
        const friendPosts = await Promise.all(
            currentUser.following.map(friendId => {
                return Post.find({ userId: friendId })
            })
        );
        res.status(200).json(userposts.concat(...friendPosts))
    } catch (error) {
        res.status(500).json(error)
    }

})
module.exports = router;
