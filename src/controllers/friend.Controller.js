const friendRequest = require("../models/friend.Request.model");
const User = require("../models/user.model");

const sendFriendRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Recipient email is required"
            });
        }
        const recipient = await User.findOne({
            email
        })
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "User with this email does not exist"
            });
        }
        if (recipient._id.equals(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a friend request to yourself"
            });
        }
        const existingRequest = await friendRequest.findOne({
            $or: [
                {
                    requester: req.user._id,
                    recipient: recipient._id
                },
                {
                    requester: recipient._id,
                    recipient: req.user._id
                }
            ]
        })
        if (existingRequest) {
            const message = existingRequest.status === "pending"
                ? "A pending friend request already exists"
                : existingRequest.status === "accepted"
                    ? "You are already friends"
                    : "A previous request exists. Handle it before sending another.";

            return res.status(409).json({ success: false, message });
        }

        const friend_Request = await friendRequest.create({
            requester: req.user._id,
            recipient: recipient._id
        });

        return res.status(201).json({
            success: true,
            message: "Friend request sent successfully",
            friend_Request
        });

    } catch (error) {
        console.error("Send friend request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send friend request"
        });
    }
}

const getFriendRequest = async (req, res) => {
    try {
        const requests = await friendRequest.find({
                recipient: req.user._id,
                status: "pending"
            })
            .populate("requester", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("getFriendRequest error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch friend requests"
        });
    }
};


const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await friendRequest.findOne({
            _id: requestId,
            recipient: req.user._id,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found"
            });
        }

        request.status = "accepted";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "You accepted the request",
            request
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to accept friend request"
        });
    }
};

const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await friendRequest.findOne({
            _id: requestId,
            recipient: req.user._id,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found"
            });
        }

        request.status = "rejected";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "You reject the request",
            request
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to accept friend request"
        });
    }
}

const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await friendRequest.find({
            status: "accepted",
            $or: [
                { requester: userId },
                { recipient: userId }
            ]
        }).populate("requester", "name email").populate("recipient", "name email");

        const friends = friendships.map((friendship) => {
            if (friendship.requester._id.equals(userId)) {
                return friendship.recipient;
            }
            return friendship.requester;
        });

        return res.status(200).json({
            success: true,
            count: friends.length,
            friends
        });

    } catch (error) {
        console.error("Get friends error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch friends"
        });
    }
};

const cancelFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const isRequestPending = await friendRequest.findOne({
            _id: requestId,
            requester: req.user._id,
            status: "pending"
        });

        if (!isRequestPending) {
            return res.status(404).json({
                success: false,
                message: "Pending friend request not found"
            });
        }

        await isRequestPending.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Friend request cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel friend request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel friend request"
        });
    }
};

const deleteFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        if (userId.equals(friendId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot remove yourself"
            });
        }

        const friendship = await friendRequest.findOne({
            status: "accepted",
            $or: [
                { requester: userId, recipient: friendId },
                { requester: friendId, recipient: userId }
            ]
        });

        if (!friendship) {
            return res.status(404).json({
                success: false,
                message: "Friendship not found"
            });
        }

        await friendship.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Friend removed successfully"
        });

    } catch (error) {
        console.error("Remove friend error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove friend"
        });
    }
};

module.exports = { sendFriendRequest, getFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, cancelFriendRequest, deleteFriend };