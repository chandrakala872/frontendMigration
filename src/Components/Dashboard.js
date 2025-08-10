// import React, { useState, useEffect } from 'react';
// // import './MongoDBSchemaAnalysis.css';

// const MongoDBSchemaAnalysis = () => {
//   const [stats, setStats] = useState({
//     totalDatabases: 0,
//     totalCollections: 0,
//     totalDocuments: 0,
//     totalStorageSize: '0 MB'
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState('');

//   const fetchMongoStats = async () => {
//     try {
//       const authString = btoa(`${process.env.REACT_APP_API_USERNAME}:${process.env.REACT_APP_API_PASSWORD}`);
//       const response = await fetch(
//         `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/transfer/metadata/mongo`,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Basic ${authString}`
//           },
//           credentials: 'include'
//         }
//       );

//       if (response.status === 401) {
//         throw new Error('Authentication failed. Please check your credentials.');
//       }

//       if (!response.ok) {
//         throw new Error(`Server responded with status ${response.status}`);
//       }

//       const data = await response.json();
//       setStats(data);
//       setLastUpdated(new Date().toLocaleTimeString());
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error('API Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMongoStats();
//   }, []);

//   const handleRefresh = () => {
//     setLoading(true);
//     fetchMongoStats();
//   };

//   if (loading) {
//     return (
//       <div className="loading-state">
//         <div className="spinner"></div>
//         <p>Loading MongoDB statistics...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-state">
//         <div className="error-icon">
//           <i className="fas fa-exclamation-circle"></i>
//         </div>
//         <h3>Error Loading Data</h3>
//         <p>{error}</p>
//         <button className="retry-btn" onClick={handleRefresh}>
//           <i className="fas fa-sync-alt"></i> Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="schema-analysis-container">
//       <div className="dashboard-header">
//         <div className="header-content">
//           <h1>
//             <i className="fas fa-database"></i> MongoDB Schema Analysis
//           </h1>
//           <p className="dashboard-description">
//             Overview of your MongoDB instance structure and storage utilization
//           </p>
//         </div>
//         <div className="header-actions">
//           <span className="last-updated">
//             <i className="fas fa-clock"></i> Last updated: {lastUpdated}
//           </span>
//           <button className="refresh-btn" onClick={handleRefresh}>
//             <i className="fas fa-sync-alt"></i> Refresh Data
//           </button>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <StatCard
//           icon="database"
//           title="Total Databases"
//           value={stats.totalDatabases}
//           color="#3498db"
//         />
//         <StatCard
//           icon="folder"
//           title="Total Collections"
//           value={stats.totalCollections}
//           color="#2ecc71"
//         />
//         <StatCard
//           icon="file-alt"
//           title="Total Documents"
//           value={stats.totalDocuments.toLocaleString()}
//           color="#e74c3c"
//         />
//         <StatCard
//           icon="hdd"
//           title="Total Storage"
//           value={stats.totalStorageSize}
//           color="#f39c12"
//         />
//       </div>

//       <div className="storage-details">
//         <h2>
//           <i className="fas fa-chart-pie"></i> Storage Breakdown
//         </h2>
//         <div className="storage-visualization">
//           <div className="storage-bar">
//             <div
//               className="data-segment"
//               style={{ width: '70%' }}
//               title="Data Storage"
//             ></div>
//             <div
//               className="index-segment"
//               style={{ width: '30%' }}
//               title="Index Storage"
//             ></div>
//           </div>
//           <div className="storage-legend">
//             <div className="legend-item">
//               <span className="data-color"></span>
//               <span>Data (70%)</span>
//             </div>
//             <div className="legend-item">
//               <span className="index-color"></span>
//               <span>Indexes (30%)</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon, title, value, color }) => (
//   <div className="stat-card" style={{ borderTopColor: color }}>
//     <div className="stat-icon" style={{ color }}>
//       <i className={`fas fa-${icon}`}></i>
//     </div>
//     <div className="stat-content">
//       <h3>{title}</h3>
//       <p className="stat-value">{value}</p>
//     </div>
//   </div>
// );

// export default MongoDBSchemaAnalysis;