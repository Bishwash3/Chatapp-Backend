import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResonse.js"
import { Notification } from "../model/notification.model.js"

// create a notification and emit via socket if recipient online
export const createNotificationAndEmit = async (app, payload) => {
  const notification = await Notification.create(payload)

  try {
    const io = app.get('io')
    const connectedUsers = app.get('connectedUsers')
    const recipientSocketId = connectedUsers.get(payload.recipient.toString())
    if (io && recipientSocketId) {
      io.to(recipientSocketId).emit('new_notification', {
        id: notification._id,
        type: notification.type,
        actor: notification.actor,
        data: notification.data,
        createdAt: notification.createdAt,
      })
    }
  } catch (err) {
    console.error('Failed to emit notification', err)
  }

  return notification
}

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { page = 1, limit = 20 } = req.query

  const skip = (Number(page) - 1) * Number(limit)

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('actor', 'username profilePicture')

  res.status(200).json(new ApiResponse(200, notifications))
})

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const count = await Notification.countDocuments({ recipient: userId, read: false })
  res.status(200).json(new ApiResponse(200, { unreadCount: count }))
})

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { id } = req.params

  const notification = await Notification.findOne({ _id: id, recipient: userId })
  if (!notification) throw new ApiError(404, 'Notification not found')

  notification.read = true
  await notification.save()

  res.status(200).json(new ApiResponse(200, {}, 'Notification marked as read'))
})

export default {
  createNotificationAndEmit,
  getNotifications,
  getUnreadCount,
  markAsRead,
}
