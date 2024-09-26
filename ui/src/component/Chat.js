import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your backend URL if needed

const Chat = () => {
    const [users, setUsers] = useState([]); // List of online users
    const [messages, setMessages] = useState([]); // Message history
    const [message, setMessage] = useState(''); // Current message
    const [userId, setUserId] = useState(''); // Current user ID
    const [receiverId, setReceiverId] = useState(''); // Current receiver's ID
    const [senderName, setSenderName] = useState(''); // Sender name or username

    // Connect to socket, set userId, and handle socket events
    useEffect(() => {
        const userId = prompt('Enter your user ID:');
        const senderName = prompt('Enter your name:');
        setUserId(userId);
        setSenderName(senderName);

        socket.emit('users', userId);
        socket.on('getUsers', (users) => {
            setUsers(users);
        });

        socket.on('getMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('getUsers');
            socket.off('getMessage');
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && receiverId.trim()) {
            const newMessage = {
                connectionId: `${userId}-${receiverId}`, // connectionId format
                senderId: userId,
                senderName: senderName,
                receiverId: receiverId,
                message: message,
                createdAt: new Date(),
            };

            // Emit the message to the backend
            socket.emit('sendMessage', newMessage);

            // Update local state to show the sent message immediately
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            // Clear the input field
            setMessage('');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            {/* Display online users */}
            <div className="mb-4">
                <h2 className="text-xl font-bold">Online Users</h2>
                <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full p-2 mt-2 border rounded"
                >
                    <option value="">Select a user to chat</option>
                    {users.map((user) => (
                        <option key={user.socketId} value={user.userId}>
                            {user.userId}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display chat messages */}
            <div className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-scroll mb-4">
                {messages
                    .filter(
                        (msg) =>
                            (msg.senderId === userId && msg.receiverId === receiverId) ||
                            (msg.senderId === receiverId && msg.receiverId === userId)
                    )
                    .map((msg, index) => (
                        <div key={index} className="my-2 p-2 bg-blue-100 rounded">
                            <strong>{msg.senderName}:</strong> {msg.message}
                        </div>
                    ))}
            </div>

            {/* Message input and send button */}
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Type your message..."
                />
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white rounded"
                    disabled={!receiverId}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
