import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResonse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Friends } from '../model/friend.model.js'
import { User } from "../model/user.model.js"

const addFriend = asyncHandler(async(req, res) => {
    const user1 = req.user?.id  // user who is logged in
    const username = req.body   // user whome you want to add as friend

    if(!username){
        throw new ApiError(400, "username is required")
    }

    if(user1 === username){
        throw new ApiError(400, "You cannot add yourself as friend")
    }

    const userByusername = await User.findOne({username: username})
    if(!userByusername){
        throw new ApiError(400, "User not found")
    }

    const user2Id = userByusername._id

    const user2Details = await User.findById(user2Id).select("username profilePicture")
    if(!user2Details){
        throw new ApiError(400, "User not found")
    }

    const existingUser = await Friends.findOne({
        $or: [
            {user1, user2: user2Id},
            {user1: user2Id, user2: user1}
        ]
    })

    if(existingUser) {
        throw new ApiError(400, "Friendship already exists")
    }

    const newFriend = await Friends.create({user1, user2: user2Id})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                friendship: newFriend._id,
                user2: {
                    id: user2Details.username,
                    profilePicture:  user2Details.profilePicture
                }
            },
            "Friend Added Succesfully"
        )
    )
})

const removeFriend = asyncHandler(async(req,res) => {
    const user1 = req.user?.id
    const user2 = req.params

    if(!user2){
        throw new ApiError(400, "User 2 (Friend Id) is required in params")
    }

    if(user1 === user2){
        throw new ApiError (400, "You cannot remove yourself as friend")
    }

    const friend = await Friends.findOneAndDelete({
        $or: [
            {user1, user2},
            {user1: user2, user2: user1}
        ]
    })

    if(!friend){
        throw new ApiError(400, "Friendship does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Friendship removed successfully"
        )
    )
})

export {
    addFriend,
    removeFriend
}