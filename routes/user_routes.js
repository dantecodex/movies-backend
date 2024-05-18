import express from "express"
import { deleteMe, getAllUsers, updateMe, updatePassword } from "../controllers/user_controller.js";
import { protect } from "../controllers/aut_controller.js";

const router = express.Router()

router.route('/getAllUsers').get(getAllUsers)
router.route('/updatePassword').patch(protect, updatePassword)
router.route('/updateMe').patch(protect, updateMe)
router.route('/deleteMe').delete(protect, deleteMe)

export default router