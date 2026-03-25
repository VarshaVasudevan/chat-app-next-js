'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Form, Badge } from 'react-bootstrap';
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaSearch, 
  FaArrowLeft, 
  FaSmile, 
  FaImage,
  FaCheck,
  FaCheckDouble,
  FaPhone,
  FaVideo,
  FaEllipsisV,
  FaCircle
} from 'react-icons/fa';
import io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
import EmojiPicker from './EmojiPicker';
import ImagePreview from './ImagePreview';
import Logo from './Logo';

export default function Chat({ user, token, onLogout }) {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: { userId: user.id },
      transports: ['websocket']
    });
    setSocket(newSocket);
    fetchUsers();

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [user.id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (message) => {
      if (selectedUser && message.sender._id === selectedUser._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    socket.on('messageSent', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('userTyping', (data) => {
      if (selectedUser && data.userId === selectedUser._id) {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('userStatus', ({ userId, status }) => {
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, status } : u
      ));
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageSent');
      socket.off('userTyping');
      socket.off('userStatus');
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      setIsTyping(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      
      if (socket) {
        socket.emit('markAsRead', { senderId: userId });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    socket.emit('sendMessage', {
      receiverId: selectedUser._id,
      content: messageContent,
      type: 'text'
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const sendImage = async (file) => {
    if (!file || !selectedUser || !socket) return;

    setUploadingImage(true);
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      
      socket.emit('sendMessage', {
        receiverId: selectedUser._id,
        content: base64Image,
        type: 'image'
      });
      
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      sendImage(file);
    }
  };

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selectedUser) {
        socket.emit('typing', {
          receiverId: selectedUser._id,
          isTyping: false
        });
      }
    }, 1000);
  };

  const onEmojiClick = (event, emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const formatTime = (date) => {
    return moment(date).format('h:mm A');
  };

  const formatDate = (date) => {
    const today = moment().startOf('day');
    const msgDate = moment(date).startOf('day');
    
    if (today.isSame(msgDate)) {
      return 'Today';
    } else if (today.subtract(1, 'day').isSame(msgDate)) {
      return 'Yesterday';
    } else {
      return moment(date).format('MMM D, YYYY');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex justify-content-between align-items-center">
            <Logo size="small" />
            <Button 
              variant="link" 
              onClick={onLogout}
              className="text-danger"
              style={{ textDecoration: 'none' }}
            >
              Logout
            </Button>
          </div>
          <div className="mt-3 position-relative">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '14px' }} />
            <Form.Control
              type="text"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-5 rounded-pill"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted py-5">
              <FaUserCircle size={48} />
              <p className="mt-2">No users found</p>
            </div>
          ) : (
            filteredUsers.map(u => (
              <div
                key={u._id}
                onClick={() => {
                  setSelectedUser(u);
                  setSidebarOpen(false);
                }}
                className={`user-list-item ${selectedUser?._id === u._id ? 'active' : ''}`}
              >
                <div className="user-avatar">
                  <img src={u.avatar} alt={u.username} />
                  {u.status === 'online' && (
                    <FaCircle className="status-indicator online position-absolute bottom-0 end-0" size={12} />
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{u.username}</div>
                  <div className="user-last-message">
                    {u.status === 'online' ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="user-time">
                  {u.lastSeen && moment(u.lastSeen).format('LT')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            {/* Chat Header */}
           
<div className="chat-header d-flex align-items-center justify-content-between">
  <div className="d-flex align-items-center">
    <Button
      variant="link"
      className="d-md-none me-2 text-dark p-0"
      onClick={() => setSidebarOpen(true)}
    >
      <FaArrowLeft />
    </Button>
    <div className="user-avatar me-3" style={{ width: '40px', height: '40px' }}>
      <img src={selectedUser.avatar} alt={selectedUser.username} />
    </div>
    <div>
      <h6 className="mb-0 fw-bold" style={{ color: '#075E54' }}>{selectedUser.username}</h6>
      <small className="text-muted">
        {selectedUser.status === 'online' ? (
          <span style={{ color: '#25D366' }}>Online</span>
        ) : (
          `Last seen ${moment(selectedUser.lastSeen).fromNow()}`
        )}
      </small>
    </div>
  </div>
  <div className="d-flex gap-3">
    <FaPhone className="text-secondary cursor-pointer" size={20} style={{ color: '#075E54' }} />
    <FaVideo className="text-secondary cursor-pointer" size={20} style={{ color: '#075E54' }} />
    <FaEllipsisV className="text-secondary cursor-pointer" size={20} style={{ color: '#075E54' }} />
  </div>
</div>

            {/* Messages Area */}
            <div 
              ref={messageContainerRef}
              className="chat-messages"
            >
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-white rounded-circle d-inline-flex p-4 mb-3 shadow-sm">
                        <FaUserCircle size={48} className="text-muted" />
                      </div>
                      <h6>No messages yet</h6>
                      <small className="text-muted">Start a conversation with {selectedUser.username}</small>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp);
                      const isOwn = msg.sender._id === user.id;
                      
                      return (
                        <div key={msg._id || index}>
                          {showDate && (
                            <div className="text-center my-3">
                              <Badge bg="light" className="text-muted px-3 py-2 rounded-pill">
                                {formatDate(msg.timestamp)}
                              </Badge>
                            </div>
                          )}
                          <div className={`d-flex mb-2 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
                            {!isOwn && (
                              <img
                                src={msg.sender.avatar}
                                alt={msg.sender.username}
                                className="rounded-circle me-2"
                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              />
                            )}
                            <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`}>
                              {msg.type === 'image' ? (
                                <img 
                                  src={msg.content} 
                                  alt="Shared" 
                                  className="message-image"
                                  onClick={() => setPreviewImage(msg.content)}
                                />
                              ) : (
                                <div className="message-content">{msg.content}</div>
                              )}
                              <div className="message-time">
                                {formatTime(msg.timestamp)}
                                {isOwn && (
                                  <span>
                                    {msg.read ? <FaCheckDouble size={12} /> : <FaCheck size={12} />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div className="d-flex mb-2">
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        className="rounded-circle me-2"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="text-center my-2">
                      <small className="text-muted">Uploading image...</small>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="chat-input-area">
              <Form onSubmit={sendMessage} className="d-flex gap-2">
                <Button 
                  variant="link" 
                  className="p-0 text-secondary"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <FaSmile size={24} />
                </Button>
                <Button 
                  variant="link" 
                  className="p-0 text-secondary"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaImage size={24} />
                </Button>
                <Form.Control
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="rounded-pill"
                  style={{ fontSize: '14px' }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  variant="success"
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  <FaPaperPlane size={18} />
                </Button>
              </Form>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </>
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center p-4">
            <div className="bg-white rounded-circle d-inline-flex p-5 mb-4 shadow-lg">
              <FaUserCircle size={80} className="text-success" />
            </div>
            <h5 className="fw-bold mb-2">WhatsApp Web</h5>
            <p className="text-muted mb-4">Select a chat to start messaging</p>
            <Button 
              variant="success" 
              className="d-md-none rounded-pill px-4"
              onClick={() => setSidebarOpen(true)}
            >
              Browse Chats
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreview 
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}