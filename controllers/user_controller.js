import User from "../models/user_model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken"


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const filterRequestObject = (obj, ...allowedFileds) => {
    const newObj = {};
    Object.keys(obj).forEach(prop => {
        if (allowedFileds.includes(prop)) {
            newObj[prop] = obj[prop]
        }
    })
    return newObj
}

const getAllUsers = asyncErrorHandler(async (req, res) => {
    let users = await User.find()
    // let datas = users.filter(data => {
    //     return data.active = true
    // })
    res.status(200).json({
        status: "Success",
        result: users.length,
        data: {
            users
        }
    })
})

const updatePassword = asyncErrorHandler(async (req, res) => {
    // GET CURRENT USER DATA FROM DATABASE

    const user = await User.findById(req.user._id).select("+password");

    // CHECK IF THE SUPPILED CURRENT PASSWOR IS CORRECT

    if (!(await user.comparePasswordinDB(req.body.currentPassword, user.password))) {
        throw new CustomError("Current Password you provided is wrong", 401)
    }

    //IF SUPLIED PASSWORD IS CORRECT, UPDATE THR PASSWORD WITH NEW VALUE

    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword

    await user.save()

    //LOGIN USER & SEND JWT

    const token = generateToken(user._id)

    res.status(200).json({
        status: "Success",
        token,
        data: {
            user
        }
    })
})

const updateMe = asyncErrorHandler(async (req, res) => {
    if (req.body.password || req.body.confirmPassword) {
        throw new CustomError("You can not Update Password using this endpoint", 400)
    }

    const filterObj = filterRequestObject(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filterObj, { runValidators: true, new: true });


    res.status(200).json({
        status: "Success",
        data: {
            user: updatedUser
        }
    })
})

const deleteMe = asyncErrorHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { active: false })

    res.status(204).json({
        status: "Success",
        data: null
    })
})


export { updatePassword, updateMe, deleteMe, getAllUsers }