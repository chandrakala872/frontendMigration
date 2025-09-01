// import React, { useState, useEffect } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// const WS_URL = "http://localhost:8080/ws-migration";
// const PROGRESS_TOPIC = "/topic/migration-progress";
// const CDC_TOPIC = "/topic/cdc-events";

// const ChangeDataCapture = () => {
//   const [events, setEvents] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [lastMessage, setLastMessage] = useState("");

//   useEffect(() => {
//     console.log("🔄 Setting up WebSocket connection to:", WS_URL);
    
//     const socket = new SockJS(WS_URL);
//     const client = new Client({
//       webSocketFactory: () => socket,
//       reconnectDelay: 5000,
//       onConnect: () => {
//         console.log("✅ WebSocket connected successfully!");
//         setConnectionStatus("Connected");
        
//         // Subscribe to CDC events
//         client.subscribe(CDC_TOPIC, (message) => {
//           console.log("📨 Raw message received:", message.body);
//           setLastMessage(`Received: ${new Date().toLocaleTimeString()}`);
          
//           try {
//             const eventData = JSON.parse(message.body);
//             console.log("✅ Parsed CDC Event:", eventData);
            
//             const timestamp = new Date().toLocaleString();
//             const operation = eventData.eventType || "Unknown";
//             const documentId = eventData.documentId || "-";
            
//             const status =
//               operation === "DELETE" || operation === "FIELD_DELETE"
//                 ? "❌ Deleted"
//                 : operation === "INSERT"
//                 ? "✅ Inserted"
//                 : operation === "UPDATE"
//                 ? "⚡ Updated"
//                 : operation === "DROP"
//                 ? "🗑️ Collection Dropped"
//                 : "❓ Unknown";

//             const newEvent = { 
//               timestamp, 
//               operation, 
//               documentId, 
//               status,
//               rawData: eventData
//             };

//             setEvents((prev) => [newEvent, ...prev.slice(0, 100)]);
            
//           } catch (error) {
//             console.error("❌ Error parsing CDC event:", error);
//             console.error("Raw message that failed:", message.body);
//           }
//         });

//         // Subscribe to progress updates
//         client.subscribe(PROGRESS_TOPIC, (message) => {
//           console.log("📊 Progress update:", message.body);
//         });
//       },
//       onDisconnect: () => {
//         console.log("❌ WebSocket disconnected");
//         setConnectionStatus("Disconnected");
//       },
//       onStompError: (err) => {
//         console.error("❌ STOMP error:", err);
//         setConnectionStatus(`Error: ${err.message}`);
//       },
//       debug: function(str) {
//         console.log("🔍 STOMP debug:", str);
//       }
//     });

//     client.activate();

//     return () => {
//       console.log("🧹 Cleaning up WebSocket connection");
//       client.deactivate();
//     };
//   }, []);

//   const testConnection = () => {
//     // Test using the backend API
//     fetch("http://localhost:8080/api/test/send-test-cdc", {
//       method: "POST"
//     })
//     .then(response => response.text())
//     .then(data => {
//       console.log("Test result:", data);
//       alert(data);
//     })
//     .catch(error => {
//       console.error("Test failed:", error);
//       alert("Test failed: " + error.message);
//     });
//   };

//   const testDelete = () => {
//     // Test delete event
//     fetch("http://localhost:8080/api/test/send-test-delete", {
//       method: "POST"
//     })
//     .then(response => response.text())
//     .then(data => {
//       console.log("Delete test result:", data);
//       alert(data);
//     })
//     .catch(error => {
//       console.error("Delete test failed:", error);
//       alert("Delete test failed: " + error.message);
//     });
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h2>CDC Events Monitor</h2>
      
//       {/* Connection Status */}
//       <div style={{ 
//         padding: '10px', 
//         marginBottom: '15px', 
//         backgroundColor: connectionStatus === 'Connected' ? '#d4edda' : '#f8d7da',
//         border: `1px solid ${connectionStatus === 'Connected' ? '#c3e6cb' : '#f5c6cb'}`,
//         borderRadius: '4px'
//       }}>
//         <strong>Status:</strong> {connectionStatus} | 
//         <strong> Last Message:</strong> {lastMessage}
//       </div>

//       {/* Test Buttons */}
//       <div style={{ marginBottom: '15px' }}>
//         <button 
//           onClick={testConnection}
//           style={{
//             padding: '8px 16px',
//             marginRight: '10px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Send Test Insert Event
//         </button>
        
//         <button 
//           onClick={testDelete}
//           style={{
//             padding: '8px 16px',
//             backgroundColor: '#dc3545',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Send Test Delete Event
//         </button>
//       </div>

//       <div style={{ 
//         maxHeight: "400px", 
//         overflowY: "auto", 
//         border: "1px solid #ccc", 
//         borderRadius: "5px"
//       }}>
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
//             <tr>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Timestamp</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Operation</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Document ID</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {events.map((e, index) => {
//               const color =
//                 e.operation === "DELETE" || e.operation === "FIELD_DELETE"
//                   ? "red"
//                   : e.operation === "INSERT"
//                   ? "green"
//                   : e.operation === "UPDATE"
//                   ? "orange"
//                   : e.operation === "DROP"
//                   ? "purple"
//                   : "gray";

//               return (
//                 <tr key={index}>
//                   <td style={{ border: "1px solid #ccc", padding: "8px", fontSize: "12px" }}>
//                     {e.timestamp}
//                   </td>
//                   <td style={{ 
//                     border: "1px solid #ccc", 
//                     padding: "8px", 
//                     color,
//                     fontWeight: "bold",
//                     fontSize: "12px"
//                   }}>
//                     {e.operation}
//                   </td>
//                   <td style={{ 
//                     border: "1px solid #ccc", 
//                     padding: "8px",
//                     fontSize: "12px",
//                     fontFamily: "monospace"
//                   }}>
//                     {e.documentId}
//                   </td>
//                   <td style={{ 
//                     border: "1px solid #ccc", 
//                     padding: "8px", 
//                     color,
//                     fontWeight: "bold",
//                     fontSize: "12px"
//                   }}>
//                     {e.status}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
        
//         {events.length === 0 && (
//           <div style={{ 
//             padding: '20px', 
//             textAlign: 'center', 
//             color: '#666',
//             fontStyle: 'italic'
//           }}>
//             ⏳ Waiting for CDC events... 
//             <br />
//             <small>Click "Send Test Insert Event" to test the connection</small>
//           </div>
//         )}
//       </div>
      
//       <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
//         Connected to: {WS_URL} | Listening to: {CDC_TOPIC} | Events: {events.length}
//       </div>
//     </div>
//   );
// };

// export default ChangeDataCapture;

//  drop collection 

// import React, { useState, useEffect } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// const WS_URL = "http://localhost:8080/ws-migration";
// const PROGRESS_TOPIC = "/topic/migration-progress";
// const CDC_TOPIC = "/topic/cdc-events";

// const ChangeDataCapture = () => {
//   const [events, setEvents] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [lastMessage, setLastMessage] = useState("");

//   useEffect(() => {
//     console.log("🔄 Setting up WebSocket connection to:", WS_URL);
    
//     const socket = new SockJS(WS_URL);
//     const client = new Client({
//       webSocketFactory: () => socket,
//       reconnectDelay: 5000,
//       onConnect: () => {
//         console.log("✅ WebSocket connected successfully!");
//         setConnectionStatus("Connected");
        
//         // Subscribe to CDC events
//         client.subscribe(CDC_TOPIC, (message) => {
//           console.log("📨 Raw message received:", message.body);
//           setLastMessage(`Received: ${new Date().toLocaleTimeString()}`);
          
//           try {
//             const eventData = JSON.parse(message.body);
//             console.log("✅ Parsed CDC Event:", eventData);
            
//             const timestamp = new Date().toLocaleString();
//             let operation = eventData.eventType || "Unknown";
//             let documentId = eventData.documentId || "-";
//             let status = "❓ Unknown";
//             let color = "gray";
//             let details = "";

