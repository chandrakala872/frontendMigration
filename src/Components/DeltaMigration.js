// import React, { useState, useEffect, useRef } from 'react';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import './DeltaMigration.css';

// const DeltaMigration = () => {
//   const [migrationSteps, setMigrationSteps] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const stompClientRef = useRef(null);

//   useEffect(() => {
//     connectWebSocket();
    
//     // Fetch initial status
//     fetchInitialStatus();
    
//     return () => {
//       if (stompClientRef.current) {
//         stompClientRef.current.deactivate();
//       }
//     };
//   }, []);

//   const connectWebSocket = () => {
//     const client = new Client({
//       webSocketFactory: () => new SockJS('http://localhost:8080/ws-functions'),
//       reconnectDelay: 5000,
//       debug: (str) => {
//         if (str.includes('ERROR') || str.includes('Exception')) {
//           console.error('STOMP Error:', str);
//         }
//       },
//       onConnect: () => {
//         setConnectionStatus('connected');
//         console.log('Connected to WebSocket');
        
//         // Subscribe to migration status updates
//         stompClientRef.current.subscribe('/topic/migration-status', (message) => {
//           try {
//             const steps = JSON.parse(message.body);
//             setMigrationSteps(steps);
//           } catch (error) {
//             console.error('Error parsing migration status:', error, message.body);
//           }
//         });
//       },
//       onStompError: (frame) => {
//         console.error('STOMP error:', frame);
//         setConnectionStatus('error');
//       },
//       onWebSocketError: (error) => {
//         console.error('WebSocket error:', error);
//         setConnectionStatus('error');
//       },
//       onDisconnect: () => {
//         setConnectionStatus('disconnected');
//       }
//     });

//     stompClientRef.current = client;
//     client.activate();
//   };

//   const fetchInitialStatus = async () => {
//     try {
//       const response = await fetch('http://localhost:8080/api/migration/status');
//       if (response.ok) {
//         const steps = await response.json();
//         setMigrationSteps(steps);
//       }
//     } catch (error) {
//       console.error('Error fetching initial status:', error);
//     }
//   };

//   const startMigration = () => {
//     if (stompClientRef.current && stompClientRef.current.connected) {
//       stompClientRef.current.publish({
//         destination: '/app/start-migration',
//         body: JSON.stringify({})
//       });
//     }
//   };

//   const resetMigration = () => {
//     if (stompClientRef.current && stompClientRef.current.connected) {
//       stompClientRef.current.publish({
//         destination: '/app/reset-migration',
//         body: JSON.stringify({})
//       });
//     }
//   };

//   return (
//     <div className="delta-migration-container">
//       <div className="migration-header">
//         <h2>Migration Status</h2>
//         <div className="connection-status">
//           Status: {connectionStatus}
//         </div>
//       </div>

//       <div className="controls">
//         <button 
//           onClick={startMigration} 
//           disabled={connectionStatus !== 'connected'}
//           className="btn-start"
//         >
//           Start Migration
//         </button>
//         <button 
//           onClick={resetMigration}
//           className="btn-reset"
//         >
//           Reset
//         </button>
//       </div>

//       <div className="migration-table-container">
//         <table className="migration-table">
//           <thead>
//             <tr>
//               <th className="time-column">Timestamp</th>
//               <th className="task-column">Task</th>
//               <th className="details-column">Details</th>
//             </tr>
//           </thead>
//           <tbody>
//             {migrationSteps.length > 0 ? (
//               migrationSteps.map((step) => (
//                 <tr key={step.id}>
//                   <td className="time-cell">{step.time}</td>
//                   <td className="task-cell">{step.task}</td>
//                   <td className="details-cell">{step.details}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="3" className="no-data">
//                   No migration data available. Connect and start migration.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DeltaMigration;

import React, { useState, useEffect } from 'react';
import './DeltaMigration.css';

const DeltaMigration = ({ migrationProgress, onBack, connectionDetails }) => {
  const [migrationSteps, setMigrationSteps] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Provide default values for migrationProgress
  const progress = migrationProgress || {
    transferred: 0,
    currentTotal: 0,
    originalTotal: 0,
    percentage: 0,
    status: 'Idle'
  };

  useEffect(() => {
    // Format current time to show like "5:57 AM"
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    // Calculate times based on current time
    const now = new Date();
    const currentTimeFormatted = formatTime(now);
    
    // Create future times (10 mins, 30 mins, 31 mins from now)
    const tenMinsLater = new Date(now.getTime() + 10 * 60000);
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60000);
    const thirtyOneMinsLater = new Date(now.getTime() + 31 * 60000);

    // Set up the migration steps with real timings
    const steps = [
      {
        id: "1",
        time: currentTimeFormatted,
        task: "Full Data Migration",
        details: "MongoDB to Couchbase",
        status: progress.status !== 'COMPLETED' ? 'in-progress' : 'completed',
        connectionStatus: "Application connected to MongoDB"
      },
      {
        id: "2", 
        time: formatTime(tenMinsLater),
        task: "All Prechecks for Application failover",
        details: "Application still Connected to Mongo",
        status: progress.status === 'COMPLETED' ? 'in-progress' : 'pending',
        connectionStatus: "Application connected to MongoDB"
      },
      {
        id: "3",
        time: formatTime(thirtyMinsLater),
        task: "Run CDC to capture data",
        details: `Capturing data from ${currentTimeFormatted} to ${formatTime(thirtyMinsLater)}`,
        status: 'pending',
        connectionStatus: "Application connected to MongoDB"
      },
      {
        id: "4",
        time: formatTime(thirtyOneMinsLater), 
        task: "Application switchover",
        details: "Application is Connected to Couchbase",
        status: 'pending',
        connectionStatus: "Application connected to Couchbase"
      }
    ];
    
    setMigrationSteps(steps);
  }, [progress, currentTime]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  return (
    <div className="delta-dashboard-container">
      {/* Dashboard Header with Back Button */}
      <div className="dashboard-header">
        <button onClick={onBack} className="back-button">
          ← Back to Migration
        </button>
        <h2>Delta Migration Dashboard</h2>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Migration Steps Table */}
        <div className="migration-steps-section">
          <h3>Migration Progress</h3>
          <div className="migration-table-container">
            <table className="migration-table">
              <thead>
                <tr>
                  <th className="time-column">Time</th>
                  <th className="task-column">Task</th>
                  <th className="details-column">Details</th>
                  <th className="status-column">Connection Status</th>
                </tr>
              </thead>
              <tbody>
                {migrationSteps.map((step) => (
                  <tr key={step.id} className={getStatusClass(step.status)}>
                    <td className="time-cell">{step.time}</td>
                    <td className="task-cell">{step.task}</td>
                    <td className="details-cell">{step.details}</td>
                    <td className="status-cell">
                      <span className={`connection-status ${step.status}`}>
                        {step.connectionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeltaMigration;