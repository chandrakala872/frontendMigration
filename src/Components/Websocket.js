// src/Components/WebSocketComponent.js
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([]);
  let stompClient = null;

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/migration-status');
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; // disable logs

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/migration-progress', (message) => {
        if (message.body) {
          setMessages((prev) => [...prev, message.body]);
        }
      });
    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <h4>Migration Progress Logs</h4>
      <div style={{ background: '#f0f0f0', padding: '10px', height: '200px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>• {msg}</div>
        ))}
      </div>
    </div>
  );
};

export default WebSocketComponent;
