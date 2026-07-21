const Message = require('../models/message');
const FriendRequest = require('../models/friendrequest');
const User = require('../models/user');
const { hasMutualFollow } = require('../utils/chatHelpers');
const { createNotification } = require('./notificationController');

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { recipientId, content } = req.body;

        if (!recipientId || !content || !content.trim()) {
            return res.status(400).json({ message: 'Recipient and content are required' });
        }

        const canChat = await hasMutualFollow(senderId, recipientId);
        if (!canChat) {
            return res.status(403).json({ message: 'You can only chat with users who follow each other.' });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: recipientId,
            content: content.trim()
        });

        const populated = await newMessage.populate('sender', 'firstName lastName photo');
        const fullyPopulated = await populated.populate('receiver', 'firstName lastName photo');

        // Emit Socket.io event after successful save
        if (req.app.locals.io) {
            req.app.locals.io.to(String(recipientId)).emit('receiveMessage', {
                senderId: String(senderId),
                senderName: `${fullyPopulated.sender.firstName || ''} ${fullyPopulated.sender.lastName || ''}`.trim(),
                senderPhoto: fullyPopulated.sender.photo,
                senderFirstName: fullyPopulated.sender.firstName,
                senderLastName: fullyPopulated.sender.lastName,
                content: fullyPopulated.content,
                timestamp: fullyPopulated.createdAt,
                _id: fullyPopulated._id
            });
        }

        await createNotification({
            recipientId: recipientId,
            actorId: senderId,
            type: 'message',
            message: `${fullyPopulated.sender.firstName || 'Someone'} sent you a message`,
            io: req.app.locals.io
        });

        res.status(201).json({ message: 'Message sent', data: fullyPopulated });
    } catch (err) {
        console.error('[Message Controller] Send message error:', err.message);
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
};

const getConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        const canChat = await hasMutualFollow(userId, otherUserId);
        if (!canChat) {
            return res.status(403).json({ message: 'You can only chat with users who follow each other.' });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 }).populate('sender', 'firstName lastName photo').populate('receiver', 'firstName lastName photo');

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching conversation', error: err.message });
    }
};

const getConversationsList = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversationDocs = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 }).populate('sender', 'firstName lastName photo').populate('receiver', 'firstName lastName photo');

        const conversationMap = new Map();
        conversationDocs.forEach((message) => {
            const otherUser = String(message.sender._id) === String(userId) ? message.receiver : message.sender;
            const otherUserId = String(otherUser._id);
            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: message.content,
                    lastMessageAt: message.createdAt,
                    unread: false
                });
            }
        });

        const mutualUsers = [];
        for (const entry of conversationMap.values()) {
            const canChat = await hasMutualFollow(userId, entry.user._id);
            if (canChat) {
                mutualUsers.push(entry);
            }
        }

        res.status(200).json(mutualUsers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching list', error: err.message });
    }
};

const getMutualChatUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const allUsers = await User.find({ _id: { $ne: userId } }).select('firstName lastName photo');
        const mutualUsers = [];

        for (const user of allUsers) {
            const canChat = await hasMutualFollow(userId, user._id);
            if (canChat) {
                mutualUsers.push(user);
            }
        }

        res.status(200).json(mutualUsers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching chat users', error: err.message });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getConversationsList,
    getMutualChatUsers
};