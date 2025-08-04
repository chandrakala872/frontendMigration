// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// // import { useNavigate } from "react-router-dom";
// import './Collection.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const prependAll = (arr) => (Array.isArray(arr) ? ['All', ...arr] : ['All']);
// // const navigate = useNavigate();

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
//   const [migrationLog, setMigrationLog] = useState([]);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

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

//   // Fetch MongoDB databases
//   const fetchDatabases = async () => {
//     try {
//       setIsLoading(true);
//       const headers = await getAuthHeader();
//       const res = await axios.get(`${API_BASE}/databases`, { headers });
//       if (Array.isArray(res.data)) {
//         setDatabases(res.data);
//         if (!selectedDatabase && res.data.length) setSelectedDatabase(res.data[0]);
//       }
//     } catch (e) {
//       setError('Failed to fetch MongoDB databases');
//       console.error(e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch collections for selected database
//   const fetchCollectionsForDB = async (db) => {
//     if (!db) return;
//     try {
//       setIsLoading(true);
//       const headers = await getAuthHeader();
//       const res = await axios.get(
//         `${API_BASE}/databases/${encodeURIComponent(db)}/collections`,
//         { headers }
//       );
//       if (Array.isArray(res.data)) {
//         setCollections(prependAll(res.data));
//         setSelectedMongoCollections(['All']);
//       }
//     } catch (e) {
//       setError('Failed to fetch MongoDB collections');
//       console.error(e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch Couchbase buckets
//   const fetchBuckets = async () => {
//     try {
//       setIsLoading(true);
//       const headers = await getAuthHeader();
//       const res = await axios.get(`${API_BASE}/buckets`, { headers });
//       const bucketList = res.data?.buckets || [];
//       setBuckets(bucketList);
//       if (!selectedBucket && bucketList.length) setSelectedBucket(bucketList[0]);
//     } catch (e) {
//       setError('Failed to fetch Couchbase buckets');
//       console.error(e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch scopes and collections for selected bucket
//   const fetchScopesAndCollections = async (bucket) => {
//     if (!bucket) return;
//     try {
//       setIsLoading(true);
//       const headers = await getAuthHeader();
//       await axios.post(
//         `${API_BASE}/select-bucket`,
//         null,
//         { headers, params: { bucketName: bucket } }
//       );
//       const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//         headers,
//         params: { bucketName: bucket },
//       });
//       if (res.data && typeof res.data === 'object') {
//         const mapping = res.data;
//         const scopeList = Object.keys(mapping);
//         setScopes(scopeList);
//         if (!selectedScope && scopeList.length) setSelectedScope(scopeList[0]);
//         const activeScope = selectedScope || scopeList[0];
//         setCouchCollections(prependAll(mapping[activeScope] || []));
//         setSelectedCouchCollections(['All']);
//       }
//     } catch (e) {
//       setError('Failed to fetch Couchbase scopes/collections');
//       console.error(e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle scope change
//   useEffect(() => {
//     if (!selectedBucket || !selectedScope) return;
//     const update = async () => {
//       try {
//         const headers = await getAuthHeader();
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: selectedBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           setCouchCollections(prependAll(res.data[selectedScope] || []));
//           setSelectedCouchCollections(['All']);
//         }
//       } catch (e) {
//         setError('Failed to update Couchbase collections');
//         console.error(e);
//       }
//     };
//     void update();
//   }, [selectedScope, selectedBucket]);

//   // Initial data fetching
//   useEffect(() => {
//     void fetchDatabases();
//     void fetchBuckets();
//   }, []);

//   // Fetch collections when database changes
//   useEffect(() => {
//     if (selectedDatabase) {
//       void fetchCollectionsForDB(selectedDatabase);
//     }
//   }, [selectedDatabase]);

//   // Fetch scopes and collections when bucket changes
//   useEffect(() => {
//     if (selectedBucket) {
//       void fetchScopesAndCollections(selectedBucket);
//     }
//   }, [selectedBucket, selectedScope]);

//   // Toggle MongoDB collection selection
//   const toggleMongoCollection = (col) => {
//     if (col === 'All') {
//       setSelectedMongoCollections(['All']);
//     } else {
//       setSelectedMongoCollections((prev) => {
//         const withoutAll = prev.filter((c) => c !== 'All');
//         if (withoutAll.includes(col)) {
//           return withoutAll.filter((c) => c !== col);
//         } else {
//           return [...withoutAll, col];
//         }
//       });
//     }
//   };

//   // Toggle Couchbase collection selection
//   const toggleCouchCollection = (col) => {
//     if (col === 'All') {
//       setSelectedCouchCollections(['All']);
//     } else {
//       setSelectedCouchCollections((prev) => {
//         const withoutAll = prev.filter((c) => c !== 'All');
//         if (withoutAll.includes(col)) {
//           return withoutAll.filter((c) => c !== col);
//         } else {
//           return [...withoutAll, col];
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
//     setMigrationLog([]);
    
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

//     setIsMigrating(true);
//     const tokenHeader = await getAuthHeader();
//     const logEntries = [];

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

//           logEntries.push(`Starting migration: ${mongoCol} → ${couchCol}`);
//           setMigrationLog([...logEntries]);

//           try {
//             await axios.post(`${API_BASE}/transfer`, payload, {
//               headers: {
//                 ...tokenHeader,
//                 'Content-Type': 'application/json',
//               },
//             });
//             logEntries.push(`Successfully migrated: ${mongoCol} → ${couchCol}`);
//           } catch (e) {
//             const msg = e.response?.data?.message || e.message;
//             logEntries.push(`Failed to migrate: ${mongoCol} → ${couchCol}: ${msg}`);
//           }
          
//           setMigrationLog([...logEntries]);
//         }
//       }

//       logEntries.push('Migration process completed');
//       setMigrationLog([...logEntries]);
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   return (
//     <div className="migration-container">
//       <div className="migration-header">
//         {/* <h1>Database Migration Tool</h1> */}
//         {/* <p>Transfer data between MongoDB and Couchbase collections</p> */}
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
//                 disabled={isLoading}
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
//                 />
//               </div>
//               <div className="collections-list">
//                 {filteredMongoCollections.map((col) => (
//                   <div key={col} className="collection-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={
//                           selectedMongoCollections.includes('All')
//                             ? col === 'All'
//                             : selectedMongoCollections.includes(col)
//                         }
//                         onChange={() => toggleMongoCollection(col)}
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
//                 disabled={isLoading}
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
//                 disabled={isLoading}
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
//                 />
//               </div>
//               <div className="collections-list">
//                 {filteredCouchCollections.map((col) => (
//                   <div key={col} className="collection-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={
//                           selectedCouchCollections.includes('All')
//                             ? col === 'All'
//                             : selectedCouchCollections.includes(col)
//                         }
//                         onChange={() => toggleCouchCollection(col)}
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
          
//           <button 
//             onClick={handleMigrate} 
//             disabled={isMigrating || isLoading}
//             className="migrate-button"
//           >
//             {isMigrating ? (
//               <>
//                 <span className="spinner"></span>
//                 Migrating...
//               </>
//             ) : 'Start Migration'}
//           </button>
//         </div>

//         {/* Migration Log */}
//         {migrationLog.length > 0 && (
//           <div className="migration-log">
//             <h3>Migration Log</h3>
//             <div className="log-content">
//               {migrationLog.map((line, i) => (
//                 <div key={i} className="log-entry">
//                   {line.includes('Successfully') ? (
//                     <span className="success-icon">✓</span>
//                   ) : line.includes('Failed') ? (
//                     <span className="error-icon">✗</span>
//                   ) : (
//                     <span className="info-icon">ℹ</span>
//                   )}
//                   <span>{line}</span>
//                 </div>
//               ))}
//             </div>
            
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }






import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
 import { useNavigate } from "react-router-dom";
import './Collection.css';

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
  const [migrationLog, setMigrationLog] = useState([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeader = async () => {
    const token = await getAccessTokenSilently();
    return { Authorization: `Bearer ${token}` };
  };

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

  // Fetch MongoDB databases
  const fetchDatabases = async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeader();
      const res = await axios.get(`${API_BASE}/databases`, { headers });
      if (Array.isArray(res.data)) {
        setDatabases(res.data);
        if (!selectedDatabase && res.data.length) setSelectedDatabase(res.data[0]);
      }
    } catch (e) {
      setError('Failed to fetch MongoDB databases');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch collections for selected database
  const fetchCollectionsForDB = async (db) => {
    if (!db) return;
    try {
      setIsLoading(true);
      const headers = await getAuthHeader();
      const res = await axios.get(
        `${API_BASE}/databases/${encodeURIComponent(db)}/collections`,
        { headers }
      );
      if (Array.isArray(res.data)) {
        setCollections(prependAll(res.data));
        setSelectedMongoCollections(['All']);
      }
    } catch (e) {
      setError('Failed to fetch MongoDB collections');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Couchbase buckets
  const fetchBuckets = async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeader();
      const res = await axios.get(`${API_BASE}/buckets`, { headers });
      const bucketList = res.data?.buckets || [];
      setBuckets(bucketList);
      if (!selectedBucket && bucketList.length) setSelectedBucket(bucketList[0]);
    } catch (e) {
      setError('Failed to fetch Couchbase buckets');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch scopes and collections for selected bucket
  const fetchScopesAndCollections = async (bucket) => {
    if (!bucket) return;
    try {
      setIsLoading(true);
      const headers = await getAuthHeader();
      await axios.post(
        `${API_BASE}/select-bucket`,
        null,
        { headers, params: { bucketName: bucket } }
      );
      const res = await axios.get(`${API_BASE}/couchbase-collections`, {
        headers,
        params: { bucketName: bucket },
      });
      if (res.data && typeof res.data === 'object') {
        const mapping = res.data;
        const scopeList = Object.keys(mapping);
        setScopes(scopeList);
        if (!selectedScope && scopeList.length) setSelectedScope(scopeList[0]);
        const activeScope = selectedScope || scopeList[0];
        setCouchCollections(prependAll(mapping[activeScope] || []));
        setSelectedCouchCollections(['All']);
      }
    } catch (e) {
      setError('Failed to fetch Couchbase scopes/collections');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scope change
  useEffect(() => {
    if (!selectedBucket || !selectedScope) return;
    const update = async () => {
      try {
        const headers = await getAuthHeader();
        const res = await axios.get(`${API_BASE}/couchbase-collections`, {
          headers,
          params: { bucketName: selectedBucket },
        });
        if (res.data && typeof res.data === 'object') {
          setCouchCollections(prependAll(res.data[selectedScope] || []));
          setSelectedCouchCollections(['All']);
        }
      } catch (e) {
        setError('Failed to update Couchbase collections');
        console.error(e);
      }
    };
    void update();
  }, [selectedScope, selectedBucket]);

  // Initial data fetching
  useEffect(() => {
    void fetchDatabases();
    void fetchBuckets();
  }, []);

  // Fetch collections when database changes
  useEffect(() => {
    if (selectedDatabase) {
      void fetchCollectionsForDB(selectedDatabase);
    }
  }, [selectedDatabase]);

  // Fetch scopes and collections when bucket changes
  useEffect(() => {
    if (selectedBucket) {
      void fetchScopesAndCollections(selectedBucket);
    }
  }, [selectedBucket, selectedScope]);

  // Toggle MongoDB collection selection
  const toggleMongoCollection = (col) => {
    if (col === 'All') {
      setSelectedMongoCollections(['All']);
    } else {
      setSelectedMongoCollections((prev) => {
        const withoutAll = prev.filter((c) => c !== 'All');
        if (withoutAll.includes(col)) {
          return withoutAll.filter((c) => c !== col);
        } else {
          return [...withoutAll, col];
        }
      });
    }
  };

  // Toggle Couchbase collection selection
  const toggleCouchCollection = (col) => {
    if (col === 'All') {
      setSelectedCouchCollections(['All']);
    } else {
      setSelectedCouchCollections((prev) => {
        const withoutAll = prev.filter((c) => c !== 'All');
        if (withoutAll.includes(col)) {
          return withoutAll.filter((c) => c !== col);
        } else {
          return [...withoutAll, col];
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
    setMigrationLog([]);
    
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

    setIsMigrating(true);
    const tokenHeader = await getAuthHeader();
    const logEntries = [];

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

          logEntries.push(`Starting migration: ${mongoCol} → ${couchCol}`);
          setMigrationLog([...logEntries]);

          try {
            await axios.post(`${API_BASE}/transfer`, payload, {
              headers: {
                ...tokenHeader,
                'Content-Type': 'application/json',
              },
            });
            logEntries.push(`Successfully migrated: ${mongoCol} → ${couchCol}`);
          } catch (e) {
            const msg = e.response?.data?.message || e.message;
            logEntries.push(`Failed to migrate: ${mongoCol} → ${couchCol}: ${msg}`);
          }
          
          setMigrationLog([...logEntries]);
        }
      }

      logEntries.push('Migration process completed');
      setMigrationLog([...logEntries]);
    } finally {
      setIsMigrating(false);
    }
  };

   const navigate = useNavigate();

  return (
    <div className="migration-container">
      <div className="migration-header">
        {/* <h1>Database Migration Tool</h1> */}
        {/* <p>Transfer data between MongoDB and Couchbase collections</p> */}
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
                disabled={isLoading}
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
                />
              </div>
              <div className="collections-list">
                {filteredMongoCollections.map((col) => (
                  <div key={col} className="collection-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          selectedMongoCollections.includes('All')
                            ? col === 'All'
                            : selectedMongoCollections.includes(col)
                        }
                        onChange={() => toggleMongoCollection(col)}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                />
              </div>
              <div className="collections-list">
                {filteredCouchCollections.map((col) => (
                  <div key={col} className="collection-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          selectedCouchCollections.includes('All')
                            ? col === 'All'
                            : selectedCouchCollections.includes(col)
                        }
                        onChange={() => toggleCouchCollection(col)}
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
          
          <button 
            onClick={handleMigrate} 
            disabled={isMigrating || isLoading}
            className="migrate-button"
          >
            {isMigrating ? (
              <>
                <span className="spinner"></span>
                Migrating...
              </>
            ) : 'Start Migration'}
          </button>
        </div>

        {migrationLog.length > 0 && (
  <div className="migration-log">
    <h3>Migration Log</h3>
    <div className="log-content">
      {migrationLog.map((line, i) => (
        <div key={i} className="log-entry">
          {line.includes('Successfully') ? (
            <span className="success-icon">✓</span>
          ) : line.includes('Failed') ? (
            <span className="error-icon">✗</span>
          ) : (
            <span className="info-icon">ℹ</span>
          )}
          <span>{line}</span>
        </div>
      ))}
    </div>
    <button 
      className="function-button"
      onClick={() => navigate('/functions', { 
        state: { 
          selectedDatabase,
          selectedBucket,
          selectedScope 
        } 
      })}
    >
      Migrate Functions
    </button>
  </div>
)}
      </div>
    </div>
  );
}