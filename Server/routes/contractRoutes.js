// /server/routes/contractRoutes.js
const express = require("express");
const {
  createContract,
  getUserContracts,
  getContractById,
  acceptContract,
  cancelContract,
  scheduleSession,
  completeContractSession,
  createContractReview
} = require("../controllers/contractController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.post("/create", createContract);
router.get("/user", getUserContracts);
router.get("/:id", getContractById);
router.put("/accept/:id", acceptContract);
router.put("/cancel/:id", cancelContract);
router.put("/schedule-session/:id", scheduleSession);
router.put("/complete-session/:id", completeContractSession);
router.post("/:id/review", createContractReview);

module.exports = router;
