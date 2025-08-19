import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        enroll: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        easy: {
            type: Number,
            default: null
        },
        medium: {
            type: Number,
            default: null
        },
        hard: {
            type: Number,
            default: null
        },
    },

    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            phone: this.phone,
            enroll: this.enroll
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: 15 * 60
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET||"dksdjdj333442234nfhf850ewndsnodsnd",
        {
            expiresIn:5 * 24 * 60 * 60
        }
    )
}



export const User = mongoose.model("User", userSchema);