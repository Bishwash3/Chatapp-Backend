import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResonse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { cloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const generateTokens = asyncHandler(async(userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, error, "something went wrong while generating tokens")
    }
})

const registerUser = asyncHandler( async (req,res) => {
    // Register User 
    const { fullName, username, email, password } = req.body

    if( [fullName, username, email, password].some((field) => field?.trim() == "")){
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({ $or: [{username},{email}]})

    if(existingUser){
        throw new ApiError(400, "User already exists")
    }

    const profilePictureLocalPath = req.file?.path

    if(!profilePictureLocalPath){
        throw new ApiError(400, "Profile Picture is required")
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

    if(!profilePicture){
        throw new ApiError(400, "Profile Picture is required")
    }

    const user = await User.create({
        fullName,
        username: username.toLowercase(),
        profilePicture: profilePicture.url,
        email,
        password

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(400, "Error while regestring User")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )
})

const loginUser = asyncHandler( async(req,res) => {
    const {email, username, password} = req.body

    if(!email && !username){
        throw new ApiError(400, "Username or Password is invalid")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid username or password")
    }

    const {accessToken, refreshToken} = generateTokens(user._id)

    const loggedInUser = await User.findByIdAndUpdate(user._id, {
            status: "online"
        },
        { new: true}
    ).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in succesfully"
        )
    )
})

const  logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "User Id Not Found")
    }

    const user = await User.findOneAndUpdate(userId,
         {
        $unset: {
            refreshToken: 1
        },
        status: "offline"
    },
    { new: true }
    )

    if(!user){
        throw new ApiError(400, "Somethinf Went wrong while logging out user")
    }

const options = {
    httpOnly: true,
    secure: true,
}

return res
.status(200)
.clearCookie("rerfeshToken", options)
.clearCookie("accessToken", options)
.json(
    new ApiResponse(200, {status: user.status}, "User logged out Succesfully")
)

})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Access")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken._id)

    if(!user){
        throw new ApiError(400, "Invalid Refresh Token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(400, "Refresh Token Is Expired")
    }

    const {accessToken, newRefreshToken} = await generateTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .ststus(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken, refreshToken: newRefreshToken
            },
            "Access Token Refreshed Succesfully"
        )   
    )
})

const changePassword = asyncHandler(async (req, res) => {
    const {currentPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(400, "user not found")
    }

    const isPasswordValid = user.isPasswordCorrect(currentPassword)

    if(!isPasswordValid){
        throw ApiError(400, "Invalid Credentials")
    }

    user.password = newPassword

    return res
    .status(200)
    .json(
        200,
        {},
        "password changed Succesully"
    )

})

const getCurrentUser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "User fetched Succesfully")
    )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullname, email, username} = req.body

    if(!fullname && !email && !username){
        throw new ApiError(400, "Fields are required to updae user")
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (fullname) updateData.fullname = fullname;
    if (email) updateData.email = email;


    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: { $set: updateData }
        },
        { new : true}
    ).select("-password")   

    if(!user){
        throw new ApiError("User Not Found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User Updated Succesfully")
    )
})

const updateProfilePic = asyncHandler(async (req, res) => {
    const profilePictureLocalPath = req.file?.path

    if(!profilePictureLocalPath){
        throw new ApiError(401, "File Not Found")
    }

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(400, "User Not Found")
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

    if(!profilePicture.url){
        throw new ApiError(400, "something went wrong while uploading picture on cloudinary")
    }

    const updatedProfilePicture = await User.findByIdAndUpdate(user._id, {
        $set : {
            profilePicture: profilePicture.url
            }
        },
    { new: true}
    ).select("-password")

    return res
    .ststus(200)
    .json(
        new ApiResponse(200, updatedProfilePicture, "Profile Picture Updated Succesfully")
    )
})

const getUserProfile = asyncHandler(async (req, res) => {
    const {username} = req.params
    const currentUser = req.user?._id

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }

    const user = await User.aggregate([
        {
            $match: {
                username: username?.toLowercase()
            }
        },
        {
            $lookup: {
                from: "friends",
                localField: "_id",
                foreignField: "user1",    //check forthe matches where user1 is the user
                as: "friendList1",
            }
        },
        {
            $lookup: {
                from: "friends",
                localField: "_id",
                foreignField: "user2",     ////check forthe matches where user2 is the user
                as: "friendList2"
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                friendList: {$concatArrays: ["$friendList1", "$friendList2"]}  //merge list of friends
            }
        },
        {
            $addFields: {
                isFriend: {
                    $in: [currentUser, { $map: { input: "$friendList", as: "friend", in: "$friend._id"}}]
                }
            }
        }
    ])

    if(!user || user.length == 0) {
        throw new ApiError(200, "User Not Found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                username: user[0].username,
                email: user[0].email,
                isFriend: user[0].isFriend
            },
            "User Data Fetched succesfully"
        )
    )
})

const checkStatus = asyncHandler(async (req,res) => {
    const {username} = req.params

    if(!username){
        throw new ApiError(200, "Username not found")
    }

    const user = await User.findOne(username).select("status")

    if(!user){
        throw new ApiError(400, "User Not Found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {status: user.status},
            "User Status Fetched Succesfully"
        )
    )
})