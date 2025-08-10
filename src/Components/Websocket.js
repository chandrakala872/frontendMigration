
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const SOCKET_URL = 'http://localhost:8080/ws-migration';

export default function MigrationProgressWebSocket() {
  const [progress, setProgress] = useState({
    database: '',
    collection: '',
    transferred: 0,
    total: 0,
    status: '',
  });

  useEffect(() => {
    const socket = new SockJS(SOCKET_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to WebSocket');
        stompClient.subscribe('/topic/migration-progress', (message) => {
          const update = JSON.parse(message.body);
          setProgress(update);
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message']);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, []);

  const percentage = progress.total > 0
    ? Math.round((progress.transferred / progress.total) * 100)
    : 0;

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
      <h3>Migration Progress</h3>
      <p>Database: {progress.database}</p>
      <p>Collection: {progress.collection}</p>
      <p>Status: {progress.status}</p>
      <div style={{ background: '#eee', height: '25px', width: '100%', borderRadius: '4px' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: '#4caf50',
            transition: 'width 0.5s',
            borderRadius: '4px',
          }}
        />
      </div>
      <p>{progress.transferred} / {progress.total} documents</p>
    </div>
  );
}
