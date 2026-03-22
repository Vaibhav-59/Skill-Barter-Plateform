const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const {
  createResource, getResources, getResource,
  updateResource, deleteResource,
  toggleLike, toggleBookmark,
  addReview, getBookmarked, getTrending, getRecommended,
} = require("../controllers/resourceController");

router.get  ("/trending",    protect, getTrending);
router.get  ("/bookmarked",  protect, getBookmarked);
router.get  ("/recommended", protect, getRecommended);
router.get  ("/",            protect, getResources);
router.post ("/",            protect, createResource);
router.get  ("/:id",         protect, getResource);
router.put  ("/:id",         protect, updateResource);
router.delete("/:id",        protect, deleteResource);
router.post ("/:id/like",    protect, toggleLike);
router.post ("/:id/bookmark",protect, toggleBookmark);
router.post ("/:id/review",  protect, addReview);

module.exports = router;
