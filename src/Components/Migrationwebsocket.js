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
// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
//   // Initialize with default empty objects to prevent undefined errors
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

//   // Provide default empty objects if props are undefined
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
//             '/topic/migration-progress',
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
//     <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 1200,marginTop: 20,paddingRight:30, textAlign: 'center' }}>
//       {/* <h3>Start Migration & Live Progress</h3> */}

//       <div style={{ marginBottom: 12 }}>
//         <div>
//           {/* <strong>Source:</strong> {safeSource.database} / {safeSource.collection} */}
//         </div>
//         <div>
//           {/* <strong>Target:</strong> {safeTarget.bucket} / {safeTarget.scope} / {safeTarget.collection} */}
//         </div>
//       </div>

//       {/* <button
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
//       </button> */}

//       <div style={{ marginBottom: 8 }}>
//         {/* <strong>Status:</strong> {progress.status} */}
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

//       {/* <div style={{ fontSize: 12, marginBottom: 6 }}>
//         WebSocket:{' '}
//         <span style={{ color: wsConnected ? 'green' : 'orange' }}>
//           {wsConnected ? 'Connected' : 'Connecting...'}
//         </span>
//       </div> */}
//       {error && (
//         <div style={{ color: 'red', marginTop: 6 }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}
//     </div>
//   );
// };

// // Default props for safety
// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {}
// };

// export default MigrationStarterWithProgress;






// this is real code
// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

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
//             '/topic/migration-progress',
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
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         <h3>Migration Progress</h3>
//         <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {/* {wsConnected ? 'Connected' : 'Disconnected'} */}
//         </div>
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           {/* <strong>Status:</strong> {progress.status} */}
//         </div>

//         {/* Progress Bar Container - 800px wide and centered */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.total} ({percent}%)
//             </strong>
//           </div>
//         </div>

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Optional: Add metrics if you want */}
//       {progress.total > 0 && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.total}</div>
//               <div className="metric-label">Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//           </div>
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
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,
//     total: 0,
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {}
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 // Update progress
//                 setProgress({
//                   transferred: body.transferred || 0,
//                   total: body.total || 0,
//                   status: body.status || 'In Progress',
//                   operationType: body.operationType || 'MIGRATION',
//                   changeCount: body.changeCount || 0,
//                   details: body.details || {}
//                 });
                
//                 // Add notification for CDC events
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     const newNotification = {
//       id: Date.now(),
//       type: event.operationType,
//       message: event.details?.message || `Operation: ${event.operationType}`,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10 notifications
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
//     setNotifications([]);
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

//   // Determine status message based on operation type
//   const getStatusMessage = () => {
//     if (progress.operationType === 'MIGRATION') {
//       return `Migrating: ${progress.transferred}/${progress.total} (${percent}%)`;
//     } else {
//       return progress.details.message || `Operation: ${progress.operationType}`;
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         <h3>Migration Progress</h3>
//         <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {wsConnected ? 'Connected' : 'Disconnected'}
//         </div>
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           <strong>Status:</strong> {getStatusMessage()}
//         </div>

//         {/* Progress Bar Container */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.total} ({percent}%)
//             </strong>
//           </div>
//         </div>

//         {/* Notifications Panel */}
//         {notifications.length > 0 && (
//           <div className="notifications-panel">
//             <h4>Recent Changes During Migration</h4>
//             <div className="notifications-list">
//               {notifications.map(notification => (
//                 <div key={notification.id} className={`notification ${notification.type.toLowerCase()}`}>
//                   <span className="notification-time">{notification.timestamp}</span>
//                   <span className="notification-message">{notification.message}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Metrics Container */}
//       {progress.total > 0 && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.total}</div>
//               <div className="metric-label">Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//             {progress.changeCount > 0 && (
//               <div className="metric-item">
//                 <div className="metric-value">{progress.changeCount}</div>
//                 <div className="metric-label">{progress.operationType}s</div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button>
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
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,      // Documents successfully transferred
//     currentTotal: 0,     // Current total documents (changes with inserts/deletes)
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {}
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 // Handle different types of progress updates
//                 if (body.operationType === 'INSERT') {
//                   // Document inserted - increase current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   // Document deleted - decrease current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   // Document updated - no change to total count
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else {
//                   // Regular migration progress
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {}
//                   });
//                 }
                
//                 // Add notification for CDC events
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setProgress((p) => ({ ...p, status: 'Starting', transferred: 0, currentTotal: 0 }));

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

//   // Calculate percentage based on CURRENT total
//   const percent = progress.currentTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.currentTotal) * 100).toFixed(1))
//     : 0;

//   // Determine status message based on operation type
//   const getStatusMessage = () => {
//     if (progress.operationType === 'MIGRATION') {
//       return `Migrating: ${progress.transferred}/${progress.currentTotal} (${percent}%)`;
//     } else if (progress.operationType === 'INSERT') {
//       return `${progress.changeCount} document(s) inserted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'DELETE') {
//       return `${progress.changeCount} document(s) deleted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'UPDATE' || progress.operationType === 'REPLACE') {
//       return `${progress.changeCount} document(s) ${progress.operationType.toLowerCase()}d`;
//     } else {
//       return progress.details.message || `Operation: ${progress.operationType}`;
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* <h3>Migration Progress</h3> */}
//         {/* <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {wsConnected ? 'Connected' : 'Disconnected'}
//         </div> */}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           <strong>Status:</strong> {getStatusMessage()}
//         </div>

//         {/* Progress Bar Container */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//             </strong>
//           </div>
//         </div>

//         {/* Notifications Panel */}
//         {/* {notifications.length > 0 && (
//           <div className="notifications-panel">
//             <h4>Real-Time Changes During Migration</h4>
//             <div className="notifications-list">
//               {notifications.map(notification => (
//                 <div key={notification.id} className={`notification ${notification.type.toLowerCase()}`}>
//                   <span className="notification-time">{notification.timestamp}</span>
//                   <span className="notification-message">{notification.message}</span>
//                   {notification.count > 1 && (
//                     <span className="notification-count">({notification.count})</span>
//                   )}
//                 </div>
//               ))} */}
//             {/* </div>
//           </div>
//         )} */}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Metrics Container */}
//       {/* {(progress.currentTotal > 0 || documentChanges.inserted > 0 || documentChanges.deleted > 0) && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.currentTotal}</div>
//               <div className="metric-label">Current Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//           </div> */}
          
//           {/* CDC Operations Summary */}
//           {/* {(documentChanges.inserted > 0 || documentChanges.deleted > 0 || documentChanges.updated > 0) && (
//             <div className="cdc-summary">
//               <h5>Changes During Migration</h5>
//               <div className="cdc-operations">
//                 {documentChanges.inserted > 0 && (
//                   <span className="cdc-operation insert">+{documentChanges.inserted} inserted</span>
//                 )}
//                 {documentChanges.deleted > 0 && (
//                   <span className="cdc-operation delete">-{documentChanges.deleted} deleted</span>
//                 )}
//                 {documentChanges.updated > 0 && (
//                   <span className="cdc-operation update">{documentChanges.updated} updated</span>
//                 )}
//               </div>
//             </div>
//           )} */}
//         </div>
//       )}

//       {/* <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button> */}
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {}
// };

// export default MigrationStarterWithProgress;



// this code is working for cdc websocket
// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,      // Documents successfully transferred
//     currentTotal: 0,     // Current total documents (changes with inserts/deletes)
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {}
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 // Handle different types of progress updates
//                 if (body.operationType === 'INSERT') {
//                   // Document inserted - increase current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   // Document deleted - decrease current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   // Document updated - no change to total count
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else {
//                   // Regular migration progress
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {}
//                   });
//                 }
                
//                 // Add notification for CDC events
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setProgress((p) => ({ ...p, status: 'Starting', transferred: 0, currentTotal: 0 }));

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

//   // Calculate percentage based on CURRENT total
//   const percent = progress.currentTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.currentTotal) * 100).toFixed(1))
//     : 0;

//   // Determine status message based on operation type
//   const getStatusMessage = () => {
//     if (progress.operationType === 'MIGRATION') {
//       return `Migrating: ${progress.transferred}/${progress.currentTotal} (${percent}%)`;
//     } else if (progress.operationType === 'INSERT') {
//       return `${progress.changeCount} document(s) inserted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'DELETE') {
//       return `${progress.changeCount} document(s) deleted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'UPDATE' || progress.operationType === 'REPLACE') {
//       return `${progress.changeCount} document(s) ${progress.operationType.toLowerCase()}d`;
//     } else {
//       return progress.details.message || `Operation: ${progress.operationType}`;
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* <h3>Migration Progress</h3> */}
//         {/* <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {wsConnected ? 'Connected' : 'Disconnected'}
//         </div> */}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           <strong>Status:</strong> {getStatusMessage()}
//         </div>

//         {/* Progress Bar Container */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//             </strong>
//           </div>
//         </div>

//         {/* Notifications Panel */}
//         {/* {notifications.length > 0 && (
//           <div className="notifications-panel">
//             <h4>Real-Time Changes During Migration</h4>
//             <div className="notifications-list">
//               {notifications.map(notification => (
//                 <div key={notification.id} className={`notification ${notification.type.toLowerCase()}`}>
//                   <span className="notification-time">{notification.timestamp}</span>
//                   <span className="notification-message">{notification.message}</span>
//                   {notification.count > 1 && (
//                     <span className="notification-count">({notification.count})</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )} */}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Metrics Container */}
//       {/* {(progress.currentTotal > 0 || documentChanges.inserted > 0 || documentChanges.deleted > 0) && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.currentTotal}</div>
//               <div className="metric-label">Current Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//           </div>
          
//           {/* CDC Operations Summary */}
//           {/* {(documentChanges.inserted > 0 || documentChanges.deleted > 0 || documentChanges.updated > 0) && (
//             <div className="cdc-summary">
//               <h5>Changes During Migration</h5>
//               <div className="cdc-operations">
//                 {documentChanges.inserted > 0 && (
//                   <span className="cdc-operation insert">+{documentChanges.inserted} inserted</span>
//                 )}
//                 {documentChanges.deleted > 0 && (
//                   <span className="cdc-operation delete">-{documentChanges.deleted} deleted</span>
//                 )}
//                 {documentChanges.updated > 0 && (
//                   <span className="cdc-operation update">{documentChanges.updated} updated</span>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )} */}

//       {/* <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button> */}
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {}
// };

// export default MigrationStarterWithProgress;







// this code if for  inserting and deleting 

// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,      // Documents successfully transferred
//     currentTotal: 0,     // Current total documents (changes with inserts/deletes)
//     originalTotal: 0,    // Original total documents before any changes (for progress calculation)
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {}
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 // Handle different types of progress updates
//                 if (body.operationType === 'INSERT') {
//                   // Document inserted - increase current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   // Document deleted - decrease current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   // Document updated - no change to total count
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else {
//                   // Regular migration progress - store both original and current totals
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0, // Store original total
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {}
//                   });
//                 }
                
//                 // Add notification for CDC events
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setProgress((p) => ({ ...p, status: 'Starting', transferred: 0, currentTotal: 0, originalTotal: 0 }));

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

//   // Calculate percentage based on ORIGINAL total for progress bar
//   const percent = progress.originalTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
//     : 0;

//   // Determine status message based on operation type
//   const getStatusMessage = () => {
//     if (progress.operationType === 'MIGRATION') {
//       if (progress.status === 'COMPLETED') {
//         return `Migration Complete: ${progress.transferred} documents transferred` +
//                (progress.currentTotal !== progress.originalTotal ? 
//                  ` (${progress.originalTotal - progress.transferred} document(s) deleted during migration)` : 
//                  '');
//       }
//       return `Migrating: ${progress.transferred}/${progress.originalTotal} (${percent}%)`;
//     } else if (progress.operationType === 'INSERT') {
//       return `${progress.changeCount} document(s) inserted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'DELETE') {
//       return `${progress.changeCount} document(s) deleted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'UPDATE' || progress.operationType === 'REPLACE') {
//       return `${progress.changeCount} document(s) ${progress.operationType.toLowerCase()}d`;
//     } else {
//       return progress.details.message || `Operation: ${progress.operationType}`;
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* <h3>Migration Progress</h3> */}
//         {/* <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {wsConnected ? 'Connected' : 'Disconnected'}
//         </div> */}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           {/* <strong>Status:</strong> {getStatusMessage()} */}
//         </div>

//         {/* Progress Bar Container */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//               {progress.currentTotal !== progress.originalTotal && 
//                 ` (Originally: ${progress.originalTotal})`
//               }
//             </strong>
//           </div>
//         </div>

//         {/* Notifications Panel */}
//         {/* {notifications.length > 0 && (
//           <div className="notifications-panel">
//             <h4>Real-Time Changes During Migration</h4>
//             <div className="notifications-list">
//               {notifications.map(notification => (
//                 <div key={notification.id} className={`notification ${notification.type.toLowerCase()}`}>
//                   <span className="notification-time">{notification.timestamp}</span>
//                   <span className="notification-message">{notification.message}</span>
//                   {notification.count > 1 && (
//                     <span className="notification-count">({notification.count})</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )} */}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Metrics Container */}
//       {/* {(progress.currentTotal > 0 || documentChanges.inserted > 0 || documentChanges.deleted > 0) && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.currentTotal}</div>
//               <div className="metric-label">Current Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.originalTotal}</div>
//               <div className="metric-label">Original Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//           </div>
          
//           {/* CDC Operations Summary */}
//           {/* {(documentChanges.inserted > 0 || documentChanges.deleted > 0 || documentChanges.updated > 0) && (
//             <div className="cdc-summary">
//               <h5>Changes During Migration</h5>
//               <div className="cdc-operations">
//                 {documentChanges.inserted > 0 && (
//                   <span className="cdc-operation insert">+{documentChanges.inserted} inserted</span>
//                 )}
//                 {documentChanges.deleted > 0 && (
//                   <span className="cdc-operation delete">-{documentChanges.deleted} deleted</span>
//                 )}
//                 {documentChanges.updated > 0 && (
//                   <span className="cdc-operation update">{documentChanges.updated} updated</span>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )} */}

//       {/* <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button> */}
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {}
// };

// export default MigrationStarterWithProgress;




// // time and websocket working correctly

// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {} }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,      // Documents successfully transferred
//     currentTotal: 0,     // Current total documents (changes with inserts/deletes)
//     originalTotal: 0,    // Original total documents before any changes (for progress calculation)
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {},
//     // NEW FIELDS FOR SUMMARY:
//     durationMs: 0,       // Time taken in milliseconds
//     speed: 0,            // Documents per second
//     summaryVisible: false // Show/hide summary
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

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

//   // Format milliseconds to display as milliseconds (not converting to seconds)
//   const formatDuration = (ms) => {
//     return `${ms}ms`;  // Directly display milliseconds without conversion
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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 // Handle different types of progress updates
//                 if (body.operationType === 'INSERT') {
//                   // Document inserted - increase current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   // Document deleted - decrease current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   // Document updated - no change to total count
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else if (body.status === 'COMPLETED') {
//                   // FINAL COMPLETION MESSAGE WITH SUMMARY
//                   setProgress(prev => ({
//                     ...prev,
//                     status: 'COMPLETED',
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0,
//                     durationMs: body.durationMs || 0,  // Capture time taken
//                     speed: body.speed || 0,            // Capture speed
//                     summaryVisible: true,              // Show summary
//                     operationType: 'MIGRATION_SUMMARY'
//                   }));
//                 }
//                 else {
//                   // Regular migration progress - store both original and current totals
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0, // Store original total
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {},
//                     durationMs: 0,
//                     speed: 0,
//                     summaryVisible: false
//                   });
//                 }
                
//                 // Add notification for CDC events
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setProgress((p) => ({ 
//       ...p, 
//       status: 'Starting', 
//       transferred: 0, 
//       currentTotal: 0, 
//       originalTotal: 0,
//       durationMs: 0,
//       speed: 0,
//       summaryVisible: false 
//     }));

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

//   // Calculate percentage based on ORIGINAL total for progress bar
//   const percent = progress.originalTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
//     : 0;

//   // Determine status message based on operation type
//   const getStatusMessage = () => {
//     if (progress.operationType === 'MIGRATION') {
//       if (progress.status === 'COMPLETED') {
//         return `Migration Complete: ${progress.transferred} documents transferred` +
//                (progress.currentTotal !== progress.originalTotal ? 
//                  ` (${progress.originalTotal - progress.transferred} document(s) deleted during migration)` : 
//                  '');
//       }
//       return `Migrating: ${progress.transferred}/${progress.originalTotal} (${percent}%)`;
//     } else if (progress.operationType === 'INSERT') {
//       return `${progress.changeCount} document(s) inserted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'DELETE') {
//       return `${progress.changeCount} document(s) deleted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'UPDATE' || progress.operationType === 'REPLACE') {
//       return `${progress.changeCount} document(s) ${progress.operationType.toLowerCase()}d`;
//     } else {
//       return progress.details.message || `Operation: ${progress.operationType}`;
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* <h3>Migration Progress</h3> */}
//         {/* <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {wsConnected ? 'Connected' : 'Disconnected'}
//         </div> */}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           {/* <strong>Status:</strong> {getStatusMessage()} */}
//         </div>

//         {/* Progress Bar Container */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//               {progress.currentTotal !== progress.originalTotal && 
//                 ` (Originally: ${progress.originalTotal})`
//               }
//             </strong>
//           </div>
//         </div>

//         {/* Migration Summary */}
//         {progress.summaryVisible && progress.status === 'COMPLETED' && (
//           <div className="migration-summary">
//             {/* <h4>Migration Complete! 🎉</h4> */}
//             <div className="summary-stats">
//               <div className="summary-item">
//                 <span className="summary-label">Documents Transferred:</span>
//                 <span className="summary-value">{progress.transferred.toLocaleString()}</span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Time Taken:</span>
//                 <span className="summary-value">
//                   {formatDuration(progress.durationMs)}
//                 </span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Speed:</span>
//                 <span className="summary-value">
//                   {progress.speed.toLocaleString()} docs/sec
//                 </span>
//               </div>
//               {/* <div className="summary-item">
//                 <span className="summary-label">Status:</span>
//                 <span className="summary-value success">Completed Successfully</span>
//               </div> */}
//             </div>
//           </div>
//         )}

//         {/* Notifications Panel */}
//         {/* {notifications.length > 0 && (
//           <div className="notifications-panel">
//             <h4>Real-Time Changes During Migration</h4>
//             <div className="notifications-list">
//               {notifications.map(notification => (
//                 <div key={notification.id} className={`notification ${notification.type.toLowerCase()}`}>
//                   <span className="notification-time">{notification.timestamp}</span>
//                   <span className="notification-message">{notification.message}</span>
//                   {notification.count > 1 && (
//                     <span className="notification-count">({notification.count})</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )} */}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Metrics Container */}
//       {/* {(progress.currentTotal > 0 || documentChanges.inserted > 0 || documentChanges.deleted > 0) && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.currentTotal}</div>
//               <div className="metric-label">Current Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.originalTotal}</div>
//               <div className="metric-label">Original Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//           </div>
          
//           {/* CDC Operations Summary */}
//           {/* {(documentChanges.inserted > 0 || documentChanges.deleted > 0 || documentChanges.updated > 0) && (
//             <div className="cdc-summary">
//               <h5>Changes During Migration</h5>
//               <div className="cdc-operations">
//                 {documentChanges.inserted > 0 && (
//                   <span className="cdc-operation insert">+{documentChanges.inserted} inserted</span>
//                 )}
//                 {documentChanges.deleted > 0 && (
//                   <span className="cdc-operation delete">-{documentChanges.deleted} deleted</span>
//                 )}
//                 {documentChanges.updated > 0 && (
//                   <span className="cdc-operation update">{documentChanges.updated} updated</span>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )} */}

//       {/* <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button> */}
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {}
// };

// export default MigrationStarterWithProgress;

// collection all coming



// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import ChangeDataCapture from './changedatacapture'; // Add this import
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {}, migrationBatch = [] }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,      // Documents successfully transferred
//     currentTotal: 0,     // Current total documents (changes with inserts/deletes)
//     originalTotal: 0,    // Original total documents before any changes (for progress calculation)
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {},
//     // NEW FIELDS FOR SUMMARY:
//     durationMs: 0,       // Time taken in milliseconds
//     speed: 0,            // Documents per second
//     summaryVisible: false // Show/hide summary
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

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

//   // Format collection display for multiple migrations
//   const getCollectionDisplay = () => {
//     if (migrationBatch && migrationBatch.length > 1) {
//       // Multiple collections - show individual source->target mappings
//       const mappings = migrationBatch.map(m => 
//         `${m.source?.collection || 'Unknown'} → ${m.target?.collection || 'Unknown'}`
//       );
      
//       if (mappings.length > 0) {
//         return `Migration: ${mappings.join(', ')}`;
//       }
//       return `Migration: Multiple Collections`;
//     } else if (migrationBatch && migrationBatch.length === 1) {
//       // Single collection in batch
//       const migration = migrationBatch[0];
//       return `Migration: ${migration.source?.collection || ''} → ${migration.target?.collection || ''}`;
//     }
//     // Single collection (original functionality)
//     return `Migration: ${safeSource.collection} → ${safeTarget.collection}`;
//   };

//   // Format milliseconds to display as milliseconds (not converting to seconds)
//   const formatDuration = (ms) => {
//     return `${ms}ms`;  // Directly display milliseconds without conversion
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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 // Handle different types of progress updates
//                 if (body.operationType === 'INSERT') {
//                   // Document inserted - increase current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   // Document deleted - decrease current total
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   // Document updated - no change to total count
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else if (body.status === 'COMPLETED') {
//                   // FINAL COMPLETION MESSAGE WITH SUMMARY
//                   setProgress(prev => ({
//                     ...prev,
//                     status: 'COMPLETED',
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0,
//                     durationMs: body.durationMs || 0,  // Capture time taken
//                     speed: body.speed || 0,            // Capture speed
//                     summaryVisible: true,              // Show summary
//                     operationType: 'MIGRATION_SUMMARY'
//                   }));
//                 }
//                 else {
//                   // Regular migration progress - store both original and current totals
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0, // Store original total
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {},
//                     durationMs: 0,
//                     speed: 0,
//                     summaryVisible: false
//                   });
//                 }
                
//                 // Add notification for CDC events
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setProgress((p) => ({ 
//       ...p, 
//       status: 'Starting', 
//       transferred: 0, 
//       currentTotal: 0, 
//       originalTotal: 0,
//       durationMs: 0,
//       speed: 0,
//       summaryVisible: false 
//     }));

//     try {
//       const headers = await getAuthHeader();
      
//       // Handle both single and batch migrations
//       if (migrationBatch && migrationBatch.length > 0) {
//         // Process multiple migrations with individual source->target mappings
//         for (const migration of migrationBatch) {
//           const payload = {
//             sourceDatabase: migration.source?.database || '',
//             sourceCollection: migration.source?.collection || '',
//             targetBucket: migration.target?.bucket || '',
//             targetScope: migration.target?.scope || '',
//             targetCollection: migration.target?.collection || '',
//           };

//           await axios.post(`${API_BASE}/transfer`, payload, {
//             headers: {
//               ...headers,
//               'Content-Type': 'application/json',
//             },
//           });
//         }
//       } else {
//         // Single migration (original functionality)
//         const payload = {
//           sourceDatabase: safeSource.database,
//           sourceCollection: safeSource.collection,
//           targetBucket: safeTarget.bucket,
//           targetScope: safeTarget.scope,
//           targetCollection: safeTarget.collection,
//         };

//         await axios.post(`${API_BASE}/transfer`, payload, {
//           headers: {
//             ...headers,
//             'Content-Type': 'application/json',
//           },
//         });
//       }
//     } catch (e) {
//       setError(`Failed to initiate migration: ${e.message}`);
//       console.error(e);
//     } finally {
//       setStarting(false);
//     }
//   };

//   // Calculate percentage based on ORIGINAL total for progress bar
//   const percent = progress.originalTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
//     : 0;

//   // Determine status message based on operation type
//   const getStatusMessage = () => {
//     if (progress.operationType === 'MIGRATION' || progress.operationType === 'MIGRATION_SUMMARY') {
//       if (progress.status === 'COMPLETED') {
//         return `Migration Complete: ${progress.transferred} documents transferred` +
//                (progress.currentTotal !== progress.originalTotal ? 
//                  ` (${progress.originalTotal - progress.transferred} document(s) deleted during migration)` : 
//                  '');
//       }
//       return `Migrating: ${progress.transferred}/${progress.originalTotal} (${percent}%)`;
//     } else if (progress.operationType === 'INSERT') {
//       return `${progress.changeCount} document(s) inserted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'DELETE') {
//       return `${progress.changeCount} document(s) deleted - Total: ${progress.currentTotal}`;
//     } else if (progress.operationType === 'UPDATE' || progress.operationType === 'REPLACE') {
//       return `${progress.changeCount} document(s) ${progress.operationType.toLowerCase()}d`;
//     } else {
//       return progress.details.message || `Operation: ${progress.operationType}`;
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* <h3>Migration Progress</h3> */}
//         {/* <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
//           {wsConnected ? 'Connected' : 'Disconnected'}
//         </div> */}
//       </div>

//       {/* Show collection names - handles multiple collections */}
//       <div className="migration-title">
//         {getCollectionDisplay()}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           {/* <strong>Status:</strong> {getStatusMessage()} */}
//         </div>

//         {/* Progress Bar Container */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//               {progress.currentTotal !== progress.originalTotal && 
//                 ` (Originally: ${progress.originalTotal})`
//               }
//             </strong>
//           </div>
//         </div>

//         {/* Migration Summary */}
//         {progress.summaryVisible && progress.status === 'COMPLETED' && (
//           <div className="migration-summary">
//             {/* <h4>Migration Complete! 🎉</h4> */}
//             <div className="summary-stats">
//               <div className="summary-item">
//                 <span className="summary-label">Documents Transferred:</span>
//                 <span className="summary-value">{progress.transferred.toLocaleString()}</span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Time Taken:</span>
//                 <span className="summary-value">
//                   {formatDuration(progress.durationMs)}
//                 </span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Speed:</span>
//                 <span className="summary-value">
//                   {progress.speed.toLocaleString()} docs/sec
//                 </span>
//               </div>
//               {/* <div className="summary-item">
//                 <span className="summary-label">Status:</span>
//                 <span className="summary-value success">Completed Successfully</span>
//               </div> */}
//             </div>
//           </div>
//         )}

//         {/* Notifications Panel */}
//         {/* {notifications.length > 0 && (
//           <div className="notifications-panel">
//             <h4>Real-Time Changes During Migration</h4>
//             <div className="notifications-list">
//               {notifications.map(notification => (
//                 <div key={notification.id} className={`notification ${notification.type.toLowerCase()}`}>
//                   <span className="notification-time">{notification.timestamp}</span>
//                   <span className="notification-message">{notification.message}</span>
//                   {notification.count > 1 && (
//                     <span className="notification-count">({notification.count})</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )} */}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Metrics Container */}
//       {/* {(progress.currentTotal > 0 || documentChanges.inserted > 0 || documentChanges.deleted > 0) && (
//         <div className="metrics-container">
//           <h4>Migration Metrics</h4>
//           <div className="metrics-grid">
//             <div className="metric-item">
//               <div className="metric-value">{progress.transferred}</div>
//               <div className="metric-label">Transferred</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.currentTotal}</div>
//               <div className="metric-label">Current Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{progress.originalTotal}</div>
//               <div className="metric-label">Original Total</div>
//             </div>
//             <div className="metric-item">
//               <div className="metric-value">{percent}%</div>
//               <div className="metric-label">Complete</div>
//             </div>
//           </div>
          
//           {/* CDC Operations Summary */}
//           {/* {(documentChanges.inserted > 0 || documentChanges.deleted > 0 || documentChanges.updated > 0) && (
//             <div className="cdc-summary">
//               <h5>Changes During Migration</h5>
//               <div className="cdc-operations">
//                 {documentChanges.inserted > 0 && (
//                   <span className="cdc-operation insert">+{documentChanges.inserted} inserted</span>
//                 )}
//                 {documentChanges.deleted > 0 && (
//                   <span className="cdc-operation delete">-{documentChanges.deleted} deleted</span>
//                 )}
//                 {documentChanges.updated > 0 && (
//                   <span className="cdc-operation update">{documentChanges.updated} updated</span>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )} */}

//       {/* <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button> */}
//       <ChangeDataCapture />
      
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {},
//   migrationBatch: []
// };

// export default MigrationStarterWithProgress;


// one collection showing cdc

// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import ChangeDataCapture from './changedatacapture';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {}, migrationBatch = [] }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,
//     currentTotal: 0,
//     originalTotal: 0,
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {},
//     durationMs: 0,
//     speed: 0,
//     summaryVisible: false
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [showCDC, setShowCDC] = useState(false); // NEW: Control CDC visibility
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

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

//   // Format collection display for multiple migrations
//   const getCollectionDisplay = () => {
//     if (migrationBatch && migrationBatch.length > 1) {
//       const mappings = migrationBatch.map(m => 
//         `${m.source?.collection || 'Unknown'} → ${m.target?.collection || 'Unknown'}`
//       );
      
//       if (mappings.length > 0) {
//         return `Migration: ${mappings.join(', ')}`;
//       }
//       return `Migration: Multiple Collections`;
//     } else if (migrationBatch && migrationBatch.length === 1) {
//       const migration = migrationBatch[0];
//       return `Migration: ${migration.source?.collection || ''} → ${migration.target?.collection || ''}`;
//     }
//     return `Migration: ${safeSource.collection} → ${safeTarget.collection}`;
//   };

//   const formatDuration = (ms) => {
//     return `${ms}ms`;
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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 if (body.operationType === 'INSERT') {
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else if (body.status === 'COMPLETED') {
//                   // FINAL COMPLETION MESSAGE WITH SUMMARY
//                   setProgress(prev => ({
//                     ...prev,
//                     status: 'COMPLETED',
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0,
//                     durationMs: body.durationMs || 0,
//                     speed: body.speed || 0,
//                     summaryVisible: true,
//                     operationType: 'MIGRATION_SUMMARY'
//                   }));
                  
//                   // NEW: Show CDC component after migration completes
//                   setShowCDC(true);
//                 }
//                 else {
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0,
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {},
//                     durationMs: 0,
//                     speed: 0,
//                     summaryVisible: false
//                   });
//                 }
                
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setProgress((p) => ({ 
//       ...p, 
//       status: 'Starting', 
//       transferred: 0, 
//       currentTotal: 0, 
//       originalTotal: 0,
//       durationMs: 0,
//       speed: 0,
//       summaryVisible: false 
//     }));
    
//     // NEW: Hide CDC when starting new migration
//     setShowCDC(false);

//     try {
//       const headers = await getAuthHeader();
      
//       if (migrationBatch && migrationBatch.length > 0) {
//         for (const migration of migrationBatch) {
//           const payload = {
//             sourceDatabase: migration.source?.database || '',
//             sourceCollection: migration.source?.collection || '',
//             targetBucket: migration.target?.bucket || '',
//             targetScope: migration.target?.scope || '',
//             targetCollection: migration.target?.collection || '',
//           };

//           await axios.post(`${API_BASE}/transfer`, payload, {
//             headers: {
//               ...headers,
//               'Content-Type': 'application/json',
//             },
//           });
//         }
//       } else {
//         const payload = {
//           sourceDatabase: safeSource.database,
//           sourceCollection: safeSource.collection,
//           targetBucket: safeTarget.bucket,
//           targetScope: safeTarget.scope,
//           targetCollection: safeTarget.collection,
//         };

//         await axios.post(`${API_BASE}/transfer`, payload, {
//           headers: {
//             ...headers,
//             'Content-Type': 'application/json',
//           },
//         });
//       }
//     } catch (e) {
//       setError(`Failed to initiate migration: ${e.message}`);
//       console.error(e);
//     } finally {
//       setStarting(false);
//     }
//   };

//   const percent = progress.originalTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
//     : 0;

//   // NEW: Function to get CDC connection details based on migration type
//   const getCDCConnectionDetails = () => {
//     if (migrationBatch && migrationBatch.length > 0) {
//       // For batch migrations, use the first migration's target as CDC source
//       const firstMigration = migrationBatch[0];
//       return {
//         database: firstMigration.target?.bucket || '',
//         collection: firstMigration.target?.collection || ''
//       };
//     } else {
//       // For single migration, use the target as CDC source
//       return {
//         database: safeTarget.bucket,
//         collection: safeTarget.collection
//       };
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* Header content */}
//       </div>

//       <div className="migration-title">
//         {getCollectionDisplay()}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           {/* Status text */}
//         </div>

//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//               {progress.currentTotal !== progress.originalTotal && 
//                 ` (Originally: ${progress.originalTotal})`
//               }
//             </strong>
//           </div>
//         </div>

//         {progress.summaryVisible && progress.status === 'COMPLETED' && (
//           <div className="migration-summary">
//             <div className="summary-stats">
//               <div className="summary-item">
//                 <span className="summary-label">Documents Transferred:</span>
//                 <span className="summary-value">{progress.transferred.toLocaleString()}</span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Time Taken:</span>
//                 <span className="summary-value">
//                   {formatDuration(progress.durationMs)}
//                 </span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Speed:</span>
//                 <span className="summary-value">
//                   {progress.speed.toLocaleString()} docs/sec
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* NEW: Conditionally render ChangeDataCapture component */}
//       {showCDC && (
//         <div className="cdc-container">
//           <h3>Change Data Capture</h3>
//           <ChangeDataCapture 
//             connectionDetails={getCDCConnectionDetails()}
//             onClose={() => setShowCDC(false)} // Optional: Add close functionality
//           />
//         </div>
//       )}

//       {/* Start Migration Button (optional) */}
//       {/* <button 
//         onClick={startMigration} 
//         disabled={starting}
//         className="start-button"
//       >
//         {starting ? 'Starting...' : 'Start Migration'}
//       </button> */}
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {},
//   migrationBatch: []
// };

// export default MigrationStarterWithProgress;







// cdc working websockets and all collections


// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import ChangeDataCapture from './changedatacapture';
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {}, migrationBatch = [] }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,
//     currentTotal: 0,
//     originalTotal: 0,
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {},
//     durationMs: 0,
//     speed: 0,
//     summaryVisible: false
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [showCDC, setShowCDC] = useState(false);
//   const [completedMigrations, setCompletedMigrations] = useState(new Set());
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

//   // Add this useEffect to track when all migrations are completed
//   useEffect(() => {
//     // Determine total number of migrations
//     const totalMigrations = migrationBatch && migrationBatch.length > 0 ? migrationBatch.length : 1;
    
//     // Check if all migrations are completed
//     if (completedMigrations.size >= totalMigrations && totalMigrations > 0) {
//       setShowCDC(true);
//       setProgress(prev => ({
//         ...prev,
//         status: 'COMPLETED',
//         operationType: 'MIGRATION_SUMMARY'
//       }));
//     }
//   }, [completedMigrations, migrationBatch]);

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

//   // Format collection display for multiple migrations
//   const getCollectionDisplay = () => {
//     if (migrationBatch && migrationBatch.length > 1) {
//       const mappings = migrationBatch.map(m => 
//         `${m.source?.collection || 'Unknown'} → ${m.target?.collection || 'Unknown'}`
//       );
      
//       if (mappings.length > 0) {
//         return `Migration: ${mappings.join(', ')}`;
//       }
//       return `Migration: Multiple Collections`;
//     } else if (migrationBatch && migrationBatch.length === 1) {
//       const migration = migrationBatch[0];
//       return `Migration: ${migration.source?.collection || ''} → ${migration.target?.collection || ''}`;
//     }
//     return `Migration: ${safeSource.collection} → ${safeTarget.collection}`;
//   };

//   const formatDuration = (ms) => {
//     return `${ms}ms`;
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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 if (body.operationType === 'INSERT') {
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else if (body.status === 'COMPLETED') {
//                   // Track completed migrations for batch processing
//                   if (body.details && body.details.collectionName) {
//                     setCompletedMigrations(prev => {
//                       const newSet = new Set(prev);
//                       newSet.add(body.details.collectionName);
//                       return newSet;
//                     });
                    
//                     // Update progress but DON'T show CDC here
//                     // CDC will be shown by the useEffect when all migrations are done
//                     setProgress(prev => ({
//                       ...prev,
//                       status: 'PARTIAL_COMPLETED',
//                       transferred: body.transferred || 0,
//                       currentTotal: body.currentTotal || body.total || 0,
//                       originalTotal: body.total || body.currentTotal || 0,
//                       durationMs: body.durationMs || 0,
//                       speed: body.speed || 0,
//                       summaryVisible: true,
//                       operationType: 'MIGRATION_PARTIAL_SUMMARY'
//                     }));
//                   } else {
//                     // Fallback for single migration without collection details
//                     setProgress(prev => ({
//                       ...prev,
//                       status: 'COMPLETED',
//                       transferred: body.transferred || 0,
//                       currentTotal: body.currentTotal || body.total || 0,
//                       originalTotal: body.total || body.currentTotal || 0,
//                       durationMs: body.durationMs || 0,
//                       speed: body.speed || 0,
//                       summaryVisible: true,
//                       operationType: 'MIGRATION_SUMMARY'
//                     }));
                    
//                     // For single migration, mark it as completed
//                     setCompletedMigrations(prev => {
//                       const newSet = new Set(prev);
//                       newSet.add('single_migration');
//                       return newSet;
//                     });
//                   }
//                 }
//                 else {
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0,
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {},
//                     durationMs: 0,
//                     speed: 0,
//                     summaryVisible: false
//                   });
//                 }
                
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setCompletedMigrations(new Set()); // Reset completed migrations
//     setProgress((p) => ({ 
//       ...p, 
//       status: 'Starting', 
//       transferred: 0, 
//       currentTotal: 0, 
//       originalTotal: 0,
//       durationMs: 0,
//       speed: 0,
//       summaryVisible: false 
//     }));
    
//     // Hide CDC when starting new migration
//     setShowCDC(false);

//     try {
//       const headers = await getAuthHeader();
      
//       if (migrationBatch && migrationBatch.length > 0) {
//         for (const migration of migrationBatch) {
//           const payload = {
//             sourceDatabase: migration.source?.database || '',
//             sourceCollection: migration.source?.collection || '',
//             targetBucket: migration.target?.bucket || '',
//             targetScope: migration.target?.scope || '',
//             targetCollection: migration.target?.collection || '',
//           };

//           await axios.post(`${API_BASE}/transfer`, payload, {
//             headers: {
//               ...headers,
//               'Content-Type': 'application/json',
//             },
//           });
//         }
//       } else {
//         const payload = {
//           sourceDatabase: safeSource.database,
//           sourceCollection: safeSource.collection,
//           targetBucket: safeTarget.bucket,
//           targetScope: safeTarget.scope,
//           targetCollection: safeTarget.collection,
//         };

//         await axios.post(`${API_BASE}/transfer`, payload, {
//           headers: {
//             ...headers,
//             'Content-Type': 'application/json',
//           },
//         });
//       }
//     } catch (e) {
//       setError(`Failed to initiate migration: ${e.message}`);
//       console.error(e);
//     } finally {
//       setStarting(false);
//     }
//   };

//   const percent = progress.originalTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
//     : 0;

//   // Function to get CDC connection details based on migration type
//   const getCDCConnectionDetails = () => {
//     if (migrationBatch && migrationBatch.length > 0) {
//       // For batch migrations, use the first migration's target as CDC source
//       const firstMigration = migrationBatch[0];
//       return {
//         database: firstMigration.target?.bucket || '',
//         collection: firstMigration.target?.collection || ''
//       };
//     } else {
//       // For single migration, use the target as CDC source
//       return {
//         database: safeTarget.bucket,
//         collection: safeTarget.collection
//       };
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       <div className="progress-header">
//         {/* Header content */}
//       </div>

//       <div className="migration-title">
//         {getCollectionDisplay()}
//       </div>

//       <div className="progress-content">
//         <div className="status-text">
//           {/* Status text */}
//         </div>

//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div
//               className="progress-bar-fill"
//               style={{ width: `${percent}%` }}
//             ></div>
//           </div>
//           <div className="progress-text">
//             <strong>
//               {progress.transferred} / {progress.currentTotal} ({percent}%)
//               {progress.currentTotal !== progress.originalTotal && 
//                 ` (Originally: ${progress.originalTotal})`
//               }
//             </strong>
//           </div>
//         </div>

//         {progress.summaryVisible && (
//           <div className="migration-summary">
//             <div className="summary-stats">
//               <div className="summary-item">
//                 <span className="summary-label">Documents Transferred:</span>
//                 <span className="summary-value">{progress.transferred.toLocaleString()}</span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Time Taken:</span>
//                 <span className="summary-value">
//                   {formatDuration(progress.durationMs)}
//                 </span>
//               </div>
//               <div className="summary-item">
//                 <span className="summary-label">Speed:</span>
//                 <span className="summary-value">
//                   {progress.speed.toLocaleString()} docs/sec
//                 </span>
//               </div>
//               {progress.status === 'PARTIAL_COMPLETED' && (
//                 <div className="summary-item">
//                   <span className="summary-label">Completed Collections:</span>
//                   <span className="summary-value">
//                     {completedMigrations.size} of {migrationBatch.length}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//       </div>

//       {/* Conditionally render ChangeDataCapture component only when ALL migrations are done */}
//       {showCDC && (
//         <div className="cdc-container">
//           {/* <h3>Change Data Capture</h3> */}
//           <ChangeDataCapture 
//             connectionDetails={getCDCConnectionDetails()}
//             onClose={() => setShowCDC(false)}
//           />
//         </div>
//       )}

      
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {},
//   migrationBatch: []
// };

// export default MigrationStarterWithProgress;


// deltabutton

// 




// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import ChangeDataCapture from './changedatacapture';
// import DeltaMigration from './DeltaMigration'
// import './Migrationwebsocket.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

// const MigrationStarterWithProgress = ({ source = {}, target = {}, migrationBatch = [] }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [progress, setProgress] = useState({
//     transferred: 0,
//     currentTotal: 0,
//     originalTotal: 0,
//     status: 'Idle',
//     operationType: 'MIGRATION',
//     changeCount: 0,
//     details: {},
//     durationMs: 0,
//     speed: 0,
//     summaryVisible: false
//   });
//   const [wsConnected, setWsConnected] = useState(false);
//   const [error, setError] = useState(null);
//   const [starting, setStarting] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [showCDC, setShowCDC] = useState(false);
//   const [showDeltaDashboard, setShowDeltaDashboard] = useState(false);
//   const [showDeltaButton, setShowDeltaButton] = useState(false); // Control Delta button visibility
//   const [completedMigrations, setCompletedMigrations] = useState(new Set());
//   const stompClientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   // Track document changes separately
//   const [documentChanges, setDocumentChanges] = useState({
//     inserted: 0,
//     deleted: 0,
//     updated: 0
//   });

//   // Add this useEffect to track when all migrations are completed
//   useEffect(() => {
//     // Determine total number of migrations
//     const totalMigrations = migrationBatch && migrationBatch.length > 0 ? migrationBatch.length : 1;
    
//     // Check if all migrations are completed
//     if (completedMigrations.size >= totalMigrations && totalMigrations > 0) {
//       setShowCDC(true);
//       setProgress(prev => ({
//         ...prev,
//         status: 'COMPLETED',
//         operationType: 'MIGRATION_SUMMARY'
//       }));
//     }
//   }, [completedMigrations, migrationBatch]);

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

//   // Format collection display for multiple migrations
//   const getCollectionDisplay = () => {
//     if (migrationBatch && migrationBatch.length > 1) {
//       const mappings = migrationBatch.map(m => 
//         `${m.source?.collection || 'Unknown'} → ${m.target?.collection || 'Unknown'}`
//       );
      
//       if (mappings.length > 0) {
//         return `Migration: ${mappings.join(', ')}`;
//       }
//       return `Migration: Multiple Collections`;
//     } else if (migrationBatch && migrationBatch.length === 1) {
//       const migration = migrationBatch[0];
//       return `Migration: ${migration.source?.collection || ''} → ${migration.target?.collection || ''}`;
//     }
//     return `Migration: ${safeSource.collection} → ${safeTarget.collection}`;
//   };

//   const formatDuration = (ms) => {
//     return `${ms}ms`;
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
//             '/topic/migration-progress',
//             (msg) => {
//               try {
//                 const body = JSON.parse(msg.body);
//                 console.log('WebSocket message received:', body);
                
//                 if (body.operationType === 'INSERT') {
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: prev.currentTotal + body.changeCount,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     inserted: prev.inserted + body.changeCount
//                   }));
//                 } 
//                 else if (body.operationType === 'DELETE') {
//                   setProgress(prev => ({
//                     ...prev,
//                     currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     deleted: prev.deleted + body.changeCount
//                   }));
//                 }
//                 else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
//                   setProgress(prev => ({
//                     ...prev,
//                     operationType: body.operationType,
//                     changeCount: body.changeCount,
//                     details: body.details || {}
//                   }));
//                   setDocumentChanges(prev => ({
//                     ...prev,
//                     updated: prev.updated + body.changeCount
//                   }));
//                 }
//                 else if (body.status === 'COMPLETED') {
//                   // Track completed migrations for batch processing
//                   if (body.details && body.details.collectionName) {
//                     setCompletedMigrations(prev => {
//                       const newSet = new Set(prev);
//                       newSet.add(body.details.collectionName);
//                       return newSet;
//                     });
                    
//                     // Update progress but DON'T show CDC here
//                     // CDC will be shown by the useEffect when all migrations are done
//                     setProgress(prev => ({
//                       ...prev,
//                       status: 'PARTIAL_COMPLETED',
//                       transferred: body.transferred || 0,
//                       currentTotal: body.currentTotal || body.total || 0,
//                       originalTotal: body.total || body.currentTotal || 0,
//                       durationMs: body.durationMs || 0,
//                       speed: body.speed || 0,
//                       summaryVisible: true,
//                       operationType: 'MIGRATION_PARTIAL_SUMMARY'
//                     }));
//                   } else {
//                     // Fallback for single migration without collection details
//                     setProgress(prev => ({
//                       ...prev,
//                       status: 'COMPLETED',
//                       transferred: body.transferred || 0,
//                       currentTotal: body.currentTotal || body.total || 0,
//                       originalTotal: body.total || body.currentTotal || 0,
//                       durationMs: body.durationMs || 0,
//                       speed: body.speed || 0,
//                       summaryVisible: true,
//                       operationType: 'MIGRATION_SUMMARY'
//                     }));
                    
//                     // For single migration, mark it as completed
//                     setCompletedMigrations(prev => {
//                       const newSet = new Set(prev);
//                       newSet.add('single_migration');
//                       return newSet;
//                     });
//                   }
//                 }
//                 else {
//                   setProgress({
//                     transferred: body.transferred || 0,
//                     currentTotal: body.currentTotal || body.total || 0,
//                     originalTotal: body.total || body.currentTotal || 0,
//                     status: body.status || 'In Progress',
//                     operationType: body.operationType || 'MIGRATION',
//                     changeCount: body.changeCount || 0,
//                     details: body.details || {},
//                     durationMs: 0,
//                     speed: 0,
//                     summaryVisible: false
//                   });
//                 }
                
//                 if (body.operationType && body.operationType !== 'MIGRATION') {
//                   addNotification(body);
//                 }
//               } catch (e) {
//                 console.warn('Invalid progress payload', e, msg.body);
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

//   const addNotification = (event) => {
//     let message = event.details?.message || `Operation: ${event.operationType}`;
//     let type = event.operationType.toLowerCase();
    
//     const newNotification = {
//       id: Date.now(),
//       type: type,
//       message: message,
//       timestamp: new Date().toLocaleTimeString(),
//       count: event.changeCount || 1
//     };
    
//     setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
//     setNotifications([]);
//     setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
//     setCompletedMigrations(new Set()); // Reset completed migrations
//     setProgress((p) => ({ 
//       ...p, 
//       status: 'Starting', 
//       transferred: 0, 
//       currentTotal: 0, 
//       originalTotal: 0,
//       durationMs: 0,
//       speed: 0,
//       summaryVisible: false 
//     }));
    
//     // Show Delta button immediately when migration starts
//     setShowDeltaButton(true);
    
//     // Hide CDC and dashboard when starting new migration
//     setShowCDC(false);
//     setShowDeltaDashboard(false);

//     try {
//       const headers = await getAuthHeader();
      
//       if (migrationBatch && migrationBatch.length > 0) {
//         for (const migration of migrationBatch) {
//           const payload = {
//             sourceDatabase: migration.source?.database || '',
//             sourceCollection: migration.source?.collection || '',
//             targetBucket: migration.target?.bucket || '',
//             targetScope: migration.target?.scope || '',
//             targetCollection: migration.target?.collection || '',
//           };

//           await axios.post(`${API_BASE}/transfer`, payload, {
//             headers: {
//               ...headers,
//               'Content-Type': 'application/json',
//             },
//           });
//         }
//       } else {
//         const payload = {
//           sourceDatabase: safeSource.database,
//           sourceCollection: safeSource.collection,
//           targetBucket: safeTarget.bucket,
//           targetScope: safeTarget.scope,
//           targetCollection: safeTarget.collection,
//         };

//         await axios.post(`${API_BASE}/transfer`, payload, {
//           headers: {
//             ...headers,
//             'Content-Type': 'application/json',
//           },
//         });
//       }
//     } catch (e) {
//       setError(`Failed to initiate migration: ${e.message}`);
//       console.error(e);
//     } finally {
//       setStarting(false);
//     }
//   };

//   const startDeltaMigration = () => {
//     // Show the Delta Migration dashboard
//     setShowDeltaDashboard(true);
//   };

//   const percent = progress.originalTotal > 0
//     ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
//     : 0;

//   // Function to get CDC connection details based on migration type
//   const getCDCConnectionDetails = () => {
//     if (migrationBatch && migrationBatch.length > 0) {
//       // For batch migrations, use the first migration's target as CDC source
//       const firstMigration = migrationBatch[0];
//       return {
//         database: firstMigration.target?.bucket || '',
//         collection: firstMigration.target?.collection || ''
//       };
//     } else {
//       // For single migration, use the target as CDC source
//       return {
//         database: safeTarget.bucket,
//         collection: safeTarget.collection
//       };
//     }
//   };

//   return (
//     <div className="migration-progress-container">
//       {showDeltaDashboard ? (
//         // Show Delta Migration Dashboard
//         <DeltaMigrationDashboard 
//           onBack={() => setShowDeltaDashboard(false)}
//           connectionDetails={getCDCConnectionDetails()}
//         />
//       ) : (
//         // Show Main Migration Interface
//         <>
//           <div className="progress-header">
//             {/* Header content */}
//           </div>

//           <div className="migration-title">
//             {getCollectionDisplay()}
//           </div>

//           <div className="progress-content">
//             <div className="status-text">
//               Status: {progress.status}
//             </div>

//             <div className="progress-bar-container">
//               <div className="progress-bar">
//                 <div
//                   className="progress-bar-fill"
//                   style={{ width: `${percent}%` }}
//                 ></div>
//               </div>
//               <div className="progress-text" style={{ textAlign: 'center' }}>
//                 <strong>
//                   {progress.transferred} / {progress.currentTotal} ({percent}%)
//                   {progress.currentTotal !== progress.originalTotal && 
//                     ` (Originally: ${progress.originalTotal})`
//                   }
//                 </strong>
//               </div>
//             </div>

//             {progress.summaryVisible && (
//               <div className="migration-summary">
//                 <div className="summary-stats">
//                   <div className="summary-item">
//                     <span className="summary-label">Documents Transferred:</span>
//                     <span className="summary-value">{progress.transferred.toLocaleString()}</span>
//                   </div>
//                   <div className="summary-item">
//                     <span className="summary-label">Time Taken:</span>
//                     <span className="summary-value">
//                       {formatDuration(progress.durationMs)}
//                     </span>
//                   </div>
//                   <div className="summary-item">
//                     <span className="summary-label">Speed:</span>
//                     <span className="summary-value">
//                       {progress.speed.toLocaleString()} docs/sec
//                     </span>
//                   </div>
//                   {progress.status === 'PARTIAL_COMPLETED' && (
//                     <div className="summary-item">
//                       <span className="summary-label">Completed Collections:</span>
//                       <span className="summary-value">
//                         {completedMigrations.size} of {migrationBatch.length}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="error-message">
//                 <strong>Error:</strong> {error}
//               </div>
//             )}
//           </div>

//           {/* Start Migration Button - Show when not started */}
//           {progress.status === 'Idle' && (
//             <div className="start-migration-button-container">
//               <button 
//                 className="start-migration-button"
//                 onClick={startMigration}
//                 disabled={starting}
//               >
//                 {starting ? 'Starting Migration...' : 'Start Migration'}
//               </button>
//             </div>
//           )}

//           {/* Delta Migration Button - Show when migration starts */}
//           {showDeltaButton && (
//             <div className="delta-migration-button-container">
//               <button 
//                 className="delta-migration-button"
//                 onClick={startDeltaMigration}
//                 style={{
//                   backgroundColor: 'white',
//                   color: 'black',
//                   border: '1px solid #ccc',
//                   padding: '10px 20px',
//                   borderRadius: '4px',
//                   cursor: 'pointer',
//                   fontWeight: 'bold',
//                   marginTop: '20px'
//                 }}
//               >
//                 Open Delta Migration Dashboard
//               </button>
//             </div>
//           )}

//           {/* Conditionally render ChangeDataCapture component only when ALL migrations are done */}
//           {showCDC && !showDeltaDashboard && (
//             <div className="cdc-container">
//               <ChangeDataCapture 
//                 connectionDetails={getCDCConnectionDetails()}
//                 onClose={() => setShowCDC(false)}
//               />
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// MigrationStarterWithProgress.defaultProps = {
//   source: {},
//   target: {},
//   migrationBatch: []
// };

// export default MigrationStarterWithProgress;




import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import ChangeDataCapture from './changedatacapture';
import DeltaMigration from './DeltaMigration';
import './Migrationwebsocket.css';

const API_BASE = 'http://localhost:8080/api/transfer';
const WS_ENDPOINT = 'http://localhost:8080/ws-migration';

const MigrationStarterWithProgress = ({ source = {}, target = {}, migrationBatch = [] }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [progress, setProgress] = useState({
    transferred: 0,
    currentTotal: 0,
    originalTotal: 0,
    status: 'Idle',
    operationType: 'MIGRATION',
    changeCount: 0,
    details: {},
    durationMs: 0,
    speed: 0,
    summaryVisible: false
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showCDC, setShowCDC] = useState(false);
  const [showDeltaDashboard, setShowDeltaDashboard] = useState(false);
  const [completedMigrations, setCompletedMigrations] = useState(new Set());
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Track document changes separately
  const [documentChanges, setDocumentChanges] = useState({
    inserted: 0,
    deleted: 0,
    updated: 0
  });

  // Add this useEffect to track when all migrations are completed
  useEffect(() => {
    // Determine total number of migrations
    const totalMigrations = migrationBatch && migrationBatch.length > 0 ? migrationBatch.length : 1;
    
    // Check if all migrations are completed
    if (completedMigrations.size >= totalMigrations && totalMigrations > 0) {
      setShowCDC(true);
      setProgress(prev => ({
        ...prev,
        status: 'COMPLETED',
        operationType: 'MIGRATION_SUMMARY'
      }));
    }
  }, [completedMigrations, migrationBatch]);

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

  // Format collection display for multiple migrations
  const getCollectionDisplay = () => {
    if (migrationBatch && migrationBatch.length > 1) {
      const mappings = migrationBatch.map(m => 
        `${m.source?.collection || 'Unknown'} → ${m.target?.collection || 'Unknown'}`
      );
      
      if (mappings.length > 0) {
        return `Migration: ${mappings.join(', ')}`;
      }
      return `Migration: Multiple Collections`;
    } else if (migrationBatch && migrationBatch.length === 1) {
      const migration = migrationBatch[0];
      return `Migration: ${migration.source?.collection || ''} → ${migration.target?.collection || ''}`;
    }
    return `Migration: ${safeSource.collection} → ${safeTarget.collection}`;
  };

  const formatDuration = (ms) => {
    return `${ms}ms`;
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
                console.log('WebSocket message received:', body);
                
                if (body.operationType === 'INSERT') {
                  setProgress(prev => ({
                    ...prev,
                    currentTotal: prev.currentTotal + body.changeCount,
                    operationType: body.operationType,
                    changeCount: body.changeCount,
                    details: body.details || {}
                  }));
                  setDocumentChanges(prev => ({
                    ...prev,
                    inserted: prev.inserted + body.changeCount
                  }));
                } 
                else if (body.operationType === 'DELETE') {
                  setProgress(prev => ({
                    ...prev,
                    currentTotal: Math.max(0, prev.currentTotal - body.changeCount),
                    operationType: body.operationType,
                    changeCount: body.changeCount,
                    details: body.details || {}
                  }));
                  setDocumentChanges(prev => ({
                    ...prev,
                    deleted: prev.deleted + body.changeCount
                  }));
                }
                else if (body.operationType === 'UPDATE' || body.operationType === 'REPLACE') {
                  setProgress(prev => ({
                    ...prev,
                    operationType: body.operationType,
                    changeCount: body.changeCount,
                    details: body.details || {}
                  }));
                  setDocumentChanges(prev => ({
                    ...prev,
                    updated: prev.updated + body.changeCount
                  }));
                }
                else if (body.status === 'COMPLETED') {
                  // Track completed migrations for batch processing
                  if (body.details && body.details.collectionName) {
                    setCompletedMigrations(prev => {
                      const newSet = new Set(prev);
                      newSet.add(body.details.collectionName);
                      return newSet;
                    });
                    
                    // Update progress but DON'T show CDC here
                    // CDC will be shown by the useEffect when all migrations are done
                    setProgress(prev => ({
                      ...prev,
                      status: 'PARTIAL_COMPLETED',
                      transferred: body.transferred || 0,
                      currentTotal: body.currentTotal || body.total || 0,
                      originalTotal: body.total || body.currentTotal || 0,
                      durationMs: body.durationMs || 0,
                      speed: body.speed || 0,
                      summaryVisible: true,
                      operationType: 'MIGRATION_PARTIAL_SUMMARY'
                    }));
                  } else {
                    // Fallback for single migration without collection details
                    setProgress(prev => ({
                      ...prev,
                      status: 'COMPLETED',
                      transferred: body.transferred || 0,
                      currentTotal: body.currentTotal || body.total || 0,
                      originalTotal: body.total || body.currentTotal || 0,
                      durationMs: body.durationMs || 0,
                      speed: body.speed || 0,
                      summaryVisible: true,
                      operationType: 'MIGRATION_SUMMARY'
                    }));
                    
                    // For single migration, mark it as completed
                    setCompletedMigrations(prev => {
                      const newSet = new Set(prev);
                      newSet.add('single_migration');
                      return newSet;
                    });
                  }
                }
                else {
                  setProgress({
                    transferred: body.transferred || 0,
                    currentTotal: body.currentTotal || body.total || 0,
                    originalTotal: body.total || body.currentTotal || 0,
                    status: body.status || 'In Progress',
                    operationType: body.operationType || 'MIGRATION',
                    changeCount: body.changeCount || 0,
                    details: body.details || {},
                    durationMs: 0,
                    speed: 0,
                    summaryVisible: false
                  });
                }
                
                if (body.operationType && body.operationType !== 'MIGRATION') {
                  addNotification(body);
                }
              } catch (e) {
                console.warn('Invalid progress payload', e, msg.body);
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

  const addNotification = (event) => {
    let message = event.details?.message || `Operation: ${event.operationType}`;
    let type = event.operationType.toLowerCase();
    
    const newNotification = {
      id: Date.now(),
      type: type,
      message: message,
      timestamp: new Date().toLocaleTimeString(),
      count: event.changeCount || 1
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
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
    setNotifications([]);
    setDocumentChanges({ inserted: 0, deleted: 0, updated: 0 });
    setCompletedMigrations(new Set()); // Reset completed migrations
    setProgress((p) => ({ 
      ...p, 
      status: 'Starting', 
      transferred: 0, 
      currentTotal: 0, 
      originalTotal: 0,
      durationMs: 0,
      speed: 0,
      summaryVisible: false 
    }));
    
    // Hide CDC when starting new migration
    setShowCDC(false);
    setShowDeltaDashboard(false);

    try {
      const headers = await getAuthHeader();
      
      if (migrationBatch && migrationBatch.length > 0) {
        for (const migration of migrationBatch) {
          const payload = {
            sourceDatabase: migration.source?.database || '',
            sourceCollection: migration.source?.collection || '',
            targetBucket: migration.target?.bucket || '',
            targetScope: migration.target?.scope || '',
            targetCollection: migration.target?.collection || '',
          };

          await axios.post(`${API_BASE}/transfer`, payload, {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          });
        }
      } else {
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
      }
    } catch (e) {
      setError(`Failed to initiate migration: ${e.message}`);
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const startDeltaMigration = () => {
    // Show the Delta Migration dashboard
    setShowDeltaDashboard(true);
  };

  const handleBackFromDashboard = () => {
    // Return to migration view
    setShowDeltaDashboard(false);
  };

  const percent = progress.originalTotal > 0
    ? Math.min(100, ((progress.transferred / progress.originalTotal) * 100).toFixed(1))
    : 0;

  // Function to get CDC connection details based on migration type
  const getCDCConnectionDetails = () => {
    if (migrationBatch && migrationBatch.length > 0) {
      // For batch migrations, use the first migration's target as CDC source
      const firstMigration = migrationBatch[0];
      return {
        database: firstMigration.target?.bucket || '',
        collection: firstMigration.target?.collection || ''
      };
    } else {
      // For single migration, use the target as CDC source
      return {
        database: safeTarget.bucket,
        collection: safeTarget.collection
      };
    }
  };

  return (
    <div className="migration-progress-container">
      {showDeltaDashboard ? (
        // Show Delta Migration Dashboard (REPLACES the entire view)
        <DeltaMigration 
          migrationProgress={progress}
          onBack={handleBackFromDashboard}
          connectionDetails={getCDCConnectionDetails()}
        />
      ) : (
        // Show Main Migration Interface (original content)
        <>
          <div className="progress-header">
            {/* Header content */}
          </div>

          <div className="migration-title">
            {getCollectionDisplay()}
          </div>

          <div className="progress-content">
            <div className="status-text">
              Status: {progress.status}
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="progress-text" style={{ textAlign: 'center' }}>
                <strong>
                  {progress.transferred} / {progress.currentTotal} ({percent}%)
                  {progress.currentTotal !== progress.originalTotal && 
                    ` (Originally: ${progress.originalTotal})`
                  }
                </strong>
              </div>
            </div>

            {progress.summaryVisible && (
              <div className="migration-summary">
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="summary-label">Documents Transferred:</span>
                    <span className="summary-value">{progress.transferred.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Time Taken:</span>
                    <span className="summary-value">
                      {formatDuration(progress.durationMs)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Speed:</span>
                    <span className="summary-value">
                      {progress.speed.toLocaleString()} docs/sec
                    </span>
                  </div>
                  {progress.status === 'PARTIAL_COMPLETED' && (
                    <div className="summary-item">
                      <span className="summary-label">Completed Collections:</span>
                      <span className="summary-value">
                        {completedMigrations.size} of {migrationBatch.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Start Migration Button */}
          {progress.status === 'Idle' && (
            <div className="start-migration-button-container">
              <button 
                className="start-migration-button"
                onClick={startMigration}
                disabled={starting}
              >
                {starting ? 'Starting Migration...' : 'Start Migration'}
              </button>
            </div>
          )}

          {/* Delta Migration Button - Show after migration completes */}
          {showCDC && (
            <div className="delta-migration-button-container">
              <button 
                className="delta-migration-button"
                onClick={startDeltaMigration}
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  border: '1px solid #ccc',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  margin: '20px 0'
                }}
              >
                Open Delta Migration Dashboard
              </button>
            </div>
          )}

          {/* Conditionally render ChangeDataCapture component only when ALL migrations are done */}
          {showCDC && !showDeltaDashboard && (
            <div className="cdc-container">
              <ChangeDataCapture 
                connectionDetails={getCDCConnectionDetails()}
                onClose={() => setShowCDC(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

MigrationStarterWithProgress.defaultProps = {
  source: {},
  target: {},
  migrationBatch: []
};

export default MigrationStarterWithProgress;