const express = require("express");
const {
  getWallet,
  getTransactions,
  createTransaction,
  updateWallet,
  getWalletStats,
  requestCredit,
} = require("../controllers/walletController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getWallet);
router.get("/transactions", getTransactions);
router.post("/transaction", createTransaction);
router.put("/update", updateWallet);
router.get("/stats", getWalletStats);
router.post("/request-credit", requestCredit);

module.exports = router;
