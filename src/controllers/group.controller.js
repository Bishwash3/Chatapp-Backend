import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResonse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../model/user.model.js"
import { Group } from "../model/group.model.js"

const createGroup = asyncHandler(async(req, res) => {
    const {groupName, description, members: rawMembers} = req.body
    const adminId = req.user?._id

    if(!groupName || !description){
        throw new ApiError(400, "Group Name and Description are required")
    }

    let members = rawMembers || []

    if(!members.includes(adminId.toString())){
        members.push(adminId.toString())
    }

    const newGroup = await Group.create({groupName, description, members, adminId})

    if(!newGroup){
        throw new ApiError(400, "Group creation faild")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newGroup,
            "Group creation succesfull"
        )
    )
})

const updateGroup = asyncHandler(async(req, res) => {
    
})

const deleteGroup = asyncHandler(async(req, res) => {
    
})

const addMember = asyncHandler(async(req, res) => {
    
})

const removeMember = asyncHandler(async(req, res) => {
    
})

const transferAdmin = asyncHandler(async(req, res) => {
    
})

export {
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    transferAdmin
}