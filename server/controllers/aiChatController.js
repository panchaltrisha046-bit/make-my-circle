const AIChat = require('../models/aichat');
const { streamAssistantReply, getAssistantReply } = require('../services/aiService');

const buildConversationTitle = (content) => {
  const clean = String(content || '').trim();
  if (!clean) return 'New Conversation';
  return clean.length > 50 ? `${clean.slice(0, 50)}...` : clean;
};

const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const newChat = await AIChat.create({
      user: userId,
      title: title || 'New Conversation',
      messages: []
    });

    res.status(201).json({ message: 'Conversation created', data: newChat });
  } catch (error) {
    console.error('[AI Chat] Create conversation error:', error.message);
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
};

// Get all AI conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await AIChat.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title createdAt updatedAt messages');

    res.status(200).json(conversations);
  } catch (error) {
    console.error('[AI Chat] Get conversations error:', error.message);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Get a specific AI conversation
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const conversation = await AIChat.findOne({ _id: chatId, user: userId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('[AI Chat] Get conversation error:', error.message);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId, content } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let conversation;
    if (chatId) {
      conversation = await AIChat.findOne({ _id: chatId, user: userId });
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      conversation = await AIChat.create({
        user: userId,
        title: buildConversationTitle(content),
        messages: []
      });
    }

    const userMessage = {
      role: 'user',
      content: String(content).trim(),
      timestamp: new Date()
    };

    conversation.messages.push(userMessage);
    const history = conversation.messages.slice(-12);

    try {
      const aiResponse = await getAssistantReply(
        history.slice(0, -1),
        userMessage.content
      );

      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      if (!conversation.title || conversation.title === 'New Conversation') {
        conversation.title = buildConversationTitle(userMessage.content);
      }

      await conversation.save();

      res.status(200).json({
        message: 'Message sent',
        data: conversation,
        aiResponse
      });
    } catch (aiError) {
      console.error('[AI Chat] AI generation error:', aiError.message);
      // Return error but don't save the failed attempt
      res.status(500).json({
        message: 'Error generating AI response',
        error: aiError.message
      });
    }
  } catch (error) {
    console.error('[AI Chat] Send message error:', error.message);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

const streamMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId, content } = req.body;

    console.log('[AI Chat] Stream message request:', { userId, chatId, contentLength: content?.length });

    if (!content || !String(content).trim()) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Message content is required' })}\n\n`);
      res.end();
      return;
    }

    let conversation;
    if (chatId) {
      conversation = await AIChat.findOne({ _id: chatId, user: userId });
      if (!conversation) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Conversation not found' })}\n\n`);
        res.end();
        return;
      }
    } else {
      conversation = await AIChat.create({
        user: userId,
        title: buildConversationTitle(content),
        messages: []
      });
    }

    const userMessage = {
      role: 'user',
      content: String(content).trim(),
      timestamp: new Date()
    };

    conversation.messages.push(userMessage);
    const history = conversation.messages.slice(-12);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) {
      res.flushHeaders();
    }

    const sendEvent = (payload) => {
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (writeErr) {
        console.error('[AI Chat] Error writing to stream:', writeErr.message);
      }
    };

    try {
      let fullReply = '';
      await streamAssistantReply(
        history.slice(0, -1),
        userMessage.content,
        (chunk) => {
          if (chunk) {
            fullReply += chunk;
            sendEvent({ type: 'chunk', chunk });
          }
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: fullReply,
        timestamp: new Date()
      };

      conversation.messages.push(assistantMessage);

      if (!conversation.title || conversation.title === 'New Conversation') {
        conversation.title = buildConversationTitle(userMessage.content);
      }

      await conversation.save();

      console.log('[AI Chat] Stream completed successfully');
      sendEvent({ type: 'done', fullText: assistantMessage.content, conversation });
      res.end();
    } catch (aiError) {
      console.error('[AI Chat] AI streaming error:', aiError.message);
      sendEvent({ type: 'error', message: aiError.message });
      res.end();
    }
  } catch (error) {
    console.error('[AI Chat] Stream message error:', error.message);
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    } catch (endErr) {
      console.error('[AI Chat] Error ending stream:', endErr.message);
    }
  }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const conversation = await AIChat.findOneAndDelete({ _id: chatId, user: userId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('[AI Chat] Delete conversation error:', error.message);
    res.status(500).json({ message: 'Error deleting conversation', error: error.message });
  }
};

// Update conversation title
const updateTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { title } = req.body;

    const conversation = await AIChat.findOneAndUpdate(
      { _id: chatId, user: userId },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ message: 'Title updated', data: conversation });
  } catch (error) {
    console.error('[AI Chat] Update title error:', error.message);
    res.status(500).json({ message: 'Error updating title', error: error.message });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  streamMessage,
  deleteConversation,
  updateTitle
};
