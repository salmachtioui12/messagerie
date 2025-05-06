import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/40";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const receiverId = queryParams.get("receiverId");
  const rawRole = queryParams.get("role");
  const receiverRole = rawRole?.toUpperCase() === "USER" ? "STUDENT" : rawRole?.toUpperCase() || "STUDENT";
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [receiverImage, setReceiverImage] = useState(DEFAULT_PROFILE_PICTURE);
  const [conversations, setConversations] = useState([]);
  const [conversationImages, setConversationImages] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const token = localStorage.getItem("accessToken");
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const formatDisplayDate = (date) => {
    return date?.toLocaleDateString() || "";
  };

  const formatDisplayTime = (date) => {
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "";
  };

  useEffect(() => {
    if (!token) navigate("/login");
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(parseInt(storedUserId));
  }, [token, navigate]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:1217/api/messages/conversation?user1=${userId}&user2=${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
      res.data.forEach((msg) => {
        if (msg.receiverId === userId && !msg.read) {
          markMessageAsRead(msg.id);
        }
      });
    } catch (err) {
      console.error("Erreur lors du chargement des messages", err);
    }
  }, [userId, receiverId, token]);

  const fetchReceiverInfo = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:1217/api/search/profile/${receiverId}?role=${receiverRole}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReceiverInfo(res.data);

      const imgRes = await axios.get(
        `http://localhost:1217/api/search/image?userId=${receiverId}&role=${receiverRole}`,
        { 
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      setReceiverImage(URL.createObjectURL(imgRes.data));
    } catch (err) {
      console.error("Erreur profil ou image", err);
      setReceiverImage(DEFAULT_PROFILE_PICTURE);
    }
  }, [receiverId, token, receiverRole]);

  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      await axios.post(
        `http://localhost:1217/api/messages/${messageId}/read`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      );
      
      setConversations(prev => prev.map(conv => {
        if (conv.userId === parseInt(receiverId)) {
          return {
            ...conv,
            unreadCount: Math.max(0, conv.unreadCount - 1)
          };
        }
        return conv;
      }));
    } catch (err) {
      console.error("Erreur lecture message", err);
    }
  }, [token, receiverId]);

  const fetchConversationImages = useCallback(async (convs) => {
    const newImages = {};
    await Promise.all(
      convs.map(async (conv) => {
        try {
          const res = await axios.get(
            `http://localhost:1217/api/search/image?userId=${conv.userId}&role=${conv.role}`,
            { 
              responseType: "blob",
              headers: { Authorization: `Bearer ${token}` } 
            }
          );
          newImages[conv.userId] = URL.createObjectURL(res.data);
        } catch (err) {
          newImages[conv.userId] = DEFAULT_PROFILE_PICTURE;
        }
      })
    );
    setConversationImages(newImages);
  }, [token]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await axios.get(
        `http://localhost:1217/api/messages/conversations/history?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const sortedConversations = res.data.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
      
      setConversations(sortedConversations);
      fetchConversationImages(sortedConversations);
    } catch (err) {
      console.error("Erreur chargement conversations", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [userId, token, fetchConversationImages]);

  const syncConversationState = useCallback((updatedMessage) => {
    setConversations(prev => {
      const otherUserId = updatedMessage.senderId === userId 
        ? updatedMessage.receiverId 
        : updatedMessage.senderId;
      
      const existingConvIndex = prev.findIndex(conv => 
        conv.userId === otherUserId
      );

      if (existingConvIndex >= 0) {
        // Mettre à jour la conversation existante
        const updatedConversations = prev.map(conv => {
          if (conv.userId === otherUserId) {
            const isUnreadUpdate = updatedMessage.receiverId === userId && !updatedMessage.read;
            
            return {
              ...conv,
              lastMessage: updatedMessage.content,
              timestamp: updatedMessage.timestamp,
              unreadCount: isUnreadUpdate ? conv.unreadCount + 1 : conv.unreadCount,
              read: updatedMessage.senderId === userId
            };
          }
          return conv;
        });

        // Trier les conversations après mise à jour
        return updatedConversations.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA;
        });
      } else {
        // Créer une nouvelle conversation
        const newConv = {
          userId: otherUserId,
          role: updatedMessage.senderId === userId ? receiverRole : "STUDENT",
          firstname: receiverInfo?.firstname || "Nouvel utilisateur",
          lastname: receiverInfo?.lastname || "",
          lastMessage: updatedMessage.content,
          timestamp: updatedMessage.timestamp,
          unreadCount: updatedMessage.receiverId === userId && !updatedMessage.read ? 1 : 0,
          read: updatedMessage.senderId === userId
        };

        // Ajouter la nouvelle conversation et trier
        const updatedConversations = [...prev, newConv].sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA;
        });

        return updatedConversations;
      }
    });
  }, [userId, receiverRole, receiverInfo]);

  useEffect(() => {
    if (userId && receiverId) {
      fetchMessages();
      fetchReceiverInfo();
    }
  }, [userId, receiverId, fetchMessages, fetchReceiverInfo]);

  useEffect(() => {
    if (userId) fetchConversations();
  }, [userId, fetchConversations]);

  useEffect(() => {
    if (conversations.length > 0) {
      fetchConversationImages(conversations);
    }
  }, [conversations, fetchConversationImages]);

  useEffect(() => {
    if (!userId || !receiverId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:1217/ws"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log("✅ WebSocket connecté");

        client.subscribe(`/topic/messages/${userId}`, async (msgOutput) => {
          const message = JSON.parse(msgOutput.body);
          const isCurrentChat = message.senderId === parseInt(receiverId) && message.receiverId === userId;

          if (isCurrentChat) {
            if (message.receiverId === userId) {
              await markMessageAsRead(message.id);
              message.read = true;
            }
            setMessages((prevMessages) => [...prevMessages, message]);
          }

          syncConversationState(message);
        });

        client.subscribe(`/topic/messages/update/${userId}`, (updateOutput) => {
          const updatedMessage = JSON.parse(updateOutput.body);
          
          setMessages(prevMessages => {
            if (updatedMessage.completelyDeleted) {
              return prevMessages.filter(msg => msg.id !== updatedMessage.id);
            }
            
            return prevMessages.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            );
          });

          syncConversationState(updatedMessage);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [userId, receiverId, token, markMessageAsRead, syncConversationState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId) return;

    const message = {
      senderId: userId,
      receiverId: parseInt(receiverId),
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat/${receiverId}`,
          body: JSON.stringify(message),
        });
      }

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      
      // Mettre à jour les conversations avec les dernières infos
      const conversationUpdate = {
        ...message,
        firstname: receiverInfo?.firstname || "Nouvel utilisateur",
        lastname: receiverInfo?.lastname || "",
        role: receiverRole
      };
      
      syncConversationState(conversationUpdate);
    } catch (err) {
      console.error("Erreur d'envoi", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setIsProcessing(true);
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat/${messageId}/delete/${userId}`,
          body: JSON.stringify({}),
        });
      }
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );
    } catch (err) {
      console.error("Erreur lors de la suppression du message", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const startEditing = (message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleEditMessage = async () => {
    if (!editContent.trim() || !editingMessageId) return;

    try {
      setIsProcessing(true);
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat/${editingMessageId}/edit/${userId}`,
          body: editContent,
        });
      }
      setEditingMessageId(null);
      setEditContent("");
    } catch (err) {
      console.error("Erreur lors de la modification du message", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const shouldDisplayMessage = (msg) => {
    if (msg.completelyDeleted) return false;
    
    if (msg.senderId === userId) {
      return !msg.deletedBySender;
    } else {
      return !msg.deletedByReceiver;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Conversations</h3>
          {loadingConversations && <div style={styles.loadingIndicator}>Actualisation...</div>}
        </div>
        {conversations.map((conv) => {
          const convDate = formatDate(conv.timestamp);
          return (
            <div
              key={conv.userId}
              onClick={() => navigate(`/ChatPage?receiverId=${conv.userId}&role=${conv.role}`)}
              style={{
                ...styles.conversationItem,
                backgroundColor: parseInt(receiverId) === conv.userId ? "#e3f2fd" : "transparent",
              }}
            >
              <img
                src={conversationImages[conv.userId] || DEFAULT_PROFILE_PICTURE}
                alt="img"
                style={styles.conversationAvatar}
              />
              <div style={styles.conversationContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={styles.conversationName}>
                    {conv.firstname} {conv.lastname}
                  </strong>
                  {conv.unreadCount > 0 && (
                    <span style={styles.unreadBadge}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div style={{
                  ...styles.conversationLastMessage,
                  color: conv.read ? "#757575" : "#212121",
                  fontWeight: conv.read ? "normal" : "500",
                }}>
                  {conv.lastMessage?.slice(0, 20)}...
                </div>
                <div style={styles.conversationTime}>
                  {convDate ? formatDisplayDate(convDate) + " " + formatDisplayTime(convDate) : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.chatArea}>
        {receiverInfo && (
          <div style={styles.chatHeader}>
            <img
              src={receiverImage}
              alt="Profil"
              style={styles.chatAvatar}
            />
            <h3 style={styles.chatTitle}>
              {receiverInfo.firstname} {receiverInfo.lastname}
            </h3>
          </div>
        )}

        <div style={styles.messagesContainer}>
          {messages
            .filter(shouldDisplayMessage)
            .map((msg, index) => {
              const messageDate = formatDate(msg.timestamp);
              const displayTime = formatDisplayTime(messageDate);
              const displayDate = formatDisplayDate(messageDate);
              const prevMessageDate = index > 0 ? formatDate(messages[index-1].timestamp) : null;
              const prevDisplayDate = prevMessageDate ? formatDisplayDate(prevMessageDate) : null;
              
              return (
                <div key={index} style={styles.messageWrapper}>
                  <div style={{
                    ...styles.messageContainer,
                    alignItems: msg.senderId === userId ? "flex-end" : "flex-start",
                  }}>
                    {(index === 0 || displayDate !== prevDisplayDate) && displayDate && (
                      <div style={styles.messageDate}>
                        {displayDate}
                      </div>
                    )}
                    
                    {editingMessageId === msg.id ? (
                      <div style={{ 
                        ...styles.messageBubble, 
                        backgroundColor: msg.senderId === userId ? "#dcf8c6" : "#ffffff",
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                      }}>
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={{ 
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            width: '100%'
                          }}
                          disabled={isProcessing}
                        />
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={handleEditMessage}
                            disabled={isProcessing}
                            style={{ 
                              padding: '5px 10px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px'
                            }}
                          >
                            {isProcessing ? "En cours..." : "Valider"}
                          </button>
                          <button 
                            onClick={cancelEditing}
                            disabled={isProcessing}
                            style={{ 
                              padding: '5px 10px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px'
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        ...styles.messageBubble,
                        backgroundColor: msg.senderId === userId ? "#dcf8c6" : "#ffffff",
                      }}>
                        <div style={styles.messageText}>{msg.content}</div>
                        <div style={styles.messageFooter}>
                          {displayTime && <span style={styles.messageTime}>{displayTime}</span>}
                          {msg.senderId === userId && (
                            <>
                              <span style={{
                                ...styles.messageStatus,
                                color: msg.read ? "#4fc3f7" : "#aaa",
                              }}>
                                {msg.read ? "✓✓" : "✓"}
                              </span>
                              {msg.edited && (
                                <span style={{ fontSize: '10px', color: '#666', marginLeft: '5px' }}>
                                  (modifié)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {msg.senderId === userId && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '5px', 
                            marginTop: '5px', 
                            justifyContent: 'flex-end' 
                          }}>
                            <button
                              onClick={() => startEditing(msg)}
                              disabled={isProcessing}
                              style={{ 
                                fontSize: '12px', 
                                padding: '2px 5px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px'
                              }}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              disabled={isProcessing}
                              style={{ 
                                fontSize: '12px', 
                                padding: '2px 5px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px'
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.messageInputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Écrivez un message..."
            style={styles.messageInput}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            style={styles.sendButton}
            disabled={isProcessing || !newMessage.trim()}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  sidebar: {
    width: 300,
    borderRight: "1px solid #e0e0e0",
    overflowY: "auto",
    backgroundColor: "#f5f5f5",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    backgroundColor: "#f5f5f5",
    zIndex: 1,
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "500",
    color: "#333",
  },
  loadingIndicator: {
    fontSize: "12px",
    color: "#666",
  },
  conversationItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    borderBottom: "1px solid #e0e0e0",
    ':hover': {
      backgroundColor: "#eeeeee",
    },
  },
  conversationAvatar: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    marginRight: "12px",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  conversationContent: {
    flex: 1,
    minWidth: 0,
  },
  conversationName: {
    fontSize: "14px",
    marginBottom: "3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  unreadBadge: {
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  },
  conversationLastMessage: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  conversationTime: {
    fontSize: "11px",
    color: "#9e9e9e",
    marginTop: "3px",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fafafa",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    padding: "15px 20px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    marginRight: "15px",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  chatTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    background: "#e5ddd5 url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')",
  },
  messageWrapper: {
    display: "flex",
    marginBottom: "5px",
    width: "100%",
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  messageDate: {
    alignSelf: "center",
    backgroundColor: "#e5ddd5",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    color: "#666",
    margin: "10px 0",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px 15px",
    borderRadius: "18px",
    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  messageText: {
    fontSize: "15px",
    wordBreak: "break-word",
  },
  messageFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "5px",
  },
  messageTime: {
    fontSize: "11px",
    color: "#666",
    marginRight: "5px",
  },
  messageStatus: {
    fontSize: "14px",
  },
  messageInputContainer: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e0e0e0",
  },
  messageInput: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "15px",
    ':focus': {
      borderColor: "#007bff",
    },
  },
  sendButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0 20px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background-color 0.2s",
    ':hover': {
      backgroundColor: "#0069d9",
    },
  },
};

export default ChatPage;
