import { asyncHandler } from "./utils/asyncHandler.js";
import { ApiError } from "./utils/ApiError.js"
import { User } from "./user.model.js"
import { ApiResponse } from "./utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";




// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res

export const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password, enroll, phone } = req.body;
    if ([userName, email, password, enroll, phone].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    // Strong password validation
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!strongPw.test(password)) {
        throw new ApiError(400, "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    }
    const existedUser = await User.findOne({ $or: [{ email }, { enroll }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or enrollment already exists");
    }
    const user = await User.create({
        userName,
        email,
        password,
        enroll,
        phone
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, enroll, password } = req.body;
    if ((!email && !enroll) || !password) {
        throw new ApiError(400, "Email or enrollment and password are required");
    }
    const user = await User.findOne(email ? { email } : { enroll });
    if (!user) {
        throw new ApiError(401, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
    const options = {
        httpOnly: true,
        secure: true,
        withCredentials: true
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: user, accessToken, refreshToken }, "User logged In Successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        { _id: req.body.id},

        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

export const generateAccessAndRefereshTokens = async (userId) => {
    try {
        // console.log("userId: ", userId);
        const user = await User.findById(userId);
        // console.log("yha ka user ",user);

        // userSchema.methods.generateAccessToken = function () {
        const accessToken = jwt.sign(
            {
                _id: user._id,
                userName: user.userName,
                phone: user.phone,
                enroll: user.enroll

            },

            // process.env.ACCESS_TOKEN_SECRET,
            "dhnncncdhde9ied3udnnsllsjdkjdnc",
            {
                expiresIn: "1d"
            }
        )


        // const accessToken =await user.generateAccessToken();
        // console.log("yha bhi aa gya");
        // const refreshToken = await user.generateRefreshToken();
        const refreshToken = jwt.sign(
            {
                _id: user._id,

            },
            "dksdjdj333442234nfhf850ewndsnodsnd",
            {
                expiresIn:'1d'
            }
        )



        // console.log("yha bhi aa gya 2 ");
        user.refreshToken = refreshToken;
        // console.log("refresh : ", refreshToken);
        await user.save({ validateBeforeSave: false })
        // console.log("yha bhi aa gya 3");
        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export const getCurrentUser = asyncHandler(async (req, res) => {
    // Extract token from request headers, query params, or cookies
    const token = req.body.token;
    // console.log("req 000 : ", req);

    try {
        // Verify the token
        // console.log("token at backend ",token);
        const decodedToken = jwt.verify(token, "dhnncncdhde9ied3udnnsllsjdkjdnc");
        // console.log("decodedToken: ", decodedToken);
        res.status(200).json({ user: decodedToken });

    } catch (error) {
        throw new ApiError(500, 'Token invalid or expired')
        // res.status(401).json({  });

    }
});


export const updateData=asyncHandler(async(req,res)=>{
    // console.log("data from frontend ", req.body);
    const difficulty=req.body.difficulty;
    console.log("difficulty: ", difficulty);
    // let type;
    if(difficulty==='Easy Mode')type="easy";
    if(difficulty==='Medium Mode')type="medium";
    if(difficulty==='Hard Mode')type="hard";
    
    const points=req.body.points;
    const id=(req.body.id);
    // console.log("type: ",type);
    // Find the user
    const user = await User.findById(id);
    if(!user){
        throw new ApiError(500,"User not found while updating the user data");
    }
    // Only update if new score is higher
    // console.log(`user: ${user}`);
    // console.log(`Updating ${type} score for user ${user.userName}: ${user[type]} -> ${points}`);
    if (user[type] === null || points > user[type]) {
        user[type] = points;
        await user.save();
        return res.status(200).json(new ApiResponse(200,user,"Score updated successfully!"));
    } else {
        return res.status(200).json(new ApiResponse(200,user,"Score not updated (not higher than previous best)."));
    }
});

export const leaderboard=asyncHandler(async(req,res)=>{
    const users=await User.find().exec();
    if(!users){
        throw new ApiError(500,"Something went wrong while fetching the leaderboard")
    }
    // console.log("users at leaderboard ", users);
    let easyScore=[],mediumScore=[],hardScore=[];
    users.forEach((user)=>{
        easyScore.push({points:user.easy,username:user.userName,phone:user.phone,enroll:user.enroll});
        mediumScore.push({points:user.medium,username:user.userName,phone:user.phone,enroll:user.enroll});
        hardScore.push({points:user.hard,username:user.userName,phone:user.phone,enroll:user.enroll});
    });
    // easyScore.sort((a,b)=>a.points<=b.points);
    // mediumScore.sort((a,b)=>a.points<=b.points);
    // hardScore.sort((a,b)=>a.points<=b.points);
    return res.status(200).json(new ApiResponse(200,{easyScore,mediumScore,hardScore},"Leaderboard fetched successfully"))
});

