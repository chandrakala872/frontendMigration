// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration'; // Your backend WebSocket endpoint

// const MigrationStarterWithProgress = ({ source, target }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,
//     total: 0,
//     status: 'Idle',
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   // Connect to WebSocket/STOMP using query param token
//   const connectStomp = async () => {
//     const token = await getAccessTokenSilently();

//     const client = new Client({
//       webSocketFactory: () =>
//         new SockJS(`${WS_ENDPOINT}?access_token=${encodeURIComponent(token)}`),
//       reconnectDelay: 5000,
//       debug: () => {}, // enable console.log for debugging
//       onConnect: () => {
//         setWsConnected(true);
//         setError(null);

//         subscriptionRef.current = client.subscribe(
//           '/topic/migration-progress',
//           (msg) => {
//             try {
//               const body = JSON.parse(msg.body);
//               setProgress({
//                 transferred: body.transferred ?? 0,
//                 total: body.total ?? 0,
//                 status: body.status ?? '',
//               });
//             } catch (e) {
//               console.warn('Invalid progress payload', e);
//             }
//           }
//         );
//       },
//       onStompError: (frame) => {
//         setError(`STOMP error: ${frame?.body || 'unknown'}`);
//       },
//       onWebSocketError: () => {
//         setError('WebSocket connection error');
//       },
//       onDisconnect: () => {
//         setWsConnected(false);
//       },
//     });

//     stompClientRef.current = client;
//     client.activate();
//   };

//   useEffect(() => {
//     connectStomp();
//     return () => {
//       if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
//       if (stompClientRef.current) stompClientRef.current.deactivate();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const startMigration = async () => {
//     setError(null);
//     setStarting(true);
//     setProgress((p) => ({ ...p, status: 'Starting' }));

//     try {
//       const headers = await getAuthHeader();
//       const payload = {
//         sourceDatabase: source.database,
//         sourceCollection: source.collection,
//         targetBucket: target.bucket,
//         targetScope: target.scope,
//         targetCollection: target.collection,
//       };

//       await axios.post(`${API_BASE}/transfer`, payload, {
//         headers: {
//           ...headers,
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (e) {
//       setError('Failed to initiate migration');
//       console.error(e);
//     } finally {
//       setStarting(false);
//     }
//   };

//   const percent = progress.total
//     ? Math.min(100, ((progress.transferred / progress.total) * 100).toFixed(1))
//     : 0;

//   return (
//     <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 600 }}>
//       <h3>Start Migration & Live Progress</h3>

//       <div style={{ marginBottom: 12 }}>
//         <div>
//           <strong>Source:</strong> {source.database} / {source.collection}
//         </div>
//         <div>
//           <strong>Target:</strong> {target.bucket} / {target.scope} / {target.collection}
//         </div>
//       </div>

//       <button
//         onClick={startMigration}
//         disabled={starting}
//         style={{
//           padding: '8px 16px',
//           background: '#007bff',
//           color: 'white',
//           border: 'none',
//           borderRadius: 4,
//           cursor: 'pointer',
//           marginBottom: 12,
//         }}
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button>

//       <div style={{ marginBottom: 8 }}>
//         <strong>Status:</strong> {progress.status}
//       </div>
//       <div style={{ marginBottom: 8 }}>
//         <strong>
//           {progress.transferred} / {progress.total} ({percent}%)
//         </strong>
//       </div>
//       <div
//         style={{
//           background: '#e6e6e6',
//           borderRadius: 4,
//           overflow: 'hidden',
//           height: 14,
//           marginBottom: 8,
//         }}
//       >
//         <div
//           style={{
//             width: `${percent}%`,
//             height: '100%',
//             background: '#28a745',
//             transition: 'width 0.25s',
//           }}
//         ></div>
//       </div>

//       <div style={{ fontSize: 12, marginBottom: 6 }}>
//         WebSocket:{' '}
//         <span style={{ color: wsConnected ? 'green' : 'orange' }}>
//           {wsConnected ? 'Connected' : 'Connecting...'}
//         </span>
//       </div>
//       {error && (
//         <div style={{ color: 'red', marginTop: 6 }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MigrationStarterWithProgress;

//  it is very important
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import './Migrationwebsocket.css';

const API_BASE = 'http://localhost:8080/api/transfer';
const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
  // Initialize with default empty objects to prevent undefined errors
  const { getAccessTokenSilently } = useAuth0();
  const [progress, setProgress] = useState({
    transferred: 0,
    total: 0,
    status: 'Idle',
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Provide default empty objects if props are undefined
  const safeSource = {
    database: '',
    collection: '',
    ...source
  };

  const safeTarget = {
    bucket: '',
    scope: '',
    collection: '',
    ...target
  };

  const getAuthHeader = async () => {
    try {
      const token = await getAccessTokenSilently();
      return { Authorization: `Bearer ${token}` };
    } catch (e) {
      console.error('Failed to get token', e);
      return {};
    }
  };

  const connectStomp = async () => {
    try {
      const token = await getAccessTokenSilently();

      const client = new Client({
        webSocketFactory: () =>
          new SockJS(`${WS_ENDPOINT}?access_token=${encodeURIComponent(token)}`),
        reconnectDelay: 5000,
        debug: () => {},
        onConnect: () => {
          setWsConnected(true);
          setError(null);

          subscriptionRef.current = client.subscribe(
            '/topic/migration-progress',
            (msg) => {
              try {
                const body = JSON.parse(msg.body);
                setProgress({
                  transferred: body.transferred ?? 0,
                  total: body.total ?? 0,
                  status: body.status ?? 'In Progress',
                });
              } catch (e) {
                console.warn('Invalid progress payload', e);
              }
            }
          );
        },
        onStompError: (frame) => {
          setError(`STOMP error: ${frame?.body || 'unknown'}`);
        },
        onWebSocketError: () => {
          setError('WebSocket connection error');
        },
        onDisconnect: () => {
          setWsConnected(false);
        },
      });

      stompClientRef.current = client;
      client.activate();
    } catch (e) {
      console.error('WebSocket connection failed', e);
      setError('Failed to connect to WebSocket');
    }
  };

  useEffect(() => {
    connectStomp();
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, []);

  const startMigration = async () => {
    setError(null);
    setStarting(true);
    setProgress((p) => ({ ...p, status: 'Starting' }));

    try {
      const headers = await getAuthHeader();
      const payload = {
        sourceDatabase: safeSource.database,
        sourceCollection: safeSource.collection,
        targetBucket: safeTarget.bucket,
        targetScope: safeTarget.scope,
        targetCollection: safeTarget.collection,
      };

      await axios.post(`${API_BASE}/transfer`, payload, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      setError(`Failed to initiate migration: ${e.message}`);
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const percent = progress.total > 0
    ? Math.min(100, ((progress.transferred / progress.total) * 100).toFixed(1))
    : 0;

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 1200,marginTop: 20,paddingRight:30, textAlign: 'center' }}>
      {/* <h3>Start Migration & Live Progress</h3> */}

      <div style={{ marginBottom: 12 }}>
        <div>
          {/* <strong>Source:</strong> {safeSource.database} / {safeSource.collection} */}
        </div>
        <div>
          {/* <strong>Target:</strong> {safeTarget.bucket} / {safeTarget.scope} / {safeTarget.collection} */}
        </div>
      </div>

      {/* <button
        onClick={startMigration}
        disabled={starting || !wsConnected}
        style={{
          padding: '8px 16px',
          background: starting ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          marginBottom: 12,
          opacity: !wsConnected ? 0.7 : 1,
        }}
      >
        {starting ? 'Starting...' : 'Start Migration'}
      </button> */}

      <div style={{ marginBottom: 8 }}>
        {/* <strong>Status:</strong> {progress.status} */}
      </div>
      {progress.total > 0 && (
        <>
          <div style={{ marginBottom: 8 }}>
            <strong>
              {progress.transferred} / {progress.total} ({percent}%)
            </strong>
          </div>
          <div
            style={{
              background: '#e6e6e6',
              borderRadius: 4,
              overflow: 'hidden',
              height: 14,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: '#28a745',
                transition: 'width 0.25s',
              }}
            ></div>
          </div>
        </>
      )}

      {/* <div style={{ fontSize: 12, marginBottom: 6 }}>
        WebSocket:{' '}
        <span style={{ color: wsConnected ? 'green' : 'orange' }}>
          {wsConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div> */}
      {error && (
        <div style={{ color: 'red', marginTop: 6 }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

// Default props for safety
MigrationStarterWithProgress.defaultProps = {
  source: {},
  target: {}
};

export default MigrationStarterWithProgress;












