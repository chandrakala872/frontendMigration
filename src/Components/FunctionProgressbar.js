// // import { useEffect, useState } from 'react';
// // import { Client } from '@stomp/stompjs';

// // function FunctionProgressbar() {
// //   const [connectionStatus, setConnectionStatus] = useState('disconnected');
// //   const [error, setError] = useState(null);
// //   const [progress, setProgress] = useState(0);

// //   useEffect(() => {
// //     const client = new Client({
// //       brokerURL: 'ws://localhost:8080/ws-migration',
// //       // No connectHeaders needed since backend doesn't require auth
// //       debug: (str) => console.debug('[STOMP]', str),
// //       reconnectDelay: 5000,
// //       heartbeatIncoming: 4000,
// //       heartbeatOutgoing: 4000,
// //     });

// //     client.onConnect = (frame) => {
// //       setConnectionStatus('connected');
// //       console.log('STOMP Connected', frame);
      
// //       client.subscribe('/topic/progress', (message) => {
// //         try {
// //           const data = JSON.parse(message.body);
// //           setProgress(data.percentage);
// //         } catch (parseError) {
// //           setError(`Message parse error: ${parseError.message}`);
// //           console.error('Parse error:', parseError);
// //         }
// //       });
// //     };

// //     client.onStompError = (frame) => {
// //       setConnectionStatus('error');
// //       setError(`Connection error: ${frame.headers?.message || 'Check backend service'}`);
// //       console.error('STOMP Error:', frame);
// //     };

// //     client.onWebSocketError = (event) => {
// //       setConnectionStatus('error');
// //       setError(`WebSocket error: ${event.type}`);
// //       console.error('WebSocket Error:', event);
// //     };

// //     client.onDisconnect = () => {
// //       setConnectionStatus('disconnected');
// //       console.log('STOMP Disconnected');
// //     };

// //     client.onWebSocketClose = (event) => {
// //       if (!event.wasClean) {
// //         setConnectionStatus('reconnecting');
// //         console.warn('WebSocket closed unexpectedly. Reconnecting...', event);
// //       }
// //     };

// //     client.activate();

// //     return () => {
// //       client.deactivate().catch((err) => {
// //         console.error('Deactivation error:', err);
// //       });
// //     };
// //   }, []);

// //   if (error) {
// //     return (
// //       <div className="error-container">
// //         <h3>Connection Error</h3>
// //         <pre>{error}</pre>
// //         <button onClick={() => {
// //           setError(null);
// //           setConnectionStatus('reconnecting');
// //         }}>Retry</button>
        
// //         {error.includes('CORS') && (
// //           <div className="cors-help">
// //             <p>Required backend CORS configuration:</p>
// //             <code>
// //               {`@CrossOrigin(origins = "${window.location.origin}")`}
// //             </code>
// //           </div>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="progress-container">
// //       <div className="status">Status: {connectionStatus}</div>
// //       <progress value={progress} max="100" />
// //       {connectionStatus === 'reconnecting' && (
// //         <div className="reconnecting">Attempting to reconnect...</div>
// //       )}
// //     </div>
// //   );
// // }

// // export default FunctionProgressbar;



// import { useEffect, useState } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// function FunctionProgressbar() {
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [error, setError] = useState(null);
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const client = new Client({
//       webSocketFactory: () => new SockJS('http://localhost:8080/ws-functions'),
//       debug: (str) => console.debug('[STOMP]', str),
//       reconnectDelay: 5000,
//       connectHeaders: {
//         // Add auth headers if needed
//       }
//     });

//     client.onConnect = () => {
//       setConnectionStatus('connected');
//       client.subscribe('/topic/function-progress', (message) => {
//         try {
//           const data = JSON.parse(message.body);
//           setProgress(data.percentage || data.transferred/data.total * 100);
//         } catch (e) {
//           setError('Invalid progress message');
//         }
//       });
//     };

//     client.onStompError = (frame) => {
//       setError(`STOMP error: ${frame.headers?.message || 'Unknown error'}`);
//     };

//     client.activate();

//     return () => client.deactivate();
//   }, []);

//   return (
//     <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
//       <h3>Function Migration Progress</h3>
//       <div>Status: {connectionStatus}</div>
//       {error && <div style={{ color: 'red' }}>{error}</div>}
//       <progress value={progress} max="100" style={{ width: '100%' }} />
//       <div>{Math.round(progress)}%</div>
//     </div>
//   );
// }

// export default FunctionProgressbar;



// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-functions'; // Changed to ws-functions

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
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

//   const safeSource = {
//     database: '',
//     collection: '',
//     ...source
//   };

//   const safeTarget = {
//     bucket: '',
//     scope: '',
//     collection: '',
//     ...target
//   };

//   const getAuthHeader = async () => {
//     try {
//       const token = await getAccessTokenSilently();
//       return { Authorization: `Bearer ${token}` };
//     } catch (e) {
//       console.error('Failed to get token', e);
//       return {};
//     }
//   };

//   const connectStomp = async () => {
//     try {
//       const token = await getAccessTokenSilently();

//       const client = new Client({
//         webSocketFactory: () =>
//           new SockJS(`${WS_ENDPOINT}?access_token=${encodeURIComponent(token)}`),
//         reconnectDelay: 5000,
//         debug: () => {},
//         onConnect: () => {
//           setWsConnected(true);
//           setError(null);

//           subscriptionRef.current = client.subscribe(
//             '/topic/function-progress', // Changed to function-progress
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 setProgress({
//                   transferred: body.transferred ?? 0,
//                   total: body.total ?? 0,
//                   status: body.status ?? 'In Progress',
//                 });
//               } catch (e) {
//                 console.warn('Invalid progress payload', e);
//               }
//             }
//           );
//         },
//         onStompError: (frame) => {
//           setError(`STOMP error: ${frame?.body || 'unknown'}`);
//         },
//         onWebSocketError: () => {
//           setError('WebSocket connection error');
//         },
//         onDisconnect: () => {
//           setWsConnected(false);
//         },
//       });

//       stompClientRef.current = client;
//       client.activate();
//     } catch (e) {
//       console.error('WebSocket connection failed', e);
//       setError('Failed to connect to WebSocket');
//     }
//   };

//   useEffect(() => {
//     connectStomp();
//     return () => {
//       if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
//       if (stompClientRef.current) stompClientRef.current.deactivate();
//     };
//   }, []);

//   const startMigration = async () => {
//     setError(null);
//     setStarting(true);
//     setProgress((p) => ({ ...p, status: 'Starting' }));

//     try {
//       const headers = await getAuthHeader();
//       const payload = {
//         sourceDatabase: safeSource.database,
//         sourceCollection: safeSource.collection,
//         targetBucket: safeTarget.bucket,
//         targetScope: safeTarget.scope,
//         targetCollection: safeTarget.collection,
//       };

//       await axios.post(`${API_BASE}/transfer`, payload, {
//         headers: {
//           ...headers,
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (e) {
//       setError(`Failed to initiate migration: ${e.message}`);
//       console.error(e);
//     } finally {
//       setStarting(false);
//     }
//   };

//   const percent = progress.total > 0
//     ? Math.min(100, ((progress.transferred / progress.total) * 100).toFixed(1))
//     : 0;

//   return (
//     <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 600 }}>
//       <h3>Start Migration & Live Progress</h3>

//       <div style={{ marginBottom: 12 }}>
//         <div>
//           <strong>Source:</strong> {safeSource.database} / {safeSource.collection}
//         </div>
//         <div>
//           <strong>Target:</strong> {safeTarget.bucket} / {safeTarget.scope} / {safeTarget.collection}
//         </div>
//       </div>

//       <button
//         onClick={startMigration}
//         disabled={starting || !wsConnected}
//         style={{
//           padding: '8px 16px',
//           background: starting ? '#6c757d' : '#007bff',
//           color: 'white',
//           border: 'none',
//           borderRadius: 4,
//           cursor: 'pointer',
//           marginBottom: 12,
//           opacity: !wsConnected ? 0.7 : 1,
//         }}
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button>

//       <div style={{ marginBottom: 8 }}>
//         <strong>Status:</strong> {progress.status}
//       </div>
//       {progress.total > 0 && (
//         <>
//           <div style={{ marginBottom: 8 }}>
//             <strong>
//               {progress.transferred} / {progress.total} ({percent}%)
//             </strong>
//           </div>
//           <div
//             style={{
//               background: '#e6e6e6',
//               borderRadius: 4,
//               overflow: 'hidden',
//               height: 14,
//               marginBottom: 8,
//             }}
//           >
//             <div
//               style={{
//                 width: `${percent}%`,
//                 height: '100%',
//                 background: '#28a745',
//                 transition: 'width 0.25s',
//               }}
//             ></div>
//           </div>
//         </>
//       )}

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

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {}
// };

// export default MigrationStarterWithProgress;



// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-functions';

// const FunctionProgressBar = ({ source = {}, target = {} }) => {
//   const { getAccessTokenSilently, isAuthenticated } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,
//     total: 1, // Initialize with 1 to prevent division by zero
//     status: 'Ready',
//     percentage: 0
//   });
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [error, setError] = useState(null);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const stompClientRef = useRef(null);

//   // Initialize WebSocket connection
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const connectWebSocket = async () => {
//       try {
//         const token = await getAccessTokenSilently();
        
//         const client = new Client({
//           webSocketFactory: () => new SockJS(`${WS_ENDPOINT}?token=${encodeURIComponent(token)}`),
//           reconnectDelay: 5000,
//           heartbeatIncoming: 4000,
//           heartbeatOutgoing: 4000,
//           connectHeaders: {
//             Authorization: `Bearer ${token}`
//           },
//           debug: (str) => console.debug('[STOMP]', str)
//         });

//         client.onConnect = (frame) => {
//           setConnectionStatus('connected');
//           console.log('STOMP Connected', frame);
          
//           client.subscribe('/topic/function-progress', (message) => {
//             try {
//               const data = JSON.parse(message.body);
//               console.log('Progress update:', data); // Debug log
              
//               const transferred = Number(data.transferred) || 0;
//               const total = Math.max(1, Number(data.total) || 1); // Ensure minimum 1
//               const percentage = total > 0 ? Math.min(100, (transferred / total) * 100) : 0;
              
//               setProgress({
//                 transferred,
//                 total,
//                 status: data.status || 'In Progress',
//                 percentage
//               });
//             } catch (err) {
//               console.error('Error parsing progress:', err);
//               setError('Invalid progress data received');
//             }
//           });

//           // Subscribe to error channel
//           client.subscribe('/topic/function-errors', (message) => {
//             try {
//               const errorData = JSON.parse(message.body);
//               setError(errorData.message || 'Function migration error');
//             } catch (err) {
//               console.error('Error parsing error message:', err);
//             }
//           });
//         };

//         client.onStompError = (frame) => {
//           setConnectionStatus('error');
//           setError(`Connection error: ${frame.headers?.message || 'Unknown STOMP error'}`);
//         };

//         client.onWebSocketError = (event) => {
//           setConnectionStatus('error');
//           setError('WebSocket connection error');
//         };

//         client.onDisconnect = () => {
//           setConnectionStatus('disconnected');
//         };

//         client.activate();
//         stompClientRef.current = client;

//         return () => {
//           if (stompClientRef.current?.connected) {
//             stompClientRef.current.deactivate();
//           }
//         };
//       } catch (err) {
//         console.error('WebSocket connection failed:', err);
//         setError(`Connection failed: ${err.message}`);
//         setConnectionStatus('error');
//       }
//     };

//     connectWebSocket();
//   }, [getAccessTokenSilently, isAuthenticated]);

//   const startFunctionMigration = async () => {
//     setError(null);
//     setIsMigrating(true);
//     setProgress({
//       transferred: 0,
//       total: 1,
//       status: 'Starting...',
//       percentage: 0
//     });

//     try {
//       const token = await getAccessTokenSilently();
//       const response = await axios.post(`${API_BASE}/functions`, {
//         sourceDatabase: source.database || '',
//         sourceCollection: source.collection || '',
//         targetBucket: target.bucket || '',
//         targetScope: target.scope || '',
//         targetCollection: target.collection || ''
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       console.log('Migration started:', response.data);
//     } catch (err) {
//       console.error('Migration start failed:', err);
//       const errorMsg = err.response?.data?.message || err.message;
//       setError(`Failed to start migration: ${errorMsg}`);
//       setProgress(prev => ({ ...prev, status: 'Failed' }));
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   const getStatusColor = () => {
//     switch (progress.status.toLowerCase()) {
//       case 'completed': return 'green';
//       case 'failed': return 'red';
//       case 'in progress': return 'blue';
//       case 'starting...': return 'orange';
//       default: return 'gray';
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Function Migration Progress</h2>
      
//       <div style={styles.infoContainer}>
//         <div>
//           <strong>Source:</strong> {source.database || 'N/A'} / {source.collection || 'N/A'}
//         </div>
//         <div>
//           <strong>Target:</strong> {target.bucket || 'N/A'} / {target.scope || 'N/A'} / {target.collection || 'N/A'}
//         </div>
//       </div>

//       <button
//         onClick={startFunctionMigration}
//         disabled={isMigrating || connectionStatus !== 'connected'}
//         style={{
//           ...styles.button,
//           backgroundColor: isMigrating ? '#6c757d' : '#007bff',
//           opacity: connectionStatus !== 'connected' ? 0.7 : 1
//         }}
//       >
//         {isMigrating ? 'Migration in Progress...' : 'Start Function Migration'}
//       </button>

//       <div style={styles.statusContainer}>
//         <strong>Status:</strong> 
//         <span style={{ color: getStatusColor(), marginLeft: '5px' }}>
//           {progress.status}
//         </span>
//       </div>

//       <div style={styles.progressText}>
//         <strong>Progress:</strong> {progress.transferred} of {progress.total} functions
//         ({progress.percentage.toFixed(1)}%)
//       </div>

//       <div style={styles.progressBarContainer}>
//         <div style={{
//           ...styles.progressBar,
//           width: `${progress.percentage}%`,
//           backgroundColor: 
//             progress.status === 'Completed' ? '#28a745' :
//             progress.status === 'Failed' ? '#dc3545' : '#17a2b8'
//         }} />
//       </div>

//       <div style={styles.connectionStatus}>
//         <div>
//           <strong>Connection:</strong> 
//           <span style={{ 
//             color: connectionStatus === 'connected' ? 'green' : 
//                   connectionStatus === 'error' ? 'red' : 'orange',
//             marginLeft: '5px'
//           }}>
//             {connectionStatus}
//           </span>
//         </div>
//         {progress.status === 'Completed' && (
//           <div style={{ color: 'green' }}>
//             <strong>✓ Migration Complete</strong>
//           </div>
//         )}
//       </div>

//       {error && (
//         <div style={styles.errorContainer}>
//           <strong>Error:</strong> {error}
//           <button 
//             onClick={() => setError(null)}
//             style={styles.errorCloseButton}
//           >
//             ×
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Styles
// const styles = {
//   container: {
//     padding: '20px',
//     border: '1px solid #e0e0e0',
//     borderRadius: '8px',
//     maxWidth: '600px',
//     margin: '20px auto',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//     fontFamily: 'Arial, sans-serif'
//   },
//   title: {
//     marginTop: 0,
//     color: '#333'
//   },
//   infoContainer: {
//     marginBottom: '15px',
//     lineHeight: '1.6'
//   },
//   button: {
//     padding: '10px 15px',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     marginBottom: '15px',
//     fontWeight: 'bold',
//     width: '100%'
//   },
//   statusContainer: {
//     marginBottom: '10px'
//   },
//   progressText: {
//     marginBottom: '10px'
//   },
//   progressBarContainer: {
//     height: '20px',
//     backgroundColor: '#f0f0f0',
//     borderRadius: '10px',
//     overflow: 'hidden',
//     marginBottom: '15px'
//   },
//   progressBar: {
//     height: '100%',
//     transition: 'width 0.3s ease, background-color 0.3s ease'
//   },
//   connectionStatus: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     fontSize: '0.9em',
//     color: '#666'
//   },
//   errorContainer: {
//     marginTop: '15px',
//     padding: '10px',
//     backgroundColor: '#ffebee',
//     borderLeft: '4px solid #f44336',
//     color: '#d32f2f',
//     position: 'relative'
//   },
//   errorCloseButton: {
//     position: 'absolute',
//     right: '10px',
//     top: '5px',
//     background: 'none',
//     border: 'none',
//     color: '#d32f2f',
//     cursor: 'pointer',
//     fontSize: '1.2em'
//   }
// };

// export default FunctionProgressBar;


import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth0 } from '@auth0/auth0-react';

const FunctionProgressBar = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [percentage, setPercentage] = useState(0);
  const stompClientRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const token = await getAccessTokenSilently();

        const client = new Client({
          webSocketFactory: () => new SockJS(`http://localhost:8080/ws-functions?token=${encodeURIComponent(token)}`),
          reconnectDelay: 5000,
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          debug: () => {}
        });

        client.onConnect = () => {
          client.subscribe('/topic/function-progress', (message) => {
            try {
              const data = JSON.parse(message.body);
              const processed = data.processed || 0;
              const total = data.total || 1; // Avoid division by zero
              const percent = Math.min(100, (processed / total) * 100);
              setPercentage(percent);
            } catch (e) {
              console.error('Progress parse error:', e);
            }
          });
        };

        client.activate();
        stompClientRef.current = client;
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
    };
  }, [getAccessTokenSilently]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '30px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Migration Progress: {percentage.toFixed(1)}%
      </div>
      <div style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: '#28a745',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

export default FunctionProgressBar;
