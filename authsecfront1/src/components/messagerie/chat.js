import React, { useEffect, useState, useRef } from 'react';
import { connectWebSocket, sendMessage } from './websocket';
import axios from 'axios';

const Chat = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:1217/api/messages/conversation?user1=${senderId}&user2=${receiverId}`
      );
      setMessages(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages :', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('userId', senderId);

    connectWebSocket((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    fetchMessages();
  }, [senderId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const message = {
      receiverId,   // Le backend définit automatiquement senderId via le token
      content,
    };

    sendMessage(message);
    setContent('');
  };

  return (
    <div>
      <h2>Conversation</h2>
      <div
        style={{
          border: '1px solid gray',
          height: '200px',
          overflowY: 'scroll',
          padding: '10px',
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.senderId === senderId ? 'Moi' : 'Lui'}</b>: {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez un message..."
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
};

export default Chat;
