import express, { Router } from "express"
import { signUp, login, forgotPassword, resetPassword, protect } from "../controllers/aut_controller.js";


const router = express.Router();

router.route('/signup').post(signUp)
router.route('/login').get(login)
router.route('/forgotPassword').post(forgotPassword)
router.route('/resetPassword/:token').patch(resetPassword)


export default router