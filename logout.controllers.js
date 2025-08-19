import {asyncHandler} from "./utils/asyncHandler.js";

export const logoutUser = asyncHandler(async(req, res) => {
    const id=req.body.id;
    await User.findByIdAndUpdate(
        id,
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