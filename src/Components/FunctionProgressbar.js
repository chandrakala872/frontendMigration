import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

function FunctionProgressbar() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-migration',
      // No connectHeaders needed since backend doesn't require auth
      debug: (str) => console.debug('[STOMP]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      setConnectionStatus('connected');
      console.log('STOMP Connected', frame);
      
      client.subscribe('/topic/progress', (message) => {
        try {
          const data = JSON.parse(message.body);
          setProgress(data.percentage);
        } catch (parseError) {
          setError(`Message parse error: ${parseError.message}`);
          console.error('Parse error:', parseError);
        }
      });
    };

    client.onStompError = (frame) => {
      setConnectionStatus('error');
      setError(`Connection error: ${frame.headers?.message || 'Check backend service'}`);
      console.error('STOMP Error:', frame);
    };

    client.onWebSocketError = (event) => {
      setConnectionStatus('error');
      setError(`WebSocket error: ${event.type}`);
      console.error('WebSocket Error:', event);
    };

    client.onDisconnect = () => {
      setConnectionStatus('disconnected');
      console.log('STOMP Disconnected');
    };

    client.onWebSocketClose = (event) => {
      if (!event.wasClean) {
        setConnectionStatus('reconnecting');
        console.warn('WebSocket closed unexpectedly. Reconnecting...', event);
      }
    };

    client.activate();

    return () => {
      client.deactivate().catch((err) => {
        console.error('Deactivation error:', err);
      });
    };
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h3>Connection Error</h3>
        <pre>{error}</pre>
        <button onClick={() => {
          setError(null);
          setConnectionStatus('reconnecting');
        }}>Retry</button>
        
        {error.includes('CORS') && (
          <div className="cors-help">
            <p>Required backend CORS configuration:</p>
            <code>
              {`@CrossOrigin(origins = "${window.location.origin}")`}
            </code>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="status">Status: {connectionStatus}</div>
      <progress value={progress} max="100" />
      {connectionStatus === 'reconnecting' && (
        <div className="reconnecting">Attempting to reconnect...</div>
      )}
    </div>
  );
}

export default FunctionProgressbar;