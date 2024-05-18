import User from "../models/user_model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import jwt from "jsonwebtoken"
import CustomError from "../utils/customError.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto"

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}


const signUp = asyncErrorHandler(async (req, res) => {
    const newUser = await User.create(req.body);
    newUser.password = undefined;
    const token = generateToken(newUser._id)

    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
        // secure: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.cookie('jwt', token, options)

    res.status(200).json({
        status: "Success",
        token,
        data: {
            user: newUser
        }
    })
})

const login = asyncErrorHandler(async (req, res) => {
    // const email = req.body.email;
    // const password = req.body.password;

    const { email, password } = req.body
    if (!email || !password) {
        throw new CustomError("Ensure both email and password are provided", 400)
    }

    const user = await User.findOne({ email }).select('+password')


    if (!user || !(await user.comparePasswordinDB(password, user.password))) {
        throw new CustomError("Please enter valid Email or Password", 400);
    }

    const token = generateToken(user._id)

    res.status(200).json({
        status: "Success",
        token
    })

})

const protect = asyncErrorHandler(async (req, res, next) => {
    //1. Read the token & check if it exists

    const testToken = req.headers.authorization;
    let token;
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1]
    }
    if (!token) {
        throw new CustomError("You are not logged in", 401)
    }

    //2. Validate the token

    const decodedToken = jwt.verify(token, process.env.SECRET_STR)
    //3. If the user exist 

    const user = await User.findById(decodedToken.id)
    if (!user) {
        throw new CustomError('User with given token does not exist', 401)
    }
    //4. If the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    if (isPasswordChanged) {
        throw new CustomError("Pasword has been changed recently, Please login again", 401)
    }
    //5. Allow user to access route
    req.user = user;
    next();
})


// for multiple roles we use rest parameter
const restrict = (...role) => {
    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            throw new CustomError("You do not have permission to perform this action", 403)
        }
        next()
    }
}


const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    //1. GET USER BASED ON POSTED EMAIL

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        throw new CustomError("We could not find the user with given email", 404)
    }

    //2. GENERATE A RANDOM RESET TOKEN
    const resetToken = user.createResetPasswordToken();

    await user.save({ validateBeforeSave: false });


    //3. SEND THE TOKEN BACK TO THE USER EMAIL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `We have recieved a Password reset request, Please use the below link to reset the password\n\n${resetURL}\n\nThis reset Password Link will be valid only for 10 minutes`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            message
        })

        res.status(200).json({
            status: "Success",
            message: "Password reset link sent to User"
        })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({ validateBeforeSave: false })

        throw new CustomError("There was Error while reseting Password, Please Try again", 500)
    }
})

const resetPassword = asyncErrorHandler(async (req, res, next) => {
    //1. If the user exist with the given token and token has not expired
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } })

    if (!user) {
        throw new CustomError("Token in invalid or expired", 400)
    }
    //2. Reseting the user password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined
    user.passwordChangedAt = Date.now()

    await user.save()
    //3. Login the user

    const loginToken = generateToken(user._id)

    res.status(200).json({
        status: "Success",
        token: loginToken
    })
})


export {
    signUp, login,
    protect, restrict,
    forgotPassword, resetPassword
}
