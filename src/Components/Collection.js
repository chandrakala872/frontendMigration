// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from "react-router-dom";
// import './Collection.css';
// import Migrationwebsocket from './Migrationwebsocket';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const prependAll = (arr) => (Array.isArray(arr) ? ['All', ...arr] : ['All']);

// export default function Collection() {
//   const { getAccessTokenSilently } = useAuth0();

//   // MongoDB State
//   const [databases, setDatabases] = useState([]);
//   const [selectedDatabase, setSelectedDatabase] = useState('');
//   const [collections, setCollections] = useState(['All']);
//   const [selectedMongoCollections, setSelectedMongoCollections] = useState(['All']);
//   const [mongoSearchTerm, setMongoSearchTerm] = useState('');

//   // Couchbase State
//   const [buckets, setBuckets] = useState([]);
//   const [selectedBucket, setSelectedBucket] = useState('');
//   const [scopes, setScopes] = useState([]);
//   const [selectedScope, setSelectedScope] = useState('');
//   const [couchCollections, setCouchCollections] = useState(['All']);
//   const [selectedCouchCollections, setSelectedCouchCollections] = useState(['All']);
//   const [couchSearchTerm, setCouchSearchTerm] = useState('');

//   // Status / errors
//   const [error, setError] = useState(null);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [lastRefresh, setLastRefresh] = useState(new Date());
//   const [migrationStarted, setMigrationStarted] = useState(false);
//   const [migrationCompleted, setMigrationCompleted] = useState(false); // New state to track migration completion

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   // Auto-refresh data every 5 seconds
//   useEffect(() => {
//     const refreshData = async () => {
//       if (isMigrating) return; // Don't refresh during migration

//       try {
//         setIsLoading(true);
//         const headers = await getAuthHeader();

//         // Refresh databases
//         const dbRes = await axios.get(`${API_BASE}/databases`, { headers });
//         if (Array.isArray(dbRes.data)) {
//           setDatabases(dbRes.data);
//           if (!selectedDatabase && dbRes.data.length) {
//             setSelectedDatabase(dbRes.data[0]);
//           }
//         }

//         // Refresh buckets
//         const bucketRes = await axios.get(`${API_BASE}/buckets`, { headers });
//         const bucketList = bucketRes.data?.buckets || [];
//         setBuckets(bucketList);
//         if (!selectedBucket && bucketList.length) {
//           setSelectedBucket(bucketList[0]);
//         }

//         setLastRefresh(new Date());
//       } catch (e) {
//         console.error('Auto-refresh error:', e);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Initial load
//     refreshData();

//     // Set up interval for auto-refresh
//     const interval = setInterval(refreshData, 5000);
//     return () => clearInterval(interval);
//   }, [isMigrating, selectedDatabase, selectedBucket]);

//   // Refresh collections when database changes or on auto-refresh
//   useEffect(() => {
//     const fetchCollections = async () => {
//       if (!selectedDatabase) return;
     
//       try {
//         const headers = await getAuthHeader();
//         const res = await axios.get(
//           `${API_BASE}/databases/${encodeURIComponent(selectedDatabase)}/collections`,
//           { headers }
//         );
//         if (Array.isArray(res.data)) {
//           setCollections(prependAll(res.data));
//         }
//       } catch (e) {
//         console.error('Failed to refresh collections:', e);
//       }
//     };

//     fetchCollections();
//   }, [selectedDatabase, lastRefresh]);

//   // Refresh scopes and collections when bucket changes or on auto-refresh
//   useEffect(() => {
//     const fetchBucketData = async () => {
//       if (!selectedBucket) return;
     
//       try {
//         const headers = await getAuthHeader();
//         await axios.post(
//           `${API_BASE}/select-bucket`,
//           null,
//           { headers, params: { bucketName: selectedBucket } }
//         );
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: selectedBucket },
//         });
       
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setScopes(scopeList);
         
//           if (!selectedScope && scopeList.length) {
//             setSelectedScope(scopeList[0]);
//           }
         
//           const activeScope = selectedScope || (scopeList.length ? scopeList[0] : '');
//           if (activeScope) {
//             setCouchCollections(prependAll(mapping[activeScope] || []));
//           }
//         }
//       } catch (e) {
//         console.error('Failed to refresh bucket data:', e);
//       }
//     };

//     fetchBucketData();
//   }, [selectedBucket, selectedScope, lastRefresh]);

//   // Filter collections based on search term
//   const filteredMongoCollections = useMemo(() => {
//     return collections.filter(collection =>
//       collection.toLowerCase().includes(mongoSearchTerm.toLowerCase())
//     );
//   }, [collections, mongoSearchTerm]);

//   const filteredCouchCollections = useMemo(() => {
//     return couchCollections.filter(collection =>
//       collection.toLowerCase().includes(couchSearchTerm.toLowerCase())
//     );
//   }, [couchCollections, couchSearchTerm]);

//   // Toggle MongoDB collection selection - UPDATED with proper "All" behavior
//   const toggleMongoCollection = (col) => {
//     if (col === 'All') {
//       if (selectedMongoCollections.includes('All')) {
//         // If "All" is already selected, deselect everything
//         setSelectedMongoCollections([]);
//       } else {
//         // If "All" is not selected, select "All" and all collections
//         setSelectedMongoCollections(['All', ...collections.filter(c => c !== 'All')]);
//       }
//     } else {
//       setSelectedMongoCollections((prev) => {
//         const withoutAll = prev.filter((c) => c !== 'All');
       
//         if (withoutAll.includes(col)) {
//           // Deselect this collection
//           const newSelection = withoutAll.filter((c) => c !== col);
         
//           // If no collections are selected, select "All"
//           if (newSelection.length === 0) {
//             return ['All'];
//           }
//           return newSelection;
//         } else {
//           // Select this collection
//           const newSelection = [...withoutAll, col];
         
//           // If all collections are selected, select "All" instead
//           if (newSelection.length === collections.filter(c => c !== 'All').length) {
//             return ['All'];
//           }
//           return newSelection;
//         }
//       });
//     }
//   };

//   // Toggle Couchbase collection selection - UPDATED with proper "All" behavior
//   const toggleCouchCollection = (col) => {
//     if (col === 'All') {
//       if (selectedCouchCollections.includes('All')) {
//         // If "All" is already selected, deselect everything
//         setSelectedCouchCollections([]);
//       } else {
//         // If "All" is not selected, select "All" and all collections
//         setSelectedCouchCollections(['All', ...couchCollections.filter(c => c !== 'All')]);
//       }
//     } else {
//       setSelectedCouchCollections((prev) => {
//         const withoutAll = prev.filter((c) => c !== 'All');
       
//         if (withoutAll.includes(col)) {
//           // Deselect this collection
//           const newSelection = withoutAll.filter((c) => c !== col);
         
//           // If no collections are selected, select "All"
//           if (newSelection.length === 0) {
//             return ['All'];
//           }
//           return newSelection;
//         } else {
//           // Select this collection
//           const newSelection = [...withoutAll, col];
         
//           // If all collections are selected, select "All" instead
//           if (newSelection.length === couchCollections.filter(c => c !== 'All').length) {
//             return ['All'];
//           }
//           return newSelection;
//         }
//       });
//     }
//   };

//   // Get effective collections to migrate (excluding 'All' if selected)
//   const effectiveMongoCollections = useMemo(() => {
//     if (selectedMongoCollections.includes('All')) {
//       return collections.filter((c) => c !== 'All');
//     }
//     return selectedMongoCollections;
//   }, [selectedMongoCollections, collections]);

//   const effectiveCouchCollections = useMemo(() => {
//     if (selectedCouchCollections.includes('All')) {
//       return couchCollections.filter((c) => c !== 'All');
//     }
//     return selectedCouchCollections;
//   }, [selectedCouchCollections, couchCollections]);

//   // Handle migration process
//   const handleMigrate = async () => {
//     setError(null);
   
//     // Validation
//     if (!selectedDatabase) {
//       setError('Please select a MongoDB database');
//       return;
//     }
//     if (!effectiveMongoCollections.length) {
//       setError('Please select at least one MongoDB collection');
//       return;
//     }
//     if (!selectedBucket) {
//       setError('Please select a Couchbase bucket');
//       return;
//     }
//     if (!selectedScope) {
//       setError('Please select a Couchbase scope');
//       return;
//     }
//     if (!effectiveCouchCollections.length) {
//       setError('Please select at least one Couchbase collection');
//       return;
//     }

//     setMigrationStarted(true);
//     setIsMigrating(true);
//     setMigrationCompleted(false); // Reset completion status
//     const tokenHeader = await getAuthHeader();

//     try {
//       // Process each combination of source and target collections
//       for (const mongoCol of effectiveMongoCollections) {
//         for (const couchCol of effectiveCouchCollections) {
//           const payload = {
//             mongoDatabase: selectedDatabase,
//             mongoCollection: mongoCol,
//             bucketName: selectedBucket,
//             scopeName: selectedScope,
//             collectionName: couchCol,
//           };

//           try {
//             await axios.post(`${API_BASE}/transfer`, payload, {
//               headers: {
//                 ...tokenHeader,
//                 'Content-Type': 'application/json',
//               },
//             });
//           } catch (e) {
//             console.error(`Failed to migrate: ${mongoCol} → ${couchCol}`, e);
//           }
//         }
//       }
//     } finally {
//       setIsMigrating(false);
//       setMigrationCompleted(true); // Set migration as completed
//     }
//   };

//   const navigate = useNavigate();

//   return (
//     <div className="migration-container">
//       <div className="migration-header">
//         <div className="refresh-info">
//           {/* Last refreshed: {lastRefresh.toLocaleTimeString()} */}
//           {/* <span className="auto-refresh-note">(Auto-refreshing every 5 seconds)</span> */}
//         </div>
//       </div>

//       <div className="migration-content">
//         <div className="database-panels">
//           {/* MongoDB Source Panel */}
//           <div className="database-panel mongo-panel">
//             <div className="panel-header">
//               <h2>MongoDB Source</h2>
//             </div>
           
//             <div className="form-group">
//               <label>Database</label>
//               <select
//                 value={selectedDatabase}
//                 onChange={(e) => setSelectedDatabase(e.target.value)}
//                 disabled={isLoading || isMigrating}
//               >
//                 {databases.map((db) => (
//                   <option key={db} value={db}>{db}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Collections</label>
//               <div className="search-box">
//                 <input
//                   type="text"
//                   placeholder="Search collections..."
//                   value={mongoSearchTerm}
//                   onChange={(e) => setMongoSearchTerm(e.target.value)}
//                   disabled={isMigrating}
//                 />
//               </div>
//               <div className="collections-list">
//                 {filteredMongoCollections.map((col) => (
//                   <div key={col} className="collection-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={selectedMongoCollections.includes(col)}
//                         onChange={() => toggleMongoCollection(col)}
//                         disabled={isMigrating}
//                       />
//                       <span>{col}</span>
//                     </label>
//                   </div>
//                 ))}
//               </div>
//               <div className="selection-hint">
//                 {selectedMongoCollections.includes('All')
//                   ? 'All collections selected'
//                   : `${selectedMongoCollections.filter(c => c !== 'All').length} selected`}
//               </div>
//             </div>
//           </div>

//           {/* Couchbase Target Panel */}
//           <div className="database-panel couchbase-panel">
//             <div className="panel-header">
//               <h2>Couchbase Target</h2>
//             </div>
           
//             <div className="form-group">
//               <label>Bucket</label>
//               <select
//                 value={selectedBucket}
//                 onChange={(e) => setSelectedBucket(e.target.value)}
//                 disabled={isLoading || isMigrating}
//               >
//                 {buckets.map((b) => (
//                   <option key={b} value={b}>{b}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Scope</label>
//               <select
//                 value={selectedScope}
//                 onChange={(e) => setSelectedScope(e.target.value)}
//                 disabled={isLoading || isMigrating}
//               >
//                 {scopes.map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Collections</label>
//               <div className="search-box">
//                 <input
//                   type="text"
//                   placeholder="Search collections..."
//                   value={couchSearchTerm}
//                   onChange={(e) => setCouchSearchTerm(e.target.value)}
//                   disabled={isMigrating}
//                 />
//               </div>
//               <div className="collections-list">
//                 {filteredCouchCollections.map((col) => (
//                   <div key={col} className="collection-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={selectedCouchCollections.includes(col)}
//                         onChange={() => toggleCouchCollection(col)}
//                         disabled={isMigrating}
//                       />
//                       <span>{col}</span>
//                     </label>
//                   </div>
//                 ))}
//               </div>
//               <div className="selection-hint">
//                 {selectedCouchCollections.includes('All')
//                   ? 'All collections selected'
//                   : `${selectedCouchCollections.filter(c => c !== 'All').length} selected`}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Migration Controls */}
//         <div className="migration-controls">
//           {error && <div className="error-message">{error}</div>}
         
//           {/* Show only Start Migration button initially */}
//           {!migrationStarted && (
//             <button
//               onClick={handleMigrate}
//               disabled={isLoading}
//               className="migrate-button"
//             >
//               Start Migration
//             </button>
//           )}
         
//           {/* Show progress bar and Migrate Functions button after migration starts */}
//           {migrationStarted && (
//             <>
//               <button
//                 onClick={handleMigrate}
//                 disabled={isMigrating || isLoading}
//                 className="migrate-button"
//               >
//                 {isMigrating ? (
//                   <>
//                     <span className="spinner"></span>
//                     Migrating...
//                   </>
//                 ) : 'Start Migration'}
//               </button>
             
//               <Migrationwebsocket
//                 migrations={[
//                   {
//                     source: { database: selectedDatabase, collection: 'All' },
//                     target: { bucket: selectedBucket, scope: selectedScope, collection: 'All' }
//                   }
//                 ]}
//               />

//               {/* Show Migrate Functions button only after migration is completed */}
//               {migrationCompleted && (
//                 <button
//                   className="function-button"
//                   onClick={() => navigate('/functions', {
//                     state: {
//                       selectedDatabase,
//                       selectedBucket,
//                       selectedScope
//                     }
//                   })}
//                 >
//                   Migrate Functions
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }







// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from "react-router-dom";
// import './Collection.css';
// import Migrationwebsocket from './Migrationwebsocket';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const prependAll = (arr) => (Array.isArray(arr) ? ['All', ...arr] : ['All']);

// export default function Collection() {
//   const { getAccessTokenSilently } = useAuth0();

//   // MongoDB State
//   const [databases, setDatabases] = useState([]);
//   const [selectedDatabase, setSelectedDatabase] = useState('');
//   const [collections, setCollections] = useState(['All']);
//   const [selectedMongoCollections, setSelectedMongoCollections] = useState(['All']);
//   const [mongoSearchTerm, setMongoSearchTerm] = useState('');

//   // Couchbase State
//   const [buckets, setBuckets] = useState([]);
//   const [selectedBucket, setSelectedBucket] = useState('');
//   const [scopes, setScopes] = useState([]);
//   const [selectedScope, setSelectedScope] = useState('');
//   const [couchCollections, setCouchCollections] = useState(['All']);
//   const [selectedCouchCollections, setSelectedCouchCollections] = useState(['All']);
//   const [couchSearchTerm, setCouchSearchTerm] = useState('');

//   // Status / errors
//   const [error, setError] = useState(null);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [lastRefresh, setLastRefresh] = useState(new Date());
//   const [migrationStarted, setMigrationStarted] = useState(false);
//   const [migrationCompleted, setMigrationCompleted] = useState(false);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   // Auto-refresh data every 5 seconds
//   useEffect(() => {
//     const refreshData = async () => {
//       if (isMigrating) return; // Don't refresh during migration

//       try {
//         setIsLoading(true);
//         const headers = await getAuthHeader();

//         // Refresh databases
//         const dbRes = await axios.get(`${API_BASE}/databases`, { headers });
//         if (Array.isArray(dbRes.data)) {
//           setDatabases(dbRes.data);
//           if (!selectedDatabase && dbRes.data.length) {
//             setSelectedDatabase(dbRes.data[0]);
//           }
//         }

//         // Refresh buckets
//         const bucketRes = await axios.get(`${API_BASE}/buckets`, { headers });
//         const bucketList = bucketRes.data?.buckets || [];
//         setBuckets(bucketList);
//         if (!selectedBucket && bucketList.length) {
//           setSelectedBucket(bucketList[0]);
//         }

//         setLastRefresh(new Date());
//       } catch (e) {
//         console.error('Auto-refresh error:', e);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Initial load
//     refreshData();

//     // Set up interval for auto-refresh
//     const interval = setInterval(refreshData, 5000);
//     return () => clearInterval(interval);
//   }, [isMigrating, selectedDatabase, selectedBucket]);

//   // Refresh collections when database changes or on auto-refresh
//   useEffect(() => {
//     const fetchCollections = async () => {
//       if (!selectedDatabase) return;
     
//       try {
//         const headers = await getAuthHeader();
//         const res = await axios.get(
//           `${API_BASE}/databases/${encodeURIComponent(selectedDatabase)}/collections`,
//           { headers }
//         );
//         if (Array.isArray(res.data)) {
//           setCollections(prependAll(res.data));
//         }
//       } catch (e) {
//         console.error('Failed to refresh collections:', e);
//       }
//     };

//     fetchCollections();
    
//     // Set up interval for auto-refresh of collections
//     const interval = setInterval(fetchCollections, 5000);
//     return () => clearInterval(interval);
//   }, [selectedDatabase, lastRefresh]);

//   // Refresh scopes and collections when bucket changes or on auto-refresh
//   useEffect(() => {
//     const fetchBucketData = async () => {
//       if (!selectedBucket) return;
     
//       try {
//         const headers = await getAuthHeader();
//         await axios.post(
//           `${API_BASE}/select-bucket`,
//           null,
//           { headers, params: { bucketName: selectedBucket } }
//         );
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: selectedBucket },
//         });
       
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setScopes(scopeList);
         
//           if (!selectedScope && scopeList.length) {
//             setSelectedScope(scopeList[0]);
//           }
         
//           const activeScope = selectedScope || (scopeList.length ? scopeList[0] : '');
//           if (activeScope) {
//             setCouchCollections(prependAll(mapping[activeScope] || []));
//           }
//         }
//       } catch (e) {
//         console.error('Failed to refresh bucket data:', e);
//       }
//     };

//     fetchBucketData();
    
//     // Set up interval for auto-refresh of scopes and collections
//     const interval = setInterval(fetchBucketData, 5000);
//     return () => clearInterval(interval);
//   }, [selectedBucket, selectedScope, lastRefresh]);

//   // Filter collections based on search term
//   const filteredMongoCollections = useMemo(() => {
//     return collections.filter(collection =>
//       collection.toLowerCase().includes(mongoSearchTerm.toLowerCase())
//     );
//   }, [collections, mongoSearchTerm]);

//   const filteredCouchCollections = useMemo(() => {
//     return couchCollections.filter(collection =>
//       collection.toLowerCase().includes(couchSearchTerm.toLowerCase())
//     );
//   }, [couchCollections, couchSearchTerm]);

//   // Toggle MongoDB collection selection - UPDATED with proper "All" behavior
//   const toggleMongoCollection = (col) => {
//     if (col === 'All') {
//       if (selectedMongoCollections.includes('All')) {
//         // If "All" is already selected, deselect everything
//         setSelectedMongoCollections([]);
//       } else {
//         // If "All" is not selected, select "All" and all collections
//         setSelectedMongoCollections(['All', ...collections.filter(c => c !== 'All')]);
//       }
//     } else {
//       setSelectedMongoCollections((prev) => {
//         const withoutAll = prev.filter((c) => c !== 'All');
       
//         if (withoutAll.includes(col)) {
//           // Deselect this collection
//           const newSelection = withoutAll.filter((c) => c !== col);
         
//           // If no collections are selected, select "All"
//           if (newSelection.length === 0) {
//             return ['All'];
//           }
//           return newSelection;
//         } else {
//           // Select this collection
//           const newSelection = [...withoutAll, col];
         
//           // If all collections are selected, select "All" instead
//           if (newSelection.length === collections.filter(c => c !== 'All').length) {
//             return ['All'];
//           }
//           return newSelection;
//         }
//       });
//     }
//   };

//   // Toggle Couchbase collection selection - UPDATED with proper "All" behavior
//   const toggleCouchCollection = (col) => {
//     if (col === 'All') {
//       if (selectedCouchCollections.includes('All')) {
//         // If "All" is already selected, deselect everything
//         setSelectedCouchCollections([]);
//       } else {
//         // If "All" is not selected, select "All" and all collections
//         setSelectedCouchCollections(['All', ...couchCollections.filter(c => c !== 'All')]);
//       }
//     } else {
//       setSelectedCouchCollections((prev) => {
//         const withoutAll = prev.filter((c) => c !== 'All');
       
//         if (withoutAll.includes(col)) {
//           // Deselect this collection
//           const newSelection = withoutAll.filter((c) => c !== col);
         
//           // If no collections are selected, select "All"
//           if (newSelection.length === 0) {
//             return ['All'];
//           }
//           return newSelection;
//         } else {
//           // Select this collection
//           const newSelection = [...withoutAll, col];
         
//           // If all collections are selected, select "All" instead
//           if (newSelection.length === couchCollections.filter(c => c !== 'All').length) {
//             return ['All'];
//           }
//           return newSelection;
//         }
//       });
//     }
//   };

//   // Get effective collections to migrate (excluding 'All' if selected)
//   const effectiveMongoCollections = useMemo(() => {
//     if (selectedMongoCollections.includes('All')) {
//       return collections.filter((c) => c !== 'All');
//     }
//     return selectedMongoCollections;
//   }, [selectedMongoCollections, collections]);

//   const effectiveCouchCollections = useMemo(() => {
//     if (selectedCouchCollections.includes('All')) {
//       return couchCollections.filter((c) => c !== 'All');
//     }
//     return selectedCouchCollections;
//   }, [selectedCouchCollections, couchCollections]);

//   // Handle migration process
//   const handleMigrate = async () => {
//     setError(null);
   
//     // Validation
//     if (!selectedDatabase) {
//       setError('Please select a MongoDB database');
//       return;
//     }
//     if (!effectiveMongoCollections.length) {
//       setError('Please select at least one MongoDB collection');
//       return;
//     }
//     if (!selectedBucket) {
//       setError('Please select a Couchbase bucket');
//       return;
//     }
//     if (!selectedScope) {
//       setError('Please select a Couchbase scope');
//       return;
//     }
//     if (!effectiveCouchCollections.length) {
//       setError('Please select at least one Couchbase collection');
//       return;
//     }

//     setMigrationStarted(true);
//     setIsMigrating(true);
//     setMigrationCompleted(false);
//     const tokenHeader = await getAuthHeader();

//     try {
//       // Process each combination of source and target collections
//       for (const mongoCol of effectiveMongoCollections) {
//         for (const couchCol of effectiveCouchCollections) {
//           const payload = {
//             mongoDatabase: selectedDatabase,
//             mongoCollection: mongoCol,
//             bucketName: selectedBucket,
//             scopeName: selectedScope,
//             collectionName: couchCol,
//           };

//           try {
//             await axios.post(`${API_BASE}/transfer`, payload, {
//               headers: {
//                 ...tokenHeader,
//                 'Content-Type': 'application/json',
//               },
//             });
//           } catch (e) {
//             console.error(`Failed to migrate: ${mongoCol} → ${couchCol}`, e);
//           }
//         }
//       }
//     } finally {
//       setIsMigrating(false);
//       setMigrationCompleted(true);
//     }
//   };

//   const navigate = useNavigate();

//   return (
//     <div className="migration-container">
//       <div className="migration-header">
//         <div className="refresh-info">
//           {/* Last refreshed: {lastRefresh.toLocaleTimeString()} */}
//           {/* <span className="auto-refresh-note">(Auto-refreshing every 5 seconds)</span> */}
//         </div>
//       </div>

//       <div className="migration-content">
//         <div className="database-panels">
//           {/* MongoDB Source Panel */}
//           <div className="database-panel mongo-panel">
//             <div className="panel-header">
//               <h2>MongoDB Source</h2>
//             </div>
           
//             <div className="form-group">
//               <label>Database</label>
//               <select
//                 value={selectedDatabase}
//                 onChange={(e) => setSelectedDatabase(e.target.value)}
//                 disabled={isLoading || isMigrating}
//               >
//                 {databases.map((db) => (
//                   <option key={db} value={db}>{db}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Collections</label>
//               <div className="search-box">
//                 <input
//                   type="text"
//                   placeholder="Search collections..."
//                   value={mongoSearchTerm}
//                   onChange={(e) => setMongoSearchTerm(e.target.value)}
//                   disabled={isMigrating}
//                 />
//               </div>
//               <div className="collections-list">
//                 {filteredMongoCollections.map((col) => (
//                   <div key={col} className="collection-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={selectedMongoCollections.includes(col)}
//                         onChange={() => toggleMongoCollection(col)}
//                         disabled={isMigrating}
//                       />
//                       <span>{col}</span>
//                     </label>
//                   </div>
//                 ))}
//               </div>
//               <div className="selection-hint">
//                 {selectedMongoCollections.includes('All')
//                   ? 'All collections selected'
//                   : `${selectedMongoCollections.filter(c => c !== 'All').length} selected`}
//               </div>
//             </div>
//           </div>

//           {/* Couchbase Target Panel */}
//           <div className="database-panel couchbase-panel">
//             <div className="panel-header">
//               <h2>Couchbase Target</h2>
//             </div>
           
//             <div className="form-group">
//               <label>Bucket</label>
//               <select
//                 value={selectedBucket}
//                 onChange={(e) => setSelectedBucket(e.target.value)}
//                 disabled={isLoading || isMigrating}
//               >
//                 {buckets.map((b) => (
//                   <option key={b} value={b}>{b}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Scope</label>
//               <select
//                 value={selectedScope}
//                 onChange={(e) => setSelectedScope(e.target.value)}
//                 disabled={isLoading || isMigrating}
//               >
//                 {scopes.map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Collections</label>
//               <div className="search-box">
//                 <input
//                   type="text"
//                   placeholder="Search collections..."
//                   value={couchSearchTerm}
//                   onChange={(e) => setCouchSearchTerm(e.target.value)}
//                   disabled={isMigrating}
//                 />
//               </div>
//               <div className="collections-list">
//                 {filteredCouchCollections.map((col) => (
//                   <div key={col} className="collection-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={selectedCouchCollections.includes(col)}
//                         onChange={() => toggleCouchCollection(col)}
//                         disabled={isMigrating}
//                       />
//                       <span>{col}</span>
//                     </label>
//                   </div>
//                 ))}
//               </div>
//               <div className="selection-hint">
//                 {selectedCouchCollections.includes('All')
//                   ? 'All collections selected'
//                   : `${selectedCouchCollections.filter(c => c !== 'All').length} selected`}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Migration Controls */}
//         <div className="migration-controls">
//           {error && <div className="error-message">{error}</div>}
         
//           {/* Show only Start Migration button initially */}
//           {!migrationStarted && (
//             <button
//               onClick={handleMigrate}
//               disabled={isLoading}
//               className="migrate-button"
//             >
//               Start Migration
//             </button>
//           )}
         
//           {/* Show progress bar and Migrate Functions button after migration starts */}
//           {migrationStarted && (
//             <>
//               <button
//                 onClick={handleMigrate}
//                 disabled={isMigrating || isLoading}
//                 className="migrate-button"
//               >
//                 {isMigrating ? (
//                   <>
//                     <span className="spinner"></span>
//                     Migrating...
//                   </>
//                 ) : 'Start Migration'}
//               </button>
             
//               <Migrationwebsocket
//                 migrations={[
//                   {
//                     source: { database: selectedDatabase, collection: 'All' },
//                     target: { bucket: selectedBucket, scope: selectedScope, collection: 'All' }
//                   }
//                 ]}
//               />

//               {/* Show Migrate Functions button only after migration is completed */}
//               {migrationCompleted && (
//                 <button
//                   className="function-button"
//                   onClick={() => navigate('/functions', {
//                     state: {
//                       selectedDatabase,
//                       selectedBucket,
//                       selectedScope
//                     }
//                   })}
//                 >
//                   Migrate Functions
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from "react-router-dom";
import './Collection.css';
import Migrationwebsocket from './Migrationwebsocket';

const API_BASE = 'http://localhost:8080/api/transfer';

const prependAll = (arr) => (Array.isArray(arr) ? ['All', ...arr] : ['All']);

export default function Collection() {
  const { getAccessTokenSilently } = useAuth0();

  // MongoDB State
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [collections, setCollections] = useState(['All']);
  const [selectedMongoCollections, setSelectedMongoCollections] = useState(['All']);
  const [mongoSearchTerm, setMongoSearchTerm] = useState('');

  // Couchbase State
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [scopes, setScopes] = useState([]);
  const [selectedScope, setSelectedScope] = useState('');
  const [couchCollections, setCouchCollections] = useState(['All']);
  const [selectedCouchCollections, setSelectedCouchCollections] = useState(['All']);
  const [couchSearchTerm, setCouchSearchTerm] = useState('');

  // Status / errors
  const [error, setError] = useState(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [migrationStarted, setMigrationStarted] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  const getAuthHeader = async () => {
    const token = await getAccessTokenSilently();
    return { Authorization: `Bearer ${token}` };
  };

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    const refreshData = async () => {
      if (isMigrating) return; // Don't refresh during migration

      try {
        setIsLoading(true);
        const headers = await getAuthHeader();

        // Refresh databases
        const dbRes = await axios.get(`${API_BASE}/databases`, { headers });
        if (Array.isArray(dbRes.data)) {
          setDatabases(dbRes.data);
          if (!selectedDatabase && dbRes.data.length) {
            setSelectedDatabase(dbRes.data[0]);
          }
        }

        // Refresh buckets
        const bucketRes = await axios.get(`${API_BASE}/buckets`, { headers });
        const bucketList = bucketRes.data?.buckets || [];
        setBuckets(bucketList);
        if (!selectedBucket && bucketList.length) {
          setSelectedBucket(bucketList[0]);
        }

        setLastRefresh(new Date());
      } catch (e) {
        console.error('Auto-refresh error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    refreshData();

    // Set up interval for auto-refresh
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [isMigrating, selectedDatabase, selectedBucket]);

  // Refresh collections when database changes or on auto-refresh
  useEffect(() => {
    const fetchCollections = async () => {
      if (!selectedDatabase) return;
     
      try {
        const headers = await getAuthHeader();
        const res = await axios.get(
          `${API_BASE}/databases/${encodeURIComponent(selectedDatabase)}/collections`,
          { headers }
        );
        if (Array.isArray(res.data)) {
          setCollections(prependAll(res.data));
        }
      } catch (e) {
        console.error('Failed to refresh collections:', e);
      }
    };

    fetchCollections();
    
    // Set up interval for auto-refresh of collections
    const interval = setInterval(fetchCollections, 5000);
    return () => clearInterval(interval);
  }, [selectedDatabase, lastRefresh]);

  // Refresh scopes and collections when bucket changes or on auto-refresh
  useEffect(() => {
    const fetchBucketData = async () => {
      if (!selectedBucket) return;
     
      try {
        const headers = await getAuthHeader();
        await axios.post(
          `${API_BASE}/select-bucket`,
          null,
          { headers, params: { bucketName: selectedBucket } }
        );
        const res = await axios.get(`${API_BASE}/couchbase-collections`, {
          headers,
          params: { bucketName: selectedBucket },
        });
       
        if (res.data && typeof res.data === 'object') {
          const mapping = res.data;
          const scopeList = Object.keys(mapping);
          setScopes(scopeList);
         
          if (!selectedScope && scopeList.length) {
            setSelectedScope(scopeList[0]);
          }
         
          const activeScope = selectedScope || (scopeList.length ? scopeList[0] : '');
          if (activeScope) {
            setCouchCollections(prependAll(mapping[activeScope] || []));
          }
        }
      } catch (e) {
        console.error('Failed to refresh bucket data:', e);
      }
    };

    fetchBucketData();
    
    // Set up interval for auto-refresh of scopes and collections
    const interval = setInterval(fetchBucketData, 5000);
    return () => clearInterval(interval);
  }, [selectedBucket, selectedScope, lastRefresh]);

  // Filter collections based on search term
  const filteredMongoCollections = useMemo(() => {
    return collections.filter(collection =>
      collection.toLowerCase().includes(mongoSearchTerm.toLowerCase())
    );
  }, [collections, mongoSearchTerm]);

  const filteredCouchCollections = useMemo(() => {
    return couchCollections.filter(collection =>
      collection.toLowerCase().includes(couchSearchTerm.toLowerCase())
    );
  }, [couchCollections, couchSearchTerm]);

  // Toggle MongoDB collection selection - UPDATED with proper "All" behavior
  const toggleMongoCollection = (col) => {
    if (col === 'All') {
      if (selectedMongoCollections.includes('All')) {
        // If "All" is already selected, deselect everything
        setSelectedMongoCollections([]);
      } else {
        // If "All" is not selected, select "All" and all collections
        setSelectedMongoCollections(['All', ...collections.filter(c => c !== 'All')]);
      }
    } else {
      setSelectedMongoCollections((prev) => {
        const withoutAll = prev.filter((c) => c !== 'All');
       
        if (withoutAll.includes(col)) {
          // Deselect this collection
          const newSelection = withoutAll.filter((c) => c !== col);
         
          // If no collections are selected, select "All"
          if (newSelection.length === 0) {
            return ['All'];
          }
          return newSelection;
        } else {
          // Select this collection
          const newSelection = [...withoutAll, col];
         
          // If all collections are selected, select "All" instead
          if (newSelection.length === collections.filter(c => c !== 'All').length) {
            return ['All'];
          }
          return newSelection;
        }
      });
    }
  };

  // Toggle Couchbase collection selection - UPDATED with proper "All" behavior
  const toggleCouchCollection = (col) => {
    if (col === 'All') {
      if (selectedCouchCollections.includes('All')) {
        // If "All" is already selected, deselect everything
        setSelectedCouchCollections([]);
      } else {
        // If "All" is not selected, select "All" and all collections
        setSelectedCouchCollections(['All', ...couchCollections.filter(c => c !== 'All')]);
      }
    } else {
      setSelectedCouchCollections((prev) => {
        const withoutAll = prev.filter((c) => c !== 'All');
       
        if (withoutAll.includes(col)) {
          // Deselect this collection
          const newSelection = withoutAll.filter((c) => c !== col);
         
          // If no collections are selected, select "All"
          if (newSelection.length === 0) {
            return ['All'];
          }
          return newSelection;
        } else {
          // Select this collection
          const newSelection = [...withoutAll, col];
         
          // If all collections are selected, select "All" instead
          if (newSelection.length === couchCollections.filter(c => c !== 'All').length) {
            return ['All'];
          }
          return newSelection;
        }
      });
    }
  };

  // Get effective collections to migrate (excluding 'All' if selected)
  const effectiveMongoCollections = useMemo(() => {
    if (selectedMongoCollections.includes('All')) {
      return collections.filter((c) => c !== 'All');
    }
    return selectedMongoCollections;
  }, [selectedMongoCollections, collections]);

  const effectiveCouchCollections = useMemo(() => {
    if (selectedCouchCollections.includes('All')) {
      return couchCollections.filter((c) => c !== 'All');
    }
    return selectedCouchCollections;
  }, [selectedCouchCollections, couchCollections]);

  // Handle migration process
  const handleMigrate = async () => {
    setError(null);
   
    // Validation
    if (!selectedDatabase) {
      setError('Please select a MongoDB database');
      return;
    }
    if (!effectiveMongoCollections.length) {
      setError('Please select at least one MongoDB collection');
      return;
    }
    if (!selectedBucket) {
      setError('Please select a Couchbase bucket');
      return;
    }
    if (!selectedScope) {
      setError('Please select a Couchbase scope');
      return;
    }
    if (!effectiveCouchCollections.length) {
      setError('Please select at least one Couchbase collection');
      return;
    }

    setMigrationStarted(true);
    setIsMigrating(true);
    setMigrationCompleted(false);
    const tokenHeader = await getAuthHeader();

    try {
      // Process each combination of source and target collections
      for (const mongoCol of effectiveMongoCollections) {
        for (const couchCol of effectiveCouchCollections) {
          const payload = {
            mongoDatabase: selectedDatabase,
            mongoCollection: mongoCol,
            bucketName: selectedBucket,
            scopeName: selectedScope,
            collectionName: couchCol,
          };

          try {
            await axios.post(`${API_BASE}/transfer`, payload, {
              headers: {
                ...tokenHeader,
                'Content-Type': 'application/json',
              },
            });
          } catch (e) {
            console.error(`Failed to migrate: ${mongoCol} → ${couchCol}`, e);
          }
        }
      }
    } finally {
      setIsMigrating(false);
      setMigrationCompleted(true);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="migration-container">
      <div className="migration-header">
        <div className="refresh-info">
          {/* Last refreshed: {lastRefresh.toLocaleTimeString()} */}
          {/* <span className="auto-refresh-note">(Auto-refreshing every 5 seconds)</span> */}
        </div>
      </div>

      <div className="migration-content">
        <div className="database-panels">
          {/* MongoDB Source Panel */}
          <div className="database-panel mongo-panel">
            <div className="panel-header">
              <h2>MongoDB Source</h2>
            </div>
           
            <div className="form-group">
              <label>Database</label>
              <select
                value={selectedDatabase}
                onChange={(e) => setSelectedDatabase(e.target.value)}
                disabled={isLoading || isMigrating}
              >
                {databases.map((db) => (
                  <option key={db} value={db}>{db}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Collections</label>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={mongoSearchTerm}
                  onChange={(e) => setMongoSearchTerm(e.target.value)}
                  disabled={isMigrating}
                />
              </div>
              <div className="collections-list">
                {filteredMongoCollections.map((col) => (
                  <div key={col} className="collection-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedMongoCollections.includes(col)}
                        onChange={() => toggleMongoCollection(col)}
                        disabled={isMigrating}
                      />
                      <span>{col}</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="selection-hint">
                {selectedMongoCollections.includes('All')
                  ? 'All collections selected'
                  : `${selectedMongoCollections.filter(c => c !== 'All').length} selected`}
              </div>
            </div>
          </div>

          {/* Couchbase Target Panel */}
          <div className="database-panel couchbase-panel">
            <div className="panel-header">
              <h2>Couchbase Target</h2>
            </div>
           
            <div className="form-group">
              <label>Bucket</label>
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                disabled={isLoading || isMigrating}
              >
                {buckets.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Scope</label>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                disabled={isLoading || isMigrating}
              >
                {scopes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Collections</label>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={couchSearchTerm}
                  onChange={(e) => setCouchSearchTerm(e.target.value)}
                  disabled={isMigrating}
                />
              </div>
              <div className="collections-list">
                {filteredCouchCollections.map((col) => (
                  <div key={col} className="collection-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCouchCollections.includes(col)}
                        onChange={() => toggleCouchCollection(col)}
                        disabled={isMigrating}
                      />
                      <span>{col}</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="selection-hint">
                {selectedCouchCollections.includes('All')
                  ? 'All collections selected'
                  : `${selectedCouchCollections.filter(c => c !== 'All').length} selected`}
              </div>
            </div>
          </div>
        </div>

        {/* Migration Controls */}
        <div className="migration-controls">
          {error && <div className="error-message">{error}</div>}
         
          <div className="button-row">
            {/* Start Migration Button */}
            <button
              onClick={handleMigrate}
              disabled={isLoading || isMigrating}
              className="migrate-button"
            >
              {isMigrating ? (
                <>
                  <span className="spinner"></span>
                  Migrating...
                </>
              ) : 'Start Migration'}
            </button>

            {/* Migrate Functions Button - Always visible */}
            <button
              className="function-button"
              onClick={() => navigate('/functions', {
                state: {
                  selectedDatabase,
                  selectedBucket,
                  selectedScope
                }
              })}
              disabled={isMigrating}
            >
              Migrate Functions
            </button>
          </div>

          {/* Migration Progress */}
          {migrationStarted && (
            <Migrationwebsocket
              migrations={[
                {
                  source: { database: selectedDatabase, collection: 'All' },
                  target: { bucket: selectedBucket, scope: selectedScope, collection: 'All' }
                }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}