const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
// Update User
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account Updated Successfully !!!");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You Can Update Only Your Account !!");
  }
});
// Delete User
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account Deleted Successfully !!!");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You Can Update Only Your Account !!");
  }
});
// Get User
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, createdAt, updatedAt, __v, ...showe } = user._doc;
    res.status(200).json(showe);
  } catch (error) {
    return res.status(500).json(error);
  }
});
// Follow User
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: { following: req.params.id },
        });
        res.status(200).send("User Has Been Followed successfully !!!");
      } else {
        res.status(403).send("You Can't Follow Him Again !!!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).send("You Can't Follow Your Self");
  }
});
// Unfollow User
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).send("User Has Been Unfollowed successfully !!!");
      } else {
        res.status(403).send("You Already Don't Follow Him !!!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).send("You Can't Unfollow Your Self");
  }
});

module.exports = router;
