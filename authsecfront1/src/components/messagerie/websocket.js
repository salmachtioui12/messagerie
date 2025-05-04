import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {
  const socket = new SockJS('http://localhost:1217/ws');
  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log('✅ WebSocket connecté');

      const userId = localStorage.getItem('userId');
      stompClient.subscribe(`/topic/messages/${userId}`, (msg) => {
        onMessageReceived(JSON.parse(msg.body));
      });
    },
  });
  stompClient.activate();
};

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    const { receiverId } = message;
    stompClient.publish({
      destination: `/app/chat/${receiverId}`, // <-- Cible uniquement le bon utilisateur
      body: JSON.stringify(message),
    });
  }
};
