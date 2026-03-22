const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPost, getPosts, getPost, deletePost,
  toggleLike, toggleSave,
  addComment, deleteComment, likeComment,
  addReply,
  addAnswer, upvoteAnswer, acceptAnswer,
  getTrendingTags, getRecommended,
} = require("../controllers/communityController");

// Feed
router.get ("/trending-tags", protect, getTrendingTags);
router.get ("/recommended",   protect, getRecommended);
router.get ("/",              protect, getPosts);
router.post("/",              protect, createPost);
router.get ("/:id",           protect, getPost);
router.delete("/:id",         protect, deletePost);

// Reactions
router.post("/:id/like", protect, toggleLike);
router.post("/:id/save", protect, toggleSave);

// Comments
router.post  ("/:id/comment",                         protect, addComment);
router.delete("/:id/comment/:commentId",              protect, deleteComment);
router.post  ("/:id/comment/:commentId/like",         protect, likeComment);
router.post  ("/:id/comment/:commentId/reply",        protect, addReply);

// Q&A
router.post("/:id/answer",                   protect, addAnswer);
router.post("/:id/answer/:answerId/upvote",  protect, upvoteAnswer);
router.put ("/:id/answer/:answerId/accept",  protect, acceptAnswer);

module.exports = router;
