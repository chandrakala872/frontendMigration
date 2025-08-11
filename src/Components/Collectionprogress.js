import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function MigrationProgressBar() {
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState('Waiting for migration...');

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-migration');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('WebSocket connected');

        stompClient.subscribe('/topic/migration-progress', (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            const percent = Math.floor((data.transferred / data.total) * 100);
            setPercentage(percent);
            setStatus(`Migrating ${data.collection} from ${data.database}: ${percent}%`);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h3>Migration Progress</h3>
      <div style={{
        width: '100%',
        backgroundColor: '#ddd',
        borderRadius: '5px',
        overflow: 'hidden',
        height: '30px',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: '#4caf50',
          textAlign: 'center',
          lineHeight: '30px',
          color: 'white',
          transition: 'width 0.3s ease-in-out'
        }}>
          {percentage}%
        </div>
      </div>
      <p style={{ marginTop: '10px' }}>{status}</p>
    </div>
  );
}
