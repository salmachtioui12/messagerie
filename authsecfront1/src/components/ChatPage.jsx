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
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const token = localStorage.getItem("accessToken");
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedMessageId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    if (!userId || !receiverId) return;
    
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
    if (!receiverId) return;
    
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
    if (!userId) return;
    
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

      // Si le message est complètement supprimé
      if (updatedMessage.completelyDeleted) {
        // Si c'est le dernier message d'une conversation
        const updatedConversations = prev.map(conv => {
          if (conv.lastMessageId === updatedMessage.id) {
            // Trouver le nouveau dernier message
            const conversationMessages = messages.filter(m => 
              ((m.senderId === userId && m.receiverId === otherUserId) ||
               (m.senderId === otherUserId && m.receiverId === userId)) &&
              shouldDisplayMessage(m)
            );
            
            const lastMsg = conversationMessages[conversationMessages.length - 1];
            
            return {
              ...conv,
              lastMessage: lastMsg?.content || "Message supprimé",
              lastMessageId: lastMsg?.id,
              timestamp: lastMsg?.timestamp || conv.timestamp
            };
          }
          return conv;
        });
        
        return updatedConversations.filter(shouldDisplayConversation);
      }

      if (existingConvIndex >= 0) {
        const updatedConversations = prev.map(conv => {
          if (conv.userId === otherUserId) {
            const isUnreadUpdate = updatedMessage.receiverId === userId && !updatedMessage.read;
            
            return {
              ...conv,
              lastMessage: updatedMessage.content,
              lastMessageId: updatedMessage.id,
              timestamp: updatedMessage.timestamp,
              unreadCount: isUnreadUpdate ? conv.unreadCount + 1 : conv.unreadCount,
              read: updatedMessage.senderId === userId,
              deletedBySender: updatedMessage.deletedBySender,
              deletedByReceiver: updatedMessage.deletedByReceiver,
              completelyDeleted: updatedMessage.completelyDeleted
            };
          }
          return conv;
        });

        return updatedConversations.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA;
        });
      } else {
        const newConv = {
          userId: otherUserId,
          role: updatedMessage.senderId === userId ? receiverRole : "STUDENT",
          firstname: receiverInfo?.firstname || "Nouvel utilisateur",
          lastname: receiverInfo?.lastname || "",
          lastMessage: updatedMessage.content,
          lastMessageId: updatedMessage.id,
          timestamp: updatedMessage.timestamp,
          unreadCount: updatedMessage.receiverId === userId && !updatedMessage.read ? 1 : 0,
          read: updatedMessage.senderId === userId,
          deletedBySender: updatedMessage.deletedBySender,
          deletedByReceiver: updatedMessage.deletedByReceiver,
          completelyDeleted: updatedMessage.completelyDeleted,
          senderId: updatedMessage.senderId,
          receiverId: updatedMessage.receiverId
        };

        const updatedConversations = [...prev, newConv].sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA;
        });

        return updatedConversations;
      }
    });
  }, [userId, receiverRole, receiverInfo, messages]);

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
          fetchConversations(); // Force le rafraîchissement des conversations
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
  }, [userId, receiverId, token, markMessageAsRead, syncConversationState, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !receiverId) return;

    try {
      const res = await axios.post(
        `http://localhost:1217/api/messages`,
        {
          senderId: userId,
          receiverId: parseInt(receiverId),
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sentMessage = res.data;

      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat/${receiverId}`,
          body: JSON.stringify(sentMessage),
        });
      }

      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      
      const conversationUpdate = {
        ...sentMessage,
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
      
      // Mise à jour optimiste des messages
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );
      
      // Mise à jour optimiste des conversations
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv => {
          // Si le dernier message de la conversation est celui qu'on supprime
          if (conv.lastMessageId === messageId) {
            // Trouver le nouveau dernier message non supprimé
            const remainingMessages = messages.filter(m => 
              m.id !== messageId && 
              ((m.senderId === userId && m.receiverId === conv.userId) ||
               (m.senderId === conv.userId && m.receiverId === userId)) &&
              shouldDisplayMessage(m)
            );
            
            const lastMessage = remainingMessages[remainingMessages.length - 1];
            
            return {
              ...conv,
              lastMessage: lastMessage?.content || "Message supprimé",
              lastMessageId: lastMessage?.id,
              timestamp: lastMessage?.timestamp || conv.timestamp
            };
          }
          return conv;
        });
        
        return updatedConversations.filter(shouldDisplayConversation);
      });
      
      // Envoyer la requête de suppression au serveur
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat/${messageId}/delete/${userId}`,
          body: JSON.stringify({}),
        });
      }
      
      // Rafraîchir les conversations après un court délai
      setTimeout(() => {
        fetchConversations();
      }, 300);
      
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

  const shouldDisplayConversation = (conv) => {
    if (conv.completelyDeleted) return false;
    
    // Si la conversation n'a pas de dernier message valide
    if (!conv.lastMessage || conv.lastMessage === "Message supprimé") {
      return false;
    }
    
    if (conv.senderId === userId && conv.deletedBySender) return false;
    
    if (conv.receiverId === userId && conv.deletedByReceiver) return false;
    
    return true;
  };

  const handleMessageClick = (messageId, event) => {
    event.stopPropagation();
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Messages</h3>
          {loadingConversations && <div style={styles.loadingIndicator}>Chargement...</div>}
        </div>
        <div style={styles.conversationList}>
          {conversations
            .filter(shouldDisplayConversation)
            .map((conv) => {
              const isActive = parseInt(receiverId) === conv.userId;
              const hasUnread = conv.unreadCount > 0;
              const conversationTime = formatDisplayTime(new Date(conv.timestamp));
              
              return (
                <div
                  key={conv.userId}
                  onClick={() => navigate(`/ChatPage?receiverId=${conv.userId}&role=${conv.role}`)}
                  style={{
                    ...styles.conversationItem,
                    backgroundColor: isActive 
                      ? "#e3f2fd"
                      : hasUnread 
                        ? "#f5f5f5"
                        : "#ffffff",
                  }}
                >
                  <img
                    src={conversationImages[conv.userId] || DEFAULT_PROFILE_PICTURE}
                    alt="Profile"
                    style={styles.conversationAvatar}
                  />
                  <div style={styles.conversationContent}>
                    <div style={styles.conversationHeader}>
                      <strong style={{
                        ...styles.conversationName,
                        fontWeight: hasUnread ? "600" : "500",
                        color: hasUnread ? "#000000" : "#333333"
                      }}>
                        {conv.firstname} {conv.lastname}
                      </strong>
                      <span style={styles.conversationTime}>
                        {conversationTime}
                      </span>
                    </div>
                    <div style={styles.conversationPreview}>
                      <p style={{
                        ...styles.conversationLastMessage,
                        fontWeight: hasUnread ? "500" : "400"
                      }}>
                        {conv.lastMessage?.length > 25 
                          ? `${conv.lastMessage.substring(0, 25)}...` 
                          : conv.lastMessage}
                      </p>
                      {hasUnread && (
                        <span style={styles.unreadBadge}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div style={styles.chatArea}>
       

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
                <div key={msg.id || index} style={styles.messageWrapper}>
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
                          style={styles.editInput}
                          disabled={isProcessing}
                        />
                        <div style={styles.editButtons}>
                          <button 
                            onClick={handleEditMessage}
                            disabled={isProcessing}
                            style={styles.saveEditButton}
                          >
                            {isProcessing ? "En cours..." : "Valider"}
                          </button>
                          <button 
                            onClick={cancelEditing}
                            disabled={isProcessing}
                            style={styles.cancelEditButton}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => msg.senderId === userId && handleMessageClick(msg.id, e)}
                        style={{
                          ...styles.messageBubble,
                          backgroundColor: msg.senderId === userId ? "#dcf8c6" : "#ffffff",
                          position: "relative"
                        }}
                      >
                        <div style={styles.messageContent}>
                          <div style={styles.messageText}>{msg.content}</div>
                          <div style={styles.messageMeta}>
                            {displayTime && <span style={styles.messageTime}>{displayTime}</span>}
                            {msg.senderId === userId && (
                              <>
                                <span style={{
                                  ...styles.messageStatus,
                                  color: msg.read ? "#53bdeb" : "#999999",
                                }}>
                                  {msg.read ? "✓✓" : "✓"}
                                </span>
                                {msg.edited && (
                                  <span style={styles.editedLabel}>
                                    (modifié)
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {msg.senderId === userId && msg.id && selectedMessageId === msg.id && (
                          <div ref={menuRef} style={styles.messageMenu}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(msg);
                                setSelectedMessageId(null);
                              }}
                              disabled={isProcessing}
                              style={styles.menuItem}
                            >
                              <span style={styles.menuIcon}>✏️</span> Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(msg.id);
                                setSelectedMessageId(null);
                              }}
                              disabled={isProcessing}
                              style={{ ...styles.menuItem, color: "#f44336" }}
                            >
                              <span style={styles.menuIcon}>🗑️</span> Supprimer
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

        {receiverId && rawRole ? (
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
        ) : (
          <div style={styles.noRecipientMessage}>
            <p>Sélectionnez une conversation pour envoyer un message</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fafafa",
  },
  sidebar: {
    width: "350px",
    borderRight: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
  },
  loadingIndicator: {
    fontSize: "12px",
    color: "#666",
  },
  conversationList: {
    flex: 1,
    overflowY: "auto",
  },
  conversationItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "1px solid #f0f0f0",
  },
  conversationAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    marginRight: "12px",
    objectFit: "cover",
    border: "2px solid #e0e0e0",
  },
  conversationContent: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  conversationName: {
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "70%",
  },
  conversationTime: {
    fontSize: "11px",
    color: "#757575",
  },
  conversationPreview: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationLastMessage: {
    fontSize: "13px",
    color: "#616161",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "80%",
  },
  unreadBadge: {
    backgroundColor: "#2196f3",
    color: "white",
    borderRadius: "50%",
    minWidth: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f5f5",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    padding: "15px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  chatAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    marginRight: "15px",
    objectFit: "cover",
    border: "1px solid #e0e0e0",
  },
  chatTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "500",
  },
  chatStatus: {
    margin: 0,
    fontSize: "13px",
    color: "#757575",
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    background: "#e5ddd5",
    backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')",
  },
  messageWrapper: {
    display: "flex",
    marginBottom: "2px",
    width: "100%",
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  messageDate: {
    alignSelf: "center",
    backgroundColor: "rgba(225,245,254,0.92)",
    padding: "5px 12px",
    borderRadius: "7.5px",
    fontSize: "12.5px",
    color: "#0d4b7a",
    margin: "10px 0",
    fontWeight: "500",
    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px 12px 10px 8px",
    borderRadius: "7.5px",
    position: "relative",
    marginBottom: "2px",
    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
  },
  messageContent: {
    display: "flex",
    flexDirection: "column",
  },
  messageText: {
    fontSize: "14.2px",
    lineHeight: "1.4",
    wordBreak: "break-word",
    marginRight: "40px",
    marginBottom: "7px",
  },
  messageMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    float: "right",
    margin: "-10px -5px -5px 5px",
    position: "relative",
    height: "15px",
  },
  messageTime: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.45)",
    marginRight: "3px",
    letterSpacing: "-0.3px",
    transform: "translateY(1px)",
  },
  messageStatus: {
    fontSize: "13px",
    marginLeft: "3px",
    letterSpacing: "-1px",
    transform: "translateY(-0.1px)",
  },
  editedLabel: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.45)",
    marginLeft: "4px",
    fontStyle: "italic",
  },
  messageMenu: {
    position: "absolute",
    right: 0,
    top: "100%",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 10,
    minWidth: "150px",
    overflow: "hidden",
    marginTop: "5px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
  },
  menuIcon: {
    marginRight: "8px",
    fontSize: "16px",
  },
  editInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    width: "90%",
    fontSize: "15px",
    marginBottom: "5px",
    outline: "none",
  },
  editButtons: {
    display: "flex",
    gap: "5px",
    justifyContent: "flex-end",
  },
  saveEditButton: {
    padding: "6px 12px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  cancelEditButton: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  messageInputContainer: {
    display: "flex",
    padding: "15px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e0e0e0",
  },
  messageInput: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: "24px",
    border: "1px solid #e0e0e0",
    outline: "none",
    fontSize: "15px",
  },
  sendButton: {
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    padding: "0 20px",
    borderRadius: "24px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    marginLeft: "10px",
    transition: "background-color 0.2s",
  },
  noRecipientMessage: {
    padding: "20px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0"
  }
};

export default ChatPage;