const express = require("express");
const router = express.Router();

const {
    getUserFromJwt,
    signup,
    login,
    verifyEmail,
    sendAccount,
    fetchAllAccount,
    fetchAllAccounts,
    transfersToAccount,
    history,
    sendOtp,
    checkOtp,
    fetchAdmin,
    sendContactEmail,
} = require("../controller/user");


// =========================
// Authentication
// =========================
router.get("/userbytoken", getUserFromJwt);
router.post("/login", login);
router.post("/signup", signup);
router.get("/checkverification/:email", verifyEmail);


// =========================
// Accounts
// =========================
router.get("/accounts/:token", fetchAllAccount);
router.get("/allaccounts/:token", fetchAllAccounts);


// =========================
// Transfers & History
// =========================
router.post("/sendaccount/:token", sendAccount);
router.get("/transferstoaccount/:token", transfersToAccount);
router.get("/history/:token", history);


// =========================
// OTP
// =========================
router.get("/otpcode/:token", sendOtp);
router.post("/otpcode/:token", checkOtp);


// =========================
// Public Routes
// =========================
router.get("/admin", fetchAdmin);
router.post("/contact", sendContactEmail);


exports.router = router;