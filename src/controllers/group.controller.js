import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResonse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../model/user.model.js"
import { Group } from "../model/group.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { isValidObjectId } from "mongoose"

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
    const {groupName, description} = req.body
    const {groupId} = req.params
    const groupPictureLocalPath = req.file?.path

    if(!isValidObjectId(groupId)){
        throw new ApiError(400, "Invalid ObjectId (groupId)")
    }

    const updatedGroupName = groupName?.trim()
    const updatedDescription = description?.trim()

    if(!updatedGroupName && !updatedDescription && !groupPictureLocalPath){
        throw new ApiError(400, "Fields are empty to update")
    }

    const group = await Group.findById(groupId)

    if(!group){
        throw new ApiError(400, "Group Not Found")
    }

    if(req.user?._id.toString() !== group.adminId.toString()){
        throw new ApiError(403, "You are not authorized to update group details")
    }

    const updatedFields = {};
    if (updatedGroupName) updatedFields.groupName = updatedGroupName;
    if (updatedDescription) updatedFields.description = updatedDescription;

    if(groupPictureLocalPath){
    const groupProfilePicture = await uploadOnCloudinary(groupPictureLocalPath)
    

    if(!groupProfilePicture || !groupProfilePicture.url){
        throw new ApiError(400, "something went wrong while uploading picture on cloudinary")
    }

    updatedFields.groupPicture = groupProfilePicture.url

    try {
        fs.unlinkSync(groupPictureLocalPath)
    } catch (error) {
        throw new ApiError(400, error.message || "failed to delete local file")
    }

    }

    const updatedGroupdetails = await Group.findByIdAndUpdate(
        group._id,
        updatedFields,
        {
            new: true
        }
        )

        if(!updatedGroupdetails){
            throw new ApiError(400, "Failed to update group detils")
        }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedGroupdetails,
            "Group updated succesfully"
        )
    )
})

const deleteGroup = asyncHandler(async(req, res) => {
    const {groupId} = req.params

    if(!isValidObjectId(groupId)){
        throw new ApiError(400, "Invalid Id (group Id)")
    }

    const group = await Group.findById(groupId)

    if(!group){
        throw new ApiError(404, "Group not found")
    }

    if(req.user?._id.toString() !== group.adminId.toString()){
        throw new ApiError(400, "You are not authorized to delete Group")
    }

    const deleatedGroup = await Group.findByIdAndDelete(groupId)

    if(!deleatedGroup){
        throw new ApiError(500, "Failed to delete the group")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Group deleated Succesfully")
    )

})

const addMember = asyncHandler(async(req, res) => {
        const { groupId } = req.params
        const { userId } = req.body

    if (!isValidObjectId(groupId)) {
        throw new ApiError(400, "Invalid Group ID")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }

    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found")
    }


    if (req.user?._id.toString() !== group.adminId.toString()) {
        throw new ApiError(403, "You are not authorized to add members to this group")
    }

    if (group.members.includes(userId)) {
        throw new ApiError(400, "User is already a member of the group")
    }

    group.members.push(userId)
    await group.save()

    
    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        group,
        "Member added successfully"
        )
    );
})

const removeMember = asyncHandler(async(req, res) => {
    const {groupId, userId} = req.params

    if(!isValidObjectId(groupId)){
        throw new ApiError(400, "Invalid GroupID")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid GroupID")
    }

    const group = await Group.findById(groupId)

    if(!group){
        throw new ApiError(400, "Group Not Found")
    }

    if (req.user?._id.toString() !== group.adminId.toString()) {
        throw new ApiError(403, "You are not authorized to remove members from this group");
      }

    const existingMember = group.members.some( (member) => member.userId.toString === userId)

    if(!existingMember){
        throw new ApiError(400, "User is not a member of group")
    }

    if (group.adminId.toString() === userId) {
        throw new ApiError(400, "The group admin cannot be removed");
      }

    group.members = group.members.filter( (member) => member.userId.toString !== userId)
    await group.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {group, removedMemberId: userId},
            "Member removed succesfully"
        )
    )
})

const transferAdmin = asyncHandler(async(req, res) => {
    const {groupId, userId} = req.params

    if(!isValidObjectId(groupId)){
        throw new ApiError(400, "Invalid GroupID")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid UserID")
    }

    const group = await Group.findById(groupId)

    if(!group){
        throw new ApiError(400, "Group Not Found")
    }

    if (req.user?._id.toString() !== group.adminId.toString()) {
        throw new ApiError(403, "You are not authorized to transfer admin rights in this group");
      }

    const isMember = group.members.some( (member) => member.toString() === userId)

    if(!isMember){
        throw new ApiError(400, "Not a group member")
    }

    group.adminId = userId
    group.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {groupId: group._id, newAdminId: userId},
            "Admin rights Transfered succesfully"
        )
    )
})

const getAllMember = asyncHandler(async(req, res) => {
    
})

export {
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    transferAdmin,
    getAllMember
}