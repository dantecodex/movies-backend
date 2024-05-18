import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"
import crypto from "crypto"

// name,email,password,confirm passsword, photo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please enter your email'],
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your Password'],
        validate: {
            // This validator will only work for save() & create()
            validator: function (val) {
                return val == this.password
            },
            message: "Password & Confirm Password does not match"
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // encrypt password before saving it 
    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined; // We don't want to save confirm Password and It's only for validating same Password
    next();
})

userSchema.pre(/^find/, function(next) {
    // this keyword in function will point to current query
    this.find({active: {$ne: false}});
    next()
})

userSchema.methods.comparePasswordinDB = async function (pswd, pswdDB) {
    return await bcrypt.compare(pswd, pswdDB)
}

userSchema.methods.isPasswordChanged = async function (JWTTimestap) {
    if (this.passwordChangedAt) {
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return passwordChangedTimestamp > JWTTimestap
    }
    return false;
}

userSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // 10min from generation time
    return resetToken;
}

const User = mongoose.model("User", userSchema)

export default User