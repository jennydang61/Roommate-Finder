import './Messages.css';
import React, { useState } from "react";

const Messages = () => {
  // hard code
  const [chatUsers] = useState([
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
  ]);  
  // hard code
  const [messages, setMessages] = useState({
    1: [{ sender: "Alice", content: "Hi there!" }],
    2: [{ sender: "Bob", content: "Hello, how are you?" }],
  });

  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [currentChat.id]: [...(prev[currentChat.id] || []), { sender: "You", content: newMessage }],
    }));
    setNewMessage(""); // clear input
  };

  return (
    <div id="messages-container">
      <h2>Messages</h2>
      {currentChat ? (
        <div>
          <h3>Chat with {currentChat.name}</h3>
          <ul>
            {(messages[currentChat.id] || []).map((msg, index) => (
              <li key={index}>
                <strong>{msg.sender}:</strong> {msg.content}
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
          <button onClick={() => setCurrentChat(null)}>Back</button>
        </div>
      ) : (
        <ul>
          {chatUsers.map((user) => (
            <li key={user.id}>
              {user.name}{" "}
              <button onClick={() => setCurrentChat(user)}>Chat</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );  
};

export default Messages;
