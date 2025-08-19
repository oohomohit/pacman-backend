import { Router } from "express";
import {
    loginUser,
    registerUser,
    refreshAccessToken,
    getCurrentUser,
    updateData,
    leaderboard,
} from "./login.controller.js";
import { logoutUser } from "./logout.controllers.js";
import { verifyJWT } from "./AuthMiddleware.js";


const router = Router();

router.route("/").get((req, res) => {
    // res.json({ message: "Backend is working " });
    res.send("Backend is working");
});
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/me").post(getCurrentUser);
router.route("/update").post(updateData);
router.route('/leaderboard').get(leaderboard);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/register").post(registerUser)




export default router