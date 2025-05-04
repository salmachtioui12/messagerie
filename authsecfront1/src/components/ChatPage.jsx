import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const receiverId = queryParams.get("receiverId");
const receiverRole = queryParams.get("role") || "STUDENT"; // Valeur par défaut


  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [receiverImage, setReceiverImage] = useState(null);

  const token = localStorage.getItem("accessToken");
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) navigate("/login");

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      console.error("❌ userId manquant dans localStorage");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:1217/api/messages/conversation?user1=${userId}&user2=${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des messages", err);
      }
    };

    const fetchReceiverInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:1217/api/search/profile/${receiverId}?role=${receiverRole}`);

        setReceiverInfo(res.data);

        // Récupération de l'image du profil
        const imageRes = await axios.get(
            `http://localhost:1217/api/search/image?userId=${receiverId}&role=${receiverRole}`,
            { responseType: "blob" }
          );
          
        const imageUrl = URL.createObjectURL(imageRes.data);
        setReceiverImage(imageUrl);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil ou de l'image :", err);
        setReceiverImage("https://via.placeholder.com/50?text=NA");
      }
    };

    if (userId && receiverId) {
      fetchMessages();
      fetchReceiverInfo();
    }
  }, [userId, receiverId, token]);

  useEffect(() => {
    if (!userId || !receiverId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:1217/ws"),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log("✅ WebSocket connecté avec userId:", userId);

        client.subscribe(`/topic/messages/${userId}`, (messageOutput) => {
          const message = JSON.parse(messageOutput.body);

          const isCurrentChat =
            (message.senderId === parseInt(receiverId) &&
              message.receiverId === userId) ||
            (message.senderId === userId &&
              message.receiverId === parseInt(receiverId));

          if (isCurrentChat) {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [userId, receiverId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId) return;

    const message = {
      senderId: userId,
      receiverId: parseInt(receiverId),
      content: newMessage,
    };

    try {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat/${receiverId}`,
          body: JSON.stringify(message),
        });
      }

      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
    } catch (err) {
      console.error("Erreur lors de l'envoi du message", err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      {/* 👤 HEADER DESTINATAIRE */}
      {receiverInfo && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <img
            src={receiverImage}
            alt="Profil"
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              marginRight: 10,
              objectFit: "cover",
            }}
          />
          <h3 style={{ margin: 0 }}>{receiverInfo.fullName}</h3>
        </div>
      )}

      {/* 💬 MESSAGES */}
      <div
        style={{
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.senderId === userId ? "right" : "left",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                backgroundColor:
                  msg.senderId === userId ? "#dcf8c6" : "#e6e6e6",
                padding: "8px 12px",
                borderRadius: 10,
                display: "inline-block",
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ✍️ ENTRÉE */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez un message"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default ChatPage;