//             // Handle different types of CDC events
//             if (operation === "DELETE" || operation === "FIELD_DELETE") {
//               status = "❌ Deleted";
//               color = "red";
//               details = `Document deleted`;
//             } else if (operation === "INSERT") {
//               status = "✅ Inserted";
//               color = "green";
//               details = `Document inserted`;
//             } else if (operation === "UPDATE") {
//               status = "⚡ Updated";
//               color = "orange";
//               details = `Document updated`;
//             } else if (operation === "DROP_COLLECTION") {
//               operation = "DROP_COLLECTION";
//               documentId = eventData.droppedCollection || "unknown_collection";
//               const deletedCount = eventData.deletedCount || 0;
//               status = `🗑️ Collection Dropped`;
//               color = "purple";
//               details = `${deletedCount} documents deleted`;
//             }

//             const newEvent = { 
//               timestamp, 
//               operation, 
//               documentId, 
//               status,
//               color,
//               details,
//               rawData: eventData
//             };

//             setEvents((prev) => [newEvent, ...prev.slice(0, 200)]); // Keep more events for monitoring
            
//           } catch (error) {
//             console.error("❌ Error parsing CDC event:", error);
//             console.error("Raw message that failed:", message.body);
            
//             // Add error event to the list
//             const errorEvent = {
//               timestamp: new Date().toLocaleString(),
//               operation: "PARSE_ERROR",
//               documentId: "-",
//               status: "❌ Parse Error",
//               color: "red",
//               details: "Failed to parse CDC event",
//               rawData: { error: error.message }
//             };
//             setEvents((prev) => [errorEvent, ...prev.slice(0, 200)]);
//           }
//         });

//         // Subscribe to progress updates (optional)
//         client.subscribe(PROGRESS_TOPIC, (message) => {
//           try {
//             const progressData = JSON.parse(message.body);
//             console.log("📊 Progress update:", progressData);
            
//             // You can add progress events to the list if needed
//             if (progressData.status === "COLLECTION_DROPPED") {
//               const dropEvent = {
//                 timestamp: new Date().toLocaleString(),
//                 operation: "DROP_PROGRESS",
//                 documentId: progressData.details?.droppedCollection || "unknown",
//                 status: "📊 Drop Detected",
//                 color: "blue",
//                 details: "Collection drop in progress",
//                 rawData: progressData
//               };
//               setEvents((prev) => [dropEvent, ...prev.slice(0, 200)]);
//             }
//           } catch (error) {
//             console.error("Error parsing progress update:", error);
//           }
//         });
//       },
//       onDisconnect: () => {
//         console.log("❌ WebSocket disconnected");
//         setConnectionStatus("Disconnected");
        
//         // Add disconnect event
//         const disconnectEvent = {
//           timestamp: new Date().toLocaleString(),
//           operation: "DISCONNECT",
//           documentId: "-",
//           status: "🔌 Disconnected",
//           color: "red",
//           details: "WebSocket connection lost",
//           rawData: {}
//         };
//         setEvents((prev) => [disconnectEvent, ...prev.slice(0, 200)]);
//       },
//       onStompError: (err) => {
//         console.error("❌ STOMP error:", err);
//         setConnectionStatus(`Error: ${err.message}`);
//       },
//       debug: function(str) {
//         console.log("🔍 STOMP debug:", str);
//       }
//     });

//     client.activate();

//     // Add connection started event
//     const connectEvent = {
//       timestamp: new Date().toLocaleString(),
//       operation: "CONNECT",
//       documentId: "-",
//       status: "🔗 Connecting...",
//       color: "blue",
//       details: "Attempting to connect to WebSocket",
//       rawData: {}
//     };
//     setEvents((prev) => [connectEvent, ...prev.slice(0, 200)]);

//     return () => {
//       console.log("🧹 Cleaning up WebSocket connection");
//       client.deactivate();
//     };
//   }, []);

//   const clearEvents = () => {
//     setEvents([]);
//   };

//   const simulateRealDrop = () => {
//     // This is just for demonstration - in real scenario, drops come from MongoDB
//     const simulatedDropEvent = {
//       timestamp: new Date().toLocaleString(),
//       operation: "DROP_COLLECTION",
//       documentId: "products",
//       status: "🗑️ Collection Dropped",
//       color: "purple",
//       details: "15 documents deleted",
//       rawData: {
//         eventType: "DROP_COLLECTION",
//         droppedCollection: "products",
//         deletedCount: 15,
//         timestamp: Date.now()
//       }
//     };
//     setEvents((prev) => [simulatedDropEvent, ...prev.slice(0, 200)]);
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h2> Real-time CDC Events Monitor</h2>
      
//       {/* Connection Status */}
//       {/* <div style={{ 
//         padding: '10px', 
//         marginBottom: '15px', 
//         backgroundColor: connectionStatus === 'Connected' ? '#d4edda' : '#f8d7da',
//         border: `1px solid ${connectionStatus === 'Connected' ? '#c3e6cb' : '#f5c6cb'}`,
//         borderRadius: '4px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center'
//       }}>
//         <div>
//           <strong>Status:</strong> {connectionStatus} | 
//           <strong> Last Message:</strong> {lastMessage}
//         </div>
//         <button 
//           onClick={clearEvents}
//           style={{
//             padding: '5px 10px',
//             backgroundColor: '#6c757d',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '12px'
//           }}
//         >
//           Clear Events ({events.length})
//         </button>
//       </div> */}

//       {/* Info Panel
//       <div style={{ 
//         marginBottom: '15px', 
//         padding: '10px', 
//         backgroundColor: '#e7f3ff', 
//         border: '1px solid #b8daff',
//         borderRadius: '4px'
//       }}>
//         <strong>🎯 Monitoring:</strong> MongoDB CDC Events (Insert, Update, Delete, Drop Collection)
//         <br />
//         <strong>📍 Connected to:</strong> {WS_URL}
//         <br />
//         <strong>📡 Listening to:</strong> {CDC_TOPIC}
//       </div> */}

//       {/* Events Table */}
//       <div style={{ 
//         maxHeight: "500px", 
//         overflowY: "auto", 
//         border: "1px solid #ccc", 
//         borderRadius: "5px",
//         marginBottom: '10px'
//       }}>
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
//             <tr>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Timestamp</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Operation</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Collection/Document</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Status</th>
//               <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             {events.map((e, index) => (
//               <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
//                 <td style={{ border: "1px solid #ccc", padding: "8px", fontSize: "12px" }}>
//                   {e.timestamp}
//                 </td>
//                 <td style={{ 
//                   border: "1px solid #ccc", 
//                   padding: "8px", 
//                   color: e.color,
//                   fontWeight: "bold",
//                   fontSize: "12px"
//                 }}>
//                   {e.operation}
//                 </td>
//                 <td style={{ 
//                   border: "1px solid #ccc", 
//                   padding: "8px",
//                   fontSize: "12px",
//                   fontFamily: "monospace",
//                   maxWidth: "150px",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   whiteSpace: "nowrap"
//                 }}>
//                   {e.documentId}
//                 </td>
//                 <td style={{ 
//                   border: "1px solid #ccc", 
//                   padding: "8px", 
//                   color: e.color,
//                   fontWeight: "bold",
//                   fontSize: "12px"
//                 }}>
//                   {e.status}
//                 </td>
//                 <td style={{ 
//                   border: "1px solid #ccc", 
//                   padding: "8px",
//                   fontSize: "12px",
//                   color: '#666'
//                 }}>
//                   {e.details}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
        
//         {/* {events.length === 0 && (
//           <div style={{ 
//             padding: '40px', 
//             textAlign: 'center', 
//             color: '#666',
//             fontStyle: 'italic'
//           }}>
//             ⏳ Waiting for CDC events from MongoDB...
//             <br />
//             <small>Drop a collection in MongoDB to see it appear here automatically</small>
//           </div> */}
//         {/* )} */}
//       </div>

//       {/* Instructions */}
//       {/* <div style={{ 
//         marginTop: '20px', 
//         padding: '15px', 
//         backgroundColor: '#f8f9fa', 
//         border: '1px solid #e9ecef',
//         borderRadius: '4px',
//         fontSize: '14px'
//       }}> */}
//         {/* <h4>📋 How to Test:</h4>
//         <ol style={{ margin: '0', paddingLeft: '20px' }}>
//           <li><strong>Drop a collection in MongoDB</strong> (it will appear automatically)</li>
//           <li><strong>Insert/Update/Delete documents</strong> in MongoDB</li>
//           <li><strong>Watch real-time events</strong> appear in the table above</li>
//           <li><strong>Drop collections will show in purple</strong> with document count</li>
//         </ol> */}
        
//         {/* <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
//           <strong>💡 Note:</strong> This monitor automatically detects <strong>real MongoDB operations</strong>. 
//           When you drop a collection in your database, it will automatically appear here via CDC.
//         </div> */}
//       {/* </div> */}
//     </div>
//   );
// };

// export default ChangeDataCapture;




import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "http://localhost:8080/ws-migration";
const CDC_TOPIC = "/topic/cdc-events";

const ChangeDataCapture = () => {
  const [events, setEvents] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  useEffect(() => {
    console.log("Setting up WebSocket connection to:", WS_URL);
    
    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected successfully!");
        setConnectionStatus("Connected");
        
        // Subscribe to CDC events
        client.subscribe(CDC_TOPIC, (message) => {
          console.log("Raw message received:", message.body);
          
          try {
            const eventData = JSON.parse(message.body);
            console.log("Parsed CDC Event:", eventData);
            
            const timestamp = new Date().toLocaleString();
            let operation = eventData.eventType || "Unknown";
            let documentId = eventData.documentId || "-";
            let status = "Unknown";
            let color = "gray";

            // Handle different types of CDC events
            if (operation === "DELETE" || operation === "FIELD_DELETE") {
              status = "❌ Deleted";
              color = "red";
            } else if (operation === "INSERT") {
              status = "✅ Inserted";
              color = "green";
            } else if (operation === "UPDATE") {
              status = "⚡ Updated";
              color = "orange";
            } else if (operation === "DROP_COLLECTION") {
              operation = "DROP_COLLECTION";
              documentId = eventData.droppedCollection || "unknown_collection";
              status = "🗑️ Dropped";
              color = "purple";
            }

            const newEvent = { 
              timestamp, 
              operation, 
              documentId, 
              status,
              color
            };

            setEvents((prev) => [newEvent, ...prev.slice(0, 100)]);
            
          } catch (error) {
            console.error("Error parsing CDC event:", error);
          }
        });
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setConnectionStatus("Disconnected");
      },
      onStompError: (err) => {
        console.error("STOMP error:", err);
        setConnectionStatus(`Error: ${err.message}`);
      }
    });

    client.activate();

    return () => {
      console.log("Cleaning up WebSocket connection");
      client.deactivate();
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Change Data Capture</h3>
      
      {/* Events Table */}
      <div style={{ 
        maxHeight: "400px", 
        overflowY: "auto", 
        border: "1px solid #ccc", 
        borderRadius: "5px",
        marginBottom: '10px'
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Timestamp</th>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Operation</th>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Document ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px", background: "#f5f5f5" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ border: "1px solid #ccc", padding: "8px", fontSize: "12px" }}>
                  {e.timestamp}
                </td>
                <td style={{ 
                  border: "1px solid #ccc", 
                  padding: "8px", 
                  color: e.color,
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  {e.operation}
                </td>
                <td style={{ 
                  border: "1px solid #ccc", 
                  padding: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {e.documentId}
                </td>
                <td style={{ 
                  border: "1px solid #ccc", 
                  padding: "8px", 
                  color: e.color,
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  {e.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {events.length === 0 && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#666',
            fontStyle: 'italic'
          }}>
            ⏳ Waiting for CDC events...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeDataCapture;