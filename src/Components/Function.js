// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const API_BASE = 'http://localhost:8080/api/transfer';

// export default function UnifiedFunctionTransfer() {
//   const { getAccessTokenSilently } = useAuth0();

//   // Connection & selection state
//   const [mongoDatabase, setMongoDatabase] = useState('');
//   const [mongoDatabases, setMongoDatabases] = useState([]);
//   const [mongoCollections, setMongoCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState('');

//   const [couchbaseBucket, setCouchbaseBucket] = useState(
//     () => sessionStorage.getItem('couchbaseBucket') || ''
//   );
//   const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
//   const [couchbaseScope, setCouchbaseScope] = useState(
//     () => sessionStorage.getItem('couchbaseScope') || ''
//   );
//   const [couchbaseScopes, setCouchbaseScopes] = useState([]);

//   const [functions, setFunctions] = useState([]);
//   const [selectedFunction, setSelectedFunction] = useState('');
//   const [selectedFunctions, setSelectedFunctions] = useState([]);
//   const [includeSystemFunctions, setIncludeSystemFunctions] = useState(false);
//   const [continueOnError, setContinueOnError] = useState(false);

//   // UI feedback
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   // Utility to get token and set common headers
//   const getAuthHeaders = useCallback(async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   }, [getAccessTokenSilently]);

//   // Persist couchbase selections in sessionStorage
//   useEffect(() => {
//     if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
//   }, [couchbaseBucket]);

//   useEffect(() => {
//     if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
//   }, [couchbaseScope]);

//   // Fetch MongoDB databases
//   const fetchMongoDatabases = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/databases`, { headers });
//       if (Array.isArray(resp.data)) {
//         setMongoDatabases(resp.data);
//       } else {
//         setMongoDatabases([]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch MongoDB databases', err);
//       setErrorMessage('Failed to fetch MongoDB databases.');
//     }
//   }, [getAuthHeaders]);

//   // Fetch collections for selected MongoDB database
//   useEffect(() => {
//     async function doFetchCollections() {
//       if (!mongoDatabase) {
//         setMongoCollections([]);
//         setSelectedCollection('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           setMongoCollections(resp.data);
//           setSelectedCollection(resp.data[0] || '');
//         } else {
//           setMongoCollections([]);
//           setSelectedCollection('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch MongoDB collections', err);
//         setErrorMessage('Failed to fetch MongoDB collections.');
//         setMongoCollections([]);
//       }
//     }
//     doFetchCollections();
//   }, [mongoDatabase, getAuthHeaders]);

//   // Fetch MongoDB functions when database or includeSystemFunctions changes
//   useEffect(() => {
//     async function fetchFunctions() {
//       if (!mongoDatabase) {
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/mongo-functions?database=${encodeURIComponent(
//             mongoDatabase
//           )}&includeSystem=${includeSystemFunctions}`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           const funcNames = resp.data
//             .map((fn) => fn.name || fn._id || '')
//             .filter(Boolean);
//           setFunctions(funcNames);
//           setSelectedFunctions(funcNames);
//           setSelectedFunction(funcNames[0] || '');
//         } else {
//           setFunctions([]);
//           setSelectedFunctions([]);
//           setSelectedFunction('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch functions', err);
//         setErrorMessage(
//           'Failed to fetch functions: ' +
//             (err?.response?.data?.message || err?.message || 'unknown error')
//         );
//         setFunctions([]);
//       }
//     }
//     fetchFunctions();
//   }, [mongoDatabase, includeSystemFunctions, getAuthHeaders]);

//   // Fetch Couchbase buckets
//   const fetchCouchbaseBuckets = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/buckets`, { headers });
//       const bucketList = Array.isArray(resp.data)
//         ? resp.data
//         : Array.isArray(resp.data?.buckets)
//         ? resp.data.buckets
//         : [];
//       setCouchbaseBuckets(bucketList);
//       if (!couchbaseBucket && bucketList.length) {
//         setCouchbaseBucket(bucketList[0]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch Couchbase buckets', err);
//       setErrorMessage('Failed to fetch Couchbase buckets.');
//       setCouchbaseBuckets([]);
//     }
//   }, [getAuthHeaders, couchbaseBucket]);

//   // When bucket changes: select it and then fetch scopes from backend
//   useEffect(() => {
//     async function fetchScopes() {
//       if (!couchbaseBucket) {
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         // Notify backend about bucket selection
//         await axios.post(
//           `${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`,
//           null,
//           { headers }
//         );
//         // Then fetch scopes (via your existing endpoint)
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: couchbaseBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setCouchbaseScopes(scopeList);
//           const resolvedScope = scopeList[0] || '';
//           setCouchbaseScope((prev) => prev || resolvedScope);
//         } else {
//           setCouchbaseScopes([]);
//           setCouchbaseScope('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch Couchbase scopes', err);
//         setErrorMessage('Failed to fetch Couchbase scopes.');
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//       }
//     }
//     fetchScopes();
//   }, [couchbaseBucket, getAuthHeaders]);

//   // Initial load
//   useEffect(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

//   const toggleFunctionSelection = (fnName) => {
//     setSelectedFunctions((prev) =>
//       prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
//     );
//   };

//   const handleTransferAll = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     if (!mongoDatabase || !couchbaseBucket) {
//       setErrorMessage('MongoDB database and Couchbase bucket are required.');
//       return;
//     }
//     if (selectedFunctions.length === 0) {
//       setErrorMessage('Please select at least one function to transfer.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring all selected functions...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         couchbaseBucket,
//         couchbaseScope: couchbaseScope || null,
//         includeSystemFunctions,
//         functionNames: selectedFunctions,
//         continueOnError,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-functions`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'All functions transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer all failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   const handleTransferSingle = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     const cleanedFunction = selectedFunction.trim();
//     if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
//       setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring single function...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         functionName: cleanedFunction,
//         couchbaseScope: couchbaseScope || null,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-function`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'Function transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer single failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   return (
//     <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 900 }}>
//       <h2>Unified Function Transfer</h2>

//       {/* Connection / Metadata Section */}
//       <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>MongoDB</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Database:{' '}
//                 <select
//                   value={mongoDatabase}
//                   onChange={(e) => setMongoDatabase(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select db --</option>
//                   {mongoDatabases.map((db) => (
//                     <option key={db} value={db}>
//                       {db}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchMongoDatabases}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh DBs
//               </button>
//             </div>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Collection:{' '}
//                 <select
//                   value={selectedCollection}
//                   onChange={(e) => setSelectedCollection(e.target.value)}
//                   style={{ width: 220 }}
//                   disabled={mongoCollections.length === 0}
//                 >
//                   <option value="">-- select collection --</option>
//                   {mongoCollections.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={includeSystemFunctions}
//                   onChange={(e) => setIncludeSystemFunctions(e.target.checked)}
//                 />{' '}
//                 Include System Functions
//               </label>
//               <span style={{ marginLeft: 20 }}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={continueOnError}
//                     onChange={(e) => setContinueOnError(e.target.checked)}
//                   />{' '}
//                   Continue on Error
//                 </label>
//               </span>
//             </div>
//           </fieldset>
//         </div>

//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>Couchbase</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Bucket:{' '}
//                 <select
//                   value={couchbaseBucket}
//                   onChange={(e) => setCouchbaseBucket(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select bucket --</option>
//                   {couchbaseBuckets.map((b) => (
//                     <option key={b} value={b}>
//                       {b}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchCouchbaseBuckets}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh Buckets
//               </button>
//             </div>
//             <div>
//               <label>
//                 Scope:{' '}
//                 <select
//                   value={couchbaseScope}
//                   onChange={(e) => setCouchbaseScope(e.target.value)}
//                   style={{ width: 200 }}
//                   disabled={couchbaseScopes.length === 0}
//                 >
//                   <option value="">-- select scope --</option>
//                   {couchbaseScopes.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//           </fieldset>
//         </div>
//       </div>

//       {/* Functions list */}
//       <div
//         style={{
//           marginTop: 20,
//           display: 'flex',
//           gap: 30,
//           flexWrap: 'wrap',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1, minWidth: 300 }}>
//           <div style={{ marginBottom: 6 }}>
//             <strong>Available Functions (from DB):</strong>
//           </div>
//           <div
//             style={{
//               maxHeight: 220,
//               overflowY: 'auto',
//               border: '1px solid #ddd',
//               padding: 8,
//               borderRadius: 4,
//             }}
//           >
//             {functions.length === 0 && <div>No functions loaded.</div>}
//             {functions.map((fnName) => (
//               <div key={fnName}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={selectedFunctions.includes(fnName)}
//                     onChange={() => toggleFunctionSelection(fnName)}
//                   />{' '}
//                   {fnName}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div style={{ minWidth: 260 }}>
//           <div style={{ marginBottom: 6 }}>
//             <label>
//               Single Function:{' '}
//               <select
//                 value={selectedFunction}
//                 onChange={(e) => setSelectedFunction(e.target.value)}
//                 disabled={functions.length === 0}
//                 style={{ width: 200 }}
//               >
//                 <option value="">-- select function --</option>
//                 {functions.map((fn) => (
//                   <option key={fn} value={fn}>
//                     {fn}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>
//           <div>
//             <button
//               onClick={handleTransferSingle}
//               style={{ padding: '8px 14px', cursor: 'pointer', marginRight: 10 }}
//               disabled={!mongoDatabase || !selectedFunction || !couchbaseBucket}
//             >
//               Transfer Single Function
//             </button>
//           </div>
//           <div style={{ marginTop: 12 }}>
//             <button
//               onClick={handleTransferAll}
//               style={{ padding: '8px 14px', cursor: 'pointer' }}
//               disabled={!mongoDatabase || !couchbaseBucket || selectedFunctions.length === 0}
//             >
//               Transfer All Selected Functions
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Status / Errors */}
//       <div style={{ marginTop: 20 }}>
//         {statusMessage && <div style={{ color: 'green', marginBottom: 6 }}>{statusMessage}</div>}
//         {errorMessage && <div style={{ color: 'red', marginBottom: 6 }}>{errorMessage}</div>}
//       </div>
//     </div>
//   );

// }














// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// // import './Function.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// export default function UnifiedFunctionTransfer() {
//   const { getAccessTokenSilently } = useAuth0();

//   // Connection & selection state
//   const [mongoDatabase, setMongoDatabase] = useState('');
//   const [mongoDatabases, setMongoDatabases] = useState([]);
//   const [mongoCollections, setMongoCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState('');

//   const [couchbaseBucket, setCouchbaseBucket] = useState(
//     () => sessionStorage.getItem('couchbaseBucket') || ''
//   );
//   const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
//   const [couchbaseScope, setCouchbaseScope] = useState(
//     () => sessionStorage.getItem('couchbaseScope') || ''
//   );
//   const [couchbaseScopes, setCouchbaseScopes] = useState([]);

//   const [functions, setFunctions] = useState([]);
//   const [selectedFunction, setSelectedFunction] = useState('');
//   const [selectedFunctions, setSelectedFunctions] = useState([]);
//   const [includeSystemFunctions, setIncludeSystemFunctions] = useState(false);
//   const [continueOnError, setContinueOnError] = useState(false);

//   // UI feedback
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   // Utility to get token and set common headers
//   const getAuthHeaders = useCallback(async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   }, [getAccessTokenSilently]);

//   // Persist couchbase selections in sessionStorage
//   useEffect(() => {
//     if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
//   }, [couchbaseBucket]);

//   useEffect(() => {
//     if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
//   }, [couchbaseScope]);

//   // Fetch MongoDB databases
//   const fetchMongoDatabases = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/databases`, { headers });
//       if (Array.isArray(resp.data)) {
//         setMongoDatabases(resp.data);
//       } else {
//         setMongoDatabases([]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch MongoDB databases', err);
//       setErrorMessage('Failed to fetch MongoDB databases.');
//     }
//   }, [getAuthHeaders]);

//   // Fetch collections for selected MongoDB database
//   useEffect(() => {
//     async function doFetchCollections() {
//       if (!mongoDatabase) {
//         setMongoCollections([]);
//         setSelectedCollection('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           setMongoCollections(resp.data);
//           setSelectedCollection(resp.data[0] || '');
//         } else {
//           setMongoCollections([]);
//           setSelectedCollection('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch MongoDB collections', err);
//         setErrorMessage('Failed to fetch MongoDB collections.');
//         setMongoCollections([]);
//       }
//     }
//     doFetchCollections();
//   }, [mongoDatabase, getAuthHeaders]);

//   // Fetch MongoDB functions when database or includeSystemFunctions changes
//   useEffect(() => {
//     async function fetchFunctions() {
//       if (!mongoDatabase) {
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/mongo-functions?database=${encodeURIComponent(
//             mongoDatabase
//           )}&includeSystem=${includeSystemFunctions}`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           const funcNames = resp.data
//             .map((fn) => fn.name || fn._id || '')
//             .filter(Boolean);
//           setFunctions(funcNames);
//           setSelectedFunctions(funcNames);
//           setSelectedFunction(funcNames[0] || '');
//         } else {
//           setFunctions([]);
//           setSelectedFunctions([]);
//           setSelectedFunction('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch functions', err);
//         setErrorMessage(
//           'Failed to fetch functions: ' +
//             (err?.response?.data?.message || err?.message || 'unknown error')
//         );
//         setFunctions([]);
//       }
//     }
//     fetchFunctions();
//   }, [mongoDatabase, includeSystemFunctions, getAuthHeaders]);

//   // Fetch Couchbase buckets
//   const fetchCouchbaseBuckets = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/buckets`, { headers });
//       const bucketList = Array.isArray(resp.data)
//         ? resp.data
//         : Array.isArray(resp.data?.buckets)
//         ? resp.data.buckets
//         : [];
//       setCouchbaseBuckets(bucketList);
//       if (!couchbaseBucket && bucketList.length) {
//         setCouchbaseBucket(bucketList[0]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch Couchbase buckets', err);
//       setErrorMessage('Failed to fetch Couchbase buckets.');
//       setCouchbaseBuckets([]);
//     }
//   }, [getAuthHeaders, couchbaseBucket]);

//   // When bucket changes: select it and then fetch scopes from backend
//   useEffect(() => {
//     async function fetchScopes() {
//       if (!couchbaseBucket) {
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         // Notify backend about bucket selection
//         await axios.post(
//           `${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`,
//           null,
//           { headers }
//         );
//         // Then fetch scopes (via your existing endpoint)
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: couchbaseBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setCouchbaseScopes(scopeList);
//           const resolvedScope = scopeList[0] || '';
//           setCouchbaseScope((prev) => prev || resolvedScope);
//         } else {
//           setCouchbaseScopes([]);
//           setCouchbaseScope('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch Couchbase scopes', err);
//         setErrorMessage('Failed to fetch Couchbase scopes.');
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//       }
//     }
//     fetchScopes();
//   }, [couchbaseBucket, getAuthHeaders]);

//   // Initial load
//   useEffect(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

//   const toggleFunctionSelection = (fnName) => {
//     setSelectedFunctions((prev) =>
//       prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
//     );
//   };

//   const handleTransferAll = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     if (!mongoDatabase || !couchbaseBucket) {
//       setErrorMessage('MongoDB database and Couchbase bucket are required.');
//       return;
//     }
//     if (selectedFunctions.length === 0) {
//       setErrorMessage('Please select at least one function to transfer.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring all selected functions...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         couchbaseBucket,
//         couchbaseScope: couchbaseScope || null,
//         includeSystemFunctions,
//         functionNames: selectedFunctions,
//         continueOnError,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-functions`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'All functions transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer all failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   const handleTransferSingle = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     const cleanedFunction = selectedFunction.trim();
//     if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
//       setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring single function...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         functionName: cleanedFunction,
//         couchbaseScope: couchbaseScope || null,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-function`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'Function transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer single failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   return (
//     <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 900 }}>
//       {/* <h2>Unified Function Transfer</h2> */}

//       {/* Connection / Metadata Section */}
//       <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>MongoDB</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Database:{' '}
//                 <select
//                   value={mongoDatabase}
//                   onChange={(e) => setMongoDatabase(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select db --</option>
//                   {mongoDatabases.map((db) => (
//                     <option key={db} value={db}>
//                       {db}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchMongoDatabases}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh DBs
//               </button>
//             </div>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Collection:{' '}
//                 <select
//                   value={selectedCollection}
//                   onChange={(e) => setSelectedCollection(e.target.value)}
//                   style={{ width: 220 }}
//                   disabled={mongoCollections.length === 0}
//                 >
//                   <option value="">-- select collection --</option>
//                   {mongoCollections.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={includeSystemFunctions}
//                   onChange={(e) => setIncludeSystemFunctions(e.target.checked)}
//                 />{' '}
//                 Include System Functions
//               </label>
//               <span style={{ marginLeft: 20 }}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={continueOnError}
//                     onChange={(e) => setContinueOnError(e.target.checked)}
//                   />{' '}
//                   Continue on Error
//                 </label>
//               </span>
//             </div>
//           </fieldset>
//         </div>

//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>Couchbase</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Bucket:{' '}
//                 <select
//                   value={couchbaseBucket}
//                   onChange={(e) => setCouchbaseBucket(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select bucket --</option>
//                   {couchbaseBuckets.map((b) => (
//                     <option key={b} value={b}>
//                       {b}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchCouchbaseBuckets}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh Buckets
//               </button>
//             </div>
//             <div>
//               <label>
//                 Scope:{' '}
//                 <select
//                   value={couchbaseScope}
//                   onChange={(e) => setCouchbaseScope(e.target.value)}
//                   style={{ width: 200 }}
//                   disabled={couchbaseScopes.length === 0}
//                 >
//                   <option value="">-- select scope --</option>
//                   {couchbaseScopes.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//           </fieldset>
//         </div>
//       </div>

//       {/* Functions list */}
//       <div
//         style={{
//           marginTop: 20,
//           display: 'flex',
//           gap: 30,
//           flexWrap: 'wrap',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1, minWidth: 300 }}>
//           <div style={{ marginBottom: 6 }}>
//             <strong>Available Functions (from DB):</strong>
//           </div>
//           <div
//             style={{
//               maxHeight: 220,
//               overflowY: 'auto',
//               border: '1px solid #ddd',
//               padding: 8,
//               borderRadius: 4,
//             }}
//           >
//             {functions.length === 0 && <div>No functions loaded.</div>}
//             {functions.map((fnName) => (
//               <div key={fnName}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={selectedFunctions.includes(fnName)}
//                     onChange={() => toggleFunctionSelection(fnName)}
//                   />{' '}
//                   {fnName}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div style={{ minWidth: 260 }}>
//           <div style={{ marginBottom: 6 }}>
//             <label>
//               Single Function:{' '}
//               <select
//                 value={selectedFunction}
//                 onChange={(e) => setSelectedFunction(e.target.value)}
//                 disabled={functions.length === 0}
//                 style={{ width: 200 }}
//               >
//                 <option value="">-- select function --</option>
//                 {functions.map((fn) => (
//                   <option key={fn} value={fn}>
//                     {fn}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>
//           <div>
//             <button
//               onClick={handleTransferSingle}
//               style={{ padding: '8px 14px', cursor: 'pointer', marginRight: 10 }}
//               disabled={!mongoDatabase || !selectedFunction || !couchbaseBucket}
//             >
//               Transfer Single Function
//             </button>
//           </div>
//           <div style={{ marginTop: 12 }}>
//             <button
//               onClick={handleTransferAll}
//               style={{ padding: '8px 14px', cursor: 'pointer' }}
//               disabled={!mongoDatabase || !couchbaseBucket || selectedFunctions.length === 0}
//             >
//               Transfer All Selected Functions
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Status / Errors */}
//       <div style={{ marginTop: 20 }}>
//         {statusMessage && <div style={{ color: 'green', marginBottom: 6 }}>{statusMessage}</div>}
//         {errorMessage && <div style={{ color: 'red', marginBottom: 6 }}>{errorMessage}</div>}
//       </div>
//     </div>
//   );
// }





// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Function.css';
// import FunctionProgressbar from './FunctionProgressbar';


// const API_BASE = 'http://localhost:8080/api/transfer';

// export default function UnifiedFunctionTransfer() {
//   const { getAccessTokenSilently } = useAuth0();

//   // Connection & selection state
//   const [selectedBucket, setSelectedBucket] = useState('');
// // const [setScopes] = useState([]);
// // const [setCollections] = useState([]);
// const [selectedDatabase, setSelectedDatabase] = useState('');
// const [scopes, setScopes] = useState([]);
// const [collections, setCollections] = useState([]);
// // const [selectedDatabase, setSelectedDatabase] = useState('');
// // const [selectedCollection, setSelectedCollection] = useState('');
// const [availableFunctions, setAvailableFunctions] = useState([]);



//   const [mongoDatabase, setMongoDatabase] = useState('');
//   const [mongoDatabases, setMongoDatabases] = useState([]);
//   const [mongoCollections, setMongoCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState('');
//   const [selectedScope, setSelectedScope] = useState('');


//   const [couchbaseBucket, setCouchbaseBucket] = useState(
//     () => sessionStorage.getItem('couchbaseBucket') || ''
//   );
//   const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
//   const [couchbaseScope, setCouchbaseScope] = useState(
//     () => sessionStorage.getItem('couchbaseScope') || ''
//   );
//   const [couchbaseScopes, setCouchbaseScopes] = useState([]);

//   const [functions, setFunctions] = useState([]);
//   const [selectedFunction, setSelectedFunction] = useState('');
//   const [selectedFunctions, setSelectedFunctions] = useState([]);

//   // UI feedback
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [loading, setLoading] = useState({
//     mongoDBs: false,
//     mongoColls: false,
//     mongoFuncs: false,
//     cbBuckets: false,
//     cbScopes: false,
//     transferSingle: false,
//     transferAll: false,
//   });

//   // Set up axios instance with auth header injection
//   const axiosInstance = useCallback(async () => {
//     const token = await getAccessTokenSilently();
//     const instance = axios.create();
//     instance.defaults.headers.common.Authorization = `Bearer ${token}`;
//     return instance;
//   }, [getAccessTokenSilently]);
//   const fetchScopes = async () => {
//   try {
//     const token = await getAccessTokenSilently();
//     const response = await axios.get(`${API_BASE}/scopes?bucketName=${selectedBucket}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     setScopes(response.data);
//     console.log('Fetched scopes:', response.data);
//   } catch (error) {
//     console.error('Error fetching scopes:', error);
//   }
// };
// const doFetchCollections = async () => {
//   try {
//     const token = await getAccessTokenSilently();
//     const response = await axios.get(`${API_BASE}/collections?bucketName=${selectedBucket}&scopeName=${selectedScope}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     setCollections(response.data);
//     console.log('Fetched collections:', response.data);
//   } catch (error) {
//     console.error('Error fetching collections:', error);
//   }
// };
// const fetchFunctions = async () => {
//   try {
//     const token = await getAccessTokenSilently();
//     const response = await axios.get(`${API_BASE}/mongo-functions?database=${selectedDatabase}&collection=${selectedCollection}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     setFunctions(response.data); // Adjust according to your state
//     console.log('Fetched functions:', response.data);
//   } catch (error) {
//     console.error('Error fetching functions:', error);
//   }
// };



//   // Persist couchbase selections


//   useEffect(() => {
//   const fetchFunctions = async () => {
//     if (selectedDatabase && selectedCollection) {
//       try {
//         const token = await getAccessTokenSilently();
//         const res = await axios.get(
//           `${API_BASE}/functions?database=${selectedDatabase}&collection=${selectedCollection}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setAvailableFunctions(res.data); // Update UI without reload
//       } catch (error) {
//         console.error('Failed to fetch functions:', error);
//       }
//     }
//   };

//   fetchFunctions(); // Auto-triggered
// }, [selectedDatabase, selectedCollection]); // Runs only when selection changes


//   useEffect(() => {
//   if (selectedScope) {
//     doFetchCollections();
//   }
// }, [selectedScope]);

// useEffect(() => {
//   if (selectedCollection) {
//     fetchFunctions();
//   }
// }, [selectedCollection]);

//   useEffect(() => {
//     if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
//   }, [couchbaseBucket]);

//   useEffect(() => {
//     if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
//   }, [couchbaseScope]);

//   // Fetch MongoDB databases
//   const fetchMongoDatabases = useCallback(async () => {
//     setErrorMessage(null);
//     setLoading((l) => ({ ...l, mongoDBs: true }));
//     try {
//       const ax = await axiosInstance();
//       const resp = await ax.get(`${API_BASE}/databases`);
//       if (Array.isArray(resp.data)) {
//         setMongoDatabases(resp.data);
//       } else {
//         setMongoDatabases([]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch MongoDB databases', err);
//       setErrorMessage('Failed to fetch MongoDB databases.');
//       setMongoDatabases([]);
//     } finally {
//       setLoading((l) => ({ ...l, mongoDBs: false }));
//     }
//   }, [axiosInstance]);

//   // Fetch MongoDB collections when database changes
//   useEffect(() => {
//     async function doFetchCollections() {
//       setErrorMessage(null);
//       setLoading((l) => ({ ...l, mongoColls: true }));
//       if (!mongoDatabase) {
//         setMongoCollections([]);
//         setSelectedCollection('');
//         setLoading((l) => ({ ...l, mongoColls: false }));
//         return;
//       }
//       try {
//         const ax = await axiosInstance();
//         const resp = await ax.get(
//           `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`
//         );
//         if (Array.isArray(resp.data)) {
//           setMongoCollections(resp.data);
//           setSelectedCollection((prev) => (prev && resp.data.includes(prev) ? prev : resp.data[0] || ''));
//         } else {
//           setMongoCollections([]);
//           setSelectedCollection('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch MongoDB collections', err);
//         setErrorMessage('Failed to fetch MongoDB collections.');
//         setMongoCollections([]);
//         setSelectedCollection('');
//       } finally {
//         setLoading((l) => ({ ...l, mongoColls: false }));
//       }
//     }
//     doFetchCollections();
//   }, [mongoDatabase, axiosInstance]);

//   // Fetch MongoDB functions when database changes
//   useEffect(() => {
//     async function fetchFunctions() {
//       setErrorMessage(null);
//       setLoading((l) => ({ ...l, mongoFuncs: true }));
//       if (!mongoDatabase) {
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//         setLoading((l) => ({ ...l, mongoFuncs: false }));
//         return;
//       }
//       try {
//         const ax = await axiosInstance();
//         const resp = await ax.get(
//           `${API_BASE}/mongo-functions?database=${encodeURIComponent(mongoDatabase)}`
//         );
//         if (Array.isArray(resp.data)) {
//           const funcNames = resp.data
//             .map((fn) => fn.name || fn._id || '')
//             .filter(Boolean);
//           setFunctions(funcNames);
//           setSelectedFunction(funcNames[0] || '');
//           setSelectedFunctions(funcNames.slice()); // default select all
//         } else {
//           setFunctions([]);
//           setSelectedFunction('');
//           setSelectedFunctions([]);
//         }
//       } catch (err) {
//         console.warn('Failed to fetch functions', err);
//         setErrorMessage(
//           'Failed to fetch functions: ' +
//             (err?.response?.data?.message || err?.message || 'unknown error')
//         );
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//       } finally {
//         setLoading((l) => ({ ...l, mongoFuncs: false }));
//       }
//     }
//     fetchFunctions();
//   }, [mongoDatabase, axiosInstance]);

//   // Fetch Couchbase buckets
//   const fetchCouchbaseBuckets = useCallback(async () => {
//     setErrorMessage(null);
//     setLoading((l) => ({ ...l, cbBuckets: true }));
//     try {
//       const ax = await axiosInstance();
//       const resp = await ax.get(`${API_BASE}/buckets`);
//       const bucketList = Array.isArray(resp.data)
//         ? resp.data
//         : Array.isArray(resp.data?.buckets)
//         ? resp.data.buckets
//         : [];
//       setCouchbaseBuckets(bucketList);
//       if (!couchbaseBucket && bucketList.length) {
//         setCouchbaseBucket(bucketList[0]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch Couchbase buckets', err);
//       setErrorMessage('Failed to fetch Couchbase buckets.');
//       setCouchbaseBuckets([]);
//     } finally {
//       setLoading((l) => ({ ...l, cbBuckets: false }));
//     }
//   }, [axiosInstance, couchbaseBucket]);

//   // When bucket changes: select it and fetch scopes
//   useEffect(() => {
//     async function fetchScopes() {
//       setErrorMessage(null);
//       setLoading((l) => ({ ...l, cbScopes: true }));
//       if (!couchbaseBucket) {
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//         setLoading((l) => ({ ...l, cbScopes: false }));
//         return;
//       }
//       try {
//         const ax = await axiosInstance();
//         // Notify backend about bucket selection
//         await ax.post(`${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`, null);
//         // Then fetch scopes / collections mapping
//         const res = await ax.get(`${API_BASE}/couchbase-collections`, {
//           params: { bucketName: couchbaseBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setCouchbaseScopes(scopeList);
//           const resolvedScope = scopeList[0] || '';
//           setCouchbaseScope((prev) => (prev || resolvedScope));
//         } else {
//           setCouchbaseScopes([]);
//           setCouchbaseScope('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch Couchbase scopes', err);
//         setErrorMessage('Failed to fetch Couchbase scopes.');
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//       } finally {
//         setLoading((l) => ({ ...l, cbScopes: false }));
//       }
//     }
//     fetchScopes();
//   }, [couchbaseBucket, axiosInstance]);

//   // Initial load
//   useEffect(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

//   const toggleFunctionSelection = (fnName) => {
//     setSelectedFunctions((prev) =>
//       prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
//     );
//   };

//   useEffect(() => {
//   const interval = setInterval(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, 5000); // Refresh every 10 seconds

//   return () => clearInterval(interval); // Clean up
// }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

// useEffect(() => {
//   if (mongoDatabase) {
//     // Already defined as doFetchCollections
//     doFetchCollections();
//   }
// }, [mongoDatabase, mongoDatabases]); // 👈 add mongoDatabases dependency

// useEffect(() => {
//   if (mongoDatabase) {
//     fetchFunctions();
//   }
// }, [mongoDatabase, mongoDatabases]); // 👈 add mongoDatabases dependency

// useEffect(() => {
//   if (couchbaseBucket) {
//     fetchScopes();
//   }
// }, [couchbaseBucket, couchbaseBuckets]); // 👈 include couchbaseBuckets



//   const handleTransferAll = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     if (!mongoDatabase || !couchbaseBucket) {
//       setErrorMessage('MongoDB database and Couchbase bucket are required.');
//       return;
//     }
//     if (selectedFunctions.length === 0) {
//       setErrorMessage('Please select at least one function to transfer.');
//       return;
//     }
//     try {
//       setLoading((l) => ({ ...l, transferAll: true }));
//       setStatusMessage('Transferring all selected functions...');
//       const ax = await axiosInstance();
//       const payload = {
//         mongoDatabase,
//         couchbaseBucket,
//         couchbaseScope: couchbaseScope || null,
//         functionNames: selectedFunctions,
//       };
//       const resp = await ax.post(`${API_BASE}/transfer-functions`, payload);
//       setStatusMessage(resp.data || 'All functions transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer all failed', err);
//       setErrorMessage(
//         (err?.response?.data?.message || err?.message) || 'Transfer failed'
//       );
//     } finally {
//       setLoading((l) => ({ ...l, transferAll: false }));
//     }
//   };

 


//   const handleTransferSingle = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     const cleanedFunction = (selectedFunction || '').trim();
//     if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
//       setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
//       return;
//     }
//     try {
//       setLoading((l) => ({ ...l, transferSingle: true }));
//       setStatusMessage('Transferring single function...');
//       const ax = await axiosInstance();
//       const payload = {
//         mongoDatabase,
//         functionName: cleanedFunction,
//         couchbaseScope: couchbaseScope || null,
//       };
//       const resp = await ax.post(`${API_BASE}/transfer-function`, payload);
//       setStatusMessage(resp.data || 'Function transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer single failed', err);
//       setErrorMessage(
//         (err?.response?.data?.message || err?.message) || 'Transfer failed'
//       );
//     } finally {
//       setLoading((l) => ({ ...l, transferSingle: false }));
//     }
//   };

//   return (
//     <div className="function-transfer-container">
//       <div className="database-panels-container">
//         {/* MongoDB Panel */}
//         <div className="database-panel mongo-panel">
//           <div className="panel-header">
//             <h3>MongoDB Source</h3>
//           </div>

//           <div className="form-group">
//             <label>Database</label>
//             <div className="select-row">
//               <select
//                 value={mongoDatabase}
//                 onChange={(e) => setMongoDatabase(e.target.value)}
//                 disabled={loading.mongoDBs}
//               >
//                 <option value="">-- Select database --</option>
//                 {mongoDatabases.map((db) => (
//                   <option key={db} value={db}>
//                     {db}
//                   </option>
//                 ))}
//               </select>
//               {/* <button onClick={fetchMongoDatabases} disabled={loading.mongoDBs}>
//                 {loading.mongoDBs ? 'Refreshing...' : 'Refresh DBs'}
//               </button> */}
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Collection</label>
//             <select
//               value={selectedCollection}
//               onChange={(e) => setSelectedCollection(e.target.value)}
//               disabled={mongoCollections.length === 0 || loading.mongoColls}
//             >
//               <option value="">-- Select collection --</option>
//               {mongoCollections.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Couchbase Panel */}
//         <div className="database-panel couchbase-panel">
//           <div className="panel-header">
//             <h3>Couchbase Target</h3>
//           </div>

//           <div className="form-group">
//             <label>Bucket</label>
//             <div className="select-row">
//               <select
//                 value={couchbaseBucket}
//                 onChange={(e) => setCouchbaseBucket(e.target.value)}
//                 disabled={loading.cbBuckets}
//               >
//                 <option value="">-- Select bucket --</option>
//                 {couchbaseBuckets.map((b) => (
//                   <option key={b} value={b}>
//                     {b}
//                   </option>
//                 ))}
//               </select>
//               {/* <button onClick={fetchCouchbaseBuckets} disabled={loading.cbBuckets}>
//                 {loading.cbBuckets ? 'Refreshing...' : 'Refresh Buckets'}
//               </button> */}
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Scope</label>
//             <select
//               value={couchbaseScope}
//               onChange={(e) => setCouchbaseScope(e.target.value)}
//               disabled={couchbaseScopes.length === 0 || loading.cbScopes}
//             >
//               <option value="">-- Select scope --</option>
//               {couchbaseScopes.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Functions Section */}
//       <div className="functions-section">
//         <div className="functions-list-container">
//           <h3>Available Functions</h3>
//           <div className="functions-list">
//             {functions.length === 0 ? (
//               <div className="no-functions">No functions found</div>
//             ) : (
//               <>
//                 <div className="select-all-functions">
//                   <label>
//                     <input
//                       type="checkbox"
//                       checked={selectedFunctions.length === functions.length}
//                       onChange={() => {
//                         if (selectedFunctions.length === functions.length) {
//                           setSelectedFunctions([]);
//                         } else {
//                           setSelectedFunctions([...functions]);
//                         }
//                       }}
//                     />
//                     All Functions
//                   </label>
//                 </div>
//                 {functions.map((fnName) => (
//                   <div key={fnName} className="function-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={selectedFunctions.includes(fnName)}
//                         onChange={() => toggleFunctionSelection(fnName)}
//                       />
//                       {fnName}
//                     </label>
//                   </div>
//                 ))}
//               </>
//             )}
//           </div>
//         </div>

//         <div className="transfer-actions">
//           <div className="single-transfer">
//             <label>Transfer Single Function</label>
//             <div className="single-transfer-row">
//               <select
//                 value={selectedFunction}
//                 onChange={(e) => setSelectedFunction(e.target.value)}
//                 disabled={functions.length === 0}
//               >
//                 <option value="">-- Select function --</option>
//                 {functions.map((fn) => (
//                   <option key={fn} value={fn}>
//                     {fn}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 className="transfer-button secondary"
//                 onClick={handleTransferSingle}
//                 disabled={
//                   !mongoDatabase || !selectedFunction || !couchbaseBucket || loading.transferSingle
//                 }
//               >
//                 {loading.transferSingle ? 'Transferring...' : 'Transfer Single'}
//               </button>
//             </div>
//           </div>

//           <div className="bulk-transfer">
//             <button
//               className="transfer-button primary"
//               onClick={handleTransferAll}
//               disabled={
//                 !mongoDatabase ||
//                 !couchbaseBucket ||
//                 selectedFunctions.length === 0 ||
//                 loading.transferAll
//               }
//             >
//               {loading.transferAll
//                 ? `Transferring (${selectedFunctions.length})...`
//                 : `Transfer All Selected (${selectedFunctions.length})`}
//                 <FunctionProgressbar/>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Status Messages */}
//       <div className="status-messages">
//         {statusMessage && <div className="status-message success">{statusMessage}</div>}
//         {errorMessage && <div className="status-message error">{errorMessage}</div>}
//       </div>
//     </div>
//   );
// }


// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const API_BASE = 'http://localhost:8080/api/transfer';

// export default function UnifiedFunctionTransfer() {
//   const { getAccessTokenSilently } = useAuth0();

//   // Connection & selection state
//   const [mongoDatabase, setMongoDatabase] = useState('');
//   const [mongoDatabases, setMongoDatabases] = useState([]);
//   const [mongoCollections, setMongoCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState('');

//   const [couchbaseBucket, setCouchbaseBucket] = useState(
//     () => sessionStorage.getItem('couchbaseBucket') || ''
//   );
//   const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
//   const [couchbaseScope, setCouchbaseScope] = useState(
//     () => sessionStorage.getItem('couchbaseScope') || ''
//   );
//   const [couchbaseScopes, setCouchbaseScopes] = useState([]);

//   const [functions, setFunctions] = useState([]);
//   const [selectedFunction, setSelectedFunction] = useState('');
//   const [selectedFunctions, setSelectedFunctions] = useState([]);
//   const [includeSystemFunctions, setIncludeSystemFunctions] = useState(false);
//   const [continueOnError, setContinueOnError] = useState(false);

//   // UI feedback
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   // Utility to get token and set common headers
//   const getAuthHeaders = useCallback(async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   }, [getAccessTokenSilently]);

//   // Persist couchbase selections in sessionStorage
//   useEffect(() => {
//     if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
//   }, [couchbaseBucket]);

//   useEffect(() => {
//     if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
//   }, [couchbaseScope]);

//   // Fetch MongoDB databases
//   const fetchMongoDatabases = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/databases`, { headers });
//       if (Array.isArray(resp.data)) {
//         setMongoDatabases(resp.data);
//       } else {
//         setMongoDatabases([]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch MongoDB databases', err);
//       setErrorMessage('Failed to fetch MongoDB databases.');
//     }
//   }, [getAuthHeaders]);

//   // Fetch collections for selected MongoDB database
//   useEffect(() => {
//     async function doFetchCollections() {
//       if (!mongoDatabase) {
//         setMongoCollections([]);
//         setSelectedCollection('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           setMongoCollections(resp.data);
//           setSelectedCollection(resp.data[0] || '');
//         } else {
//           setMongoCollections([]);
//           setSelectedCollection('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch MongoDB collections', err);
//         setErrorMessage('Failed to fetch MongoDB collections.');
//         setMongoCollections([]);
//       }
//     }
//     doFetchCollections();
//   }, [mongoDatabase, getAuthHeaders]);

//   // Fetch MongoDB functions when database or includeSystemFunctions changes
//   useEffect(() => {
//     async function fetchFunctions() {
//       if (!mongoDatabase) {
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/mongo-functions?database=${encodeURIComponent(
//             mongoDatabase
//           )}&includeSystem=${includeSystemFunctions}`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           const funcNames = resp.data
//             .map((fn) => fn.name || fn._id || '')
//             .filter(Boolean);
//           setFunctions(funcNames);
//           setSelectedFunctions(funcNames);
//           setSelectedFunction(funcNames[0] || '');
//         } else {
//           setFunctions([]);
//           setSelectedFunctions([]);
//           setSelectedFunction('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch functions', err);
//         setErrorMessage(
//           'Failed to fetch functions: ' +
//             (err?.response?.data?.message || err?.message || 'unknown error')
//         );
//         setFunctions([]);
//       }
//     }
//     fetchFunctions();
//   }, [mongoDatabase, includeSystemFunctions, getAuthHeaders]);

//   // Fetch Couchbase buckets
//   const fetchCouchbaseBuckets = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/buckets`, { headers });
//       const bucketList = Array.isArray(resp.data)
//         ? resp.data
//         : Array.isArray(resp.data?.buckets)
//         ? resp.data.buckets
//         : [];
//       setCouchbaseBuckets(bucketList);
//       if (!couchbaseBucket && bucketList.length) {
//         setCouchbaseBucket(bucketList[0]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch Couchbase buckets', err);
//       setErrorMessage('Failed to fetch Couchbase buckets.');
//       setCouchbaseBuckets([]);
//     }
//   }, [getAuthHeaders, couchbaseBucket]);

//   // When bucket changes: select it and then fetch scopes from backend
//   useEffect(() => {
//     async function fetchScopes() {
//       if (!couchbaseBucket) {
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         // Notify backend about bucket selection
//         await axios.post(
//           `${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`,
//           null,
//           { headers }
//         );
//         // Then fetch scopes (via your existing endpoint)
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: couchbaseBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setCouchbaseScopes(scopeList);
//           const resolvedScope = scopeList[0] || '';
//           setCouchbaseScope((prev) => prev || resolvedScope);
//         } else {
//           setCouchbaseScopes([]);
//           setCouchbaseScope('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch Couchbase scopes', err);
//         setErrorMessage('Failed to fetch Couchbase scopes.');
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//       }
//     }
//     fetchScopes();
//   }, [couchbaseBucket, getAuthHeaders]);

//   // Initial load
//   useEffect(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

//   const toggleFunctionSelection = (fnName) => {
//     setSelectedFunctions((prev) =>
//       prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
//     );
//   };

//   const handleTransferAll = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     if (!mongoDatabase || !couchbaseBucket) {
//       setErrorMessage('MongoDB database and Couchbase bucket are required.');
//       return;
//     }
//     if (selectedFunctions.length === 0) {
//       setErrorMessage('Please select at least one function to transfer.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring all selected functions...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         couchbaseBucket,
//         couchbaseScope: couchbaseScope || null,
//         includeSystemFunctions,
//         functionNames: selectedFunctions,
//         continueOnError,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-functions`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'All functions transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer all failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   const handleTransferSingle = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     const cleanedFunction = selectedFunction.trim();
//     if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
//       setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring single function...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         functionName: cleanedFunction,
//         couchbaseScope: couchbaseScope || null,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-function`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'Function transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer single failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   return (
//     <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 900 }}>
//       <h2>Unified Function Transfer</h2>

//       {/* Connection / Metadata Section */}
//       <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>MongoDB</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Database:{' '}
//                 <select
//                   value={mongoDatabase}
//                   onChange={(e) => setMongoDatabase(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select db --</option>
//                   {mongoDatabases.map((db) => (
//                     <option key={db} value={db}>
//                       {db}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchMongoDatabases}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh DBs
//               </button>
//             </div>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Collection:{' '}
//                 <select
//                   value={selectedCollection}
//                   onChange={(e) => setSelectedCollection(e.target.value)}
//                   style={{ width: 220 }}
//                   disabled={mongoCollections.length === 0}
//                 >
//                   <option value="">-- select collection --</option>
//                   {mongoCollections.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={includeSystemFunctions}
//                   onChange={(e) => setIncludeSystemFunctions(e.target.checked)}
//                 />{' '}
//                 Include System Functions
//               </label>
//               <span style={{ marginLeft: 20 }}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={continueOnError}
//                     onChange={(e) => setContinueOnError(e.target.checked)}
//                   />{' '}
//                   Continue on Error
//                 </label>
//               </span>
//             </div>
//           </fieldset>
//         </div>

//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>Couchbase</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Bucket:{' '}
//                 <select
//                   value={couchbaseBucket}
//                   onChange={(e) => setCouchbaseBucket(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select bucket --</option>
//                   {couchbaseBuckets.map((b) => (
//                     <option key={b} value={b}>
//                       {b}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchCouchbaseBuckets}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh Buckets
//               </button>
//             </div>
//             <div>
//               <label>
//                 Scope:{' '}
//                 <select
//                   value={couchbaseScope}
//                   onChange={(e) => setCouchbaseScope(e.target.value)}
//                   style={{ width: 200 }}
//                   disabled={couchbaseScopes.length === 0}
//                 >
//                   <option value="">-- select scope --</option>
//                   {couchbaseScopes.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//           </fieldset>
//         </div>
//       </div>

//       {/* Functions list */}
//       <div
//         style={{
//           marginTop: 20,
//           display: 'flex',
//           gap: 30,
//           flexWrap: 'wrap',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1, minWidth: 300 }}>
//           <div style={{ marginBottom: 6 }}>
//             <strong>Available Functions (from DB):</strong>
//           </div>
//           <div
//             style={{
//               maxHeight: 220,
//               overflowY: 'auto',
//               border: '1px solid #ddd',
//               padding: 8,
//               borderRadius: 4,
//             }}
//           >
//             {functions.length === 0 && <div>No functions loaded.</div>}
//             {functions.map((fnName) => (
//               <div key={fnName}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={selectedFunctions.includes(fnName)}
//                     onChange={() => toggleFunctionSelection(fnName)}
//                   />{' '}
//                   {fnName}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div style={{ minWidth: 260 }}>
//           <div style={{ marginBottom: 6 }}>
//             <label>
//               Single Function:{' '}
//               <select
//                 value={selectedFunction}
//                 onChange={(e) => setSelectedFunction(e.target.value)}
//                 disabled={functions.length === 0}
//                 style={{ width: 200 }}
//               >
//                 <option value="">-- select function --</option>
//                 {functions.map((fn) => (
//                   <option key={fn} value={fn}>
//                     {fn}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>
//           <div>
//             <button
//               onClick={handleTransferSingle}
//               style={{ padding: '8px 14px', cursor: 'pointer', marginRight: 10 }}
//               disabled={!mongoDatabase || !selectedFunction || !couchbaseBucket}
//             >
//               Transfer Single Function
//             </button>
//           </div>
//           <div style={{ marginTop: 12 }}>
//             <button
//               onClick={handleTransferAll}
//               style={{ padding: '8px 14px', cursor: 'pointer' }}
//               disabled={!mongoDatabase || !couchbaseBucket || selectedFunctions.length === 0}
//             >
//               Transfer All Selected Functions
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Status / Errors */}
//       <div style={{ marginTop: 20 }}>
//         {statusMessage && <div style={{ color: 'green', marginBottom: 6 }}>{statusMessage}</div>}
//         {errorMessage && <div style={{ color: 'red', marginBottom: 6 }}>{errorMessage}</div>}
//       </div>
//     </div>
//   );

// }














// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// // import './Function.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// export default function UnifiedFunctionTransfer() {
//   const { getAccessTokenSilently } = useAuth0();

//   // Connection & selection state
//   const [mongoDatabase, setMongoDatabase] = useState('');
//   const [mongoDatabases, setMongoDatabases] = useState([]);
//   const [mongoCollections, setMongoCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState('');

//   const [couchbaseBucket, setCouchbaseBucket] = useState(
//     () => sessionStorage.getItem('couchbaseBucket') || ''
//   );
//   const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
//   const [couchbaseScope, setCouchbaseScope] = useState(
//     () => sessionStorage.getItem('couchbaseScope') || ''
//   );
//   const [couchbaseScopes, setCouchbaseScopes] = useState([]);

//   const [functions, setFunctions] = useState([]);
//   const [selectedFunction, setSelectedFunction] = useState('');
//   const [selectedFunctions, setSelectedFunctions] = useState([]);
//   const [includeSystemFunctions, setIncludeSystemFunctions] = useState(false);
//   const [continueOnError, setContinueOnError] = useState(false);

//   // UI feedback
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   // Utility to get token and set common headers
//   const getAuthHeaders = useCallback(async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   }, [getAccessTokenSilently]);

//   // Persist couchbase selections in sessionStorage
//   useEffect(() => {
//     if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
//   }, [couchbaseBucket]);

//   useEffect(() => {
//     if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
//   }, [couchbaseScope]);

//   // Fetch MongoDB databases
//   const fetchMongoDatabases = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/databases`, { headers });
//       if (Array.isArray(resp.data)) {
//         setMongoDatabases(resp.data);
//       } else {
//         setMongoDatabases([]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch MongoDB databases', err);
//       setErrorMessage('Failed to fetch MongoDB databases.');
//     }
//   }, [getAuthHeaders]);

//   // Fetch collections for selected MongoDB database
//   useEffect(() => {
//     async function doFetchCollections() {
//       if (!mongoDatabase) {
//         setMongoCollections([]);
//         setSelectedCollection('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           setMongoCollections(resp.data);
//           setSelectedCollection(resp.data[0] || '');
//         } else {
//           setMongoCollections([]);
//           setSelectedCollection('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch MongoDB collections', err);
//         setErrorMessage('Failed to fetch MongoDB collections.');
//         setMongoCollections([]);
//       }
//     }
//     doFetchCollections();
//   }, [mongoDatabase, getAuthHeaders]);

//   // Fetch MongoDB functions when database or includeSystemFunctions changes
//   useEffect(() => {
//     async function fetchFunctions() {
//       if (!mongoDatabase) {
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         const resp = await axios.get(
//           `${API_BASE}/mongo-functions?database=${encodeURIComponent(
//             mongoDatabase
//           )}&includeSystem=${includeSystemFunctions}`,
//           { headers }
//         );
//         if (Array.isArray(resp.data)) {
//           const funcNames = resp.data
//             .map((fn) => fn.name || fn._id || '')
//             .filter(Boolean);
//           setFunctions(funcNames);
//           setSelectedFunctions(funcNames);
//           setSelectedFunction(funcNames[0] || '');
//         } else {
//           setFunctions([]);
//           setSelectedFunctions([]);
//           setSelectedFunction('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch functions', err);
//         setErrorMessage(
//           'Failed to fetch functions: ' +
//             (err?.response?.data?.message || err?.message || 'unknown error')
//         );
//         setFunctions([]);
//       }
//     }
//     fetchFunctions();
//   }, [mongoDatabase, includeSystemFunctions, getAuthHeaders]);

//   // Fetch Couchbase buckets
//   const fetchCouchbaseBuckets = useCallback(async () => {
//     try {
//       const headers = await getAuthHeaders();
//       const resp = await axios.get(`${API_BASE}/buckets`, { headers });
//       const bucketList = Array.isArray(resp.data)
//         ? resp.data
//         : Array.isArray(resp.data?.buckets)
//         ? resp.data.buckets
//         : [];
//       setCouchbaseBuckets(bucketList);
//       if (!couchbaseBucket && bucketList.length) {
//         setCouchbaseBucket(bucketList[0]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch Couchbase buckets', err);
//       setErrorMessage('Failed to fetch Couchbase buckets.');
//       setCouchbaseBuckets([]);
//     }
//   }, [getAuthHeaders, couchbaseBucket]);

//   // When bucket changes: select it and then fetch scopes from backend
//   useEffect(() => {
//     async function fetchScopes() {
//       if (!couchbaseBucket) {
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//         return;
//       }
//       try {
//         const headers = await getAuthHeaders();
//         // Notify backend about bucket selection
//         await axios.post(
//           `${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`,
//           null,
//           { headers }
//         );
//         // Then fetch scopes (via your existing endpoint)
//         const res = await axios.get(`${API_BASE}/couchbase-collections`, {
//           headers,
//           params: { bucketName: couchbaseBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setCouchbaseScopes(scopeList);
//           const resolvedScope = scopeList[0] || '';
//           setCouchbaseScope((prev) => prev || resolvedScope);
//         } else {
//           setCouchbaseScopes([]);
//           setCouchbaseScope('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch Couchbase scopes', err);
//         setErrorMessage('Failed to fetch Couchbase scopes.');
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//       }
//     }
//     fetchScopes();
//   }, [couchbaseBucket, getAuthHeaders]);

//   // Initial load
//   useEffect(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

//   const toggleFunctionSelection = (fnName) => {
//     setSelectedFunctions((prev) =>
//       prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
//     );
//   };

//   const handleTransferAll = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     if (!mongoDatabase || !couchbaseBucket) {
//       setErrorMessage('MongoDB database and Couchbase bucket are required.');
//       return;
//     }
//     if (selectedFunctions.length === 0) {
//       setErrorMessage('Please select at least one function to transfer.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring all selected functions...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         couchbaseBucket,
//         couchbaseScope: couchbaseScope || null,
//         includeSystemFunctions,
//         functionNames: selectedFunctions,
//         continueOnError,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-functions`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'All functions transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer all failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   const handleTransferSingle = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     const cleanedFunction = selectedFunction.trim();
//     if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
//       setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
//       return;
//     }
//     try {
//       setStatusMessage('Transferring single function...');
//       const headers = await getAuthHeaders();
//       const payload = {
//         mongoDatabase,
//         functionName: cleanedFunction,
//         couchbaseScope: couchbaseScope || null,
//       };
//       const resp = await axios.post(`${API_BASE}/transfer-function`, payload, {
//         headers,
//       });
//       setStatusMessage(resp.data || 'Function transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer single failed', err);
//       setErrorMessage(
//         (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
//           (err && err.message) ||
//           'Transfer failed'
//       );
//     }
//   };

//   return (
//     <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 900 }}>
//       {/* <h2>Unified Function Transfer</h2> */}

//       {/* Connection / Metadata Section */}
//       <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>MongoDB</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Database:{' '}
//                 <select
//                   value={mongoDatabase}
//                   onChange={(e) => setMongoDatabase(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select db --</option>
//                   {mongoDatabases.map((db) => (
//                     <option key={db} value={db}>
//                       {db}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchMongoDatabases}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh DBs
//               </button>
//             </div>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Collection:{' '}
//                 <select
//                   value={selectedCollection}
//                   onChange={(e) => setSelectedCollection(e.target.value)}
//                   style={{ width: 220 }}
//                   disabled={mongoCollections.length === 0}
//                 >
//                   <option value="">-- select collection --</option>
//                   {mongoCollections.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={includeSystemFunctions}
//                   onChange={(e) => setIncludeSystemFunctions(e.target.checked)}
//                 />{' '}
//                 Include System Functions
//               </label>
//               <span style={{ marginLeft: 20 }}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={continueOnError}
//                     onChange={(e) => setContinueOnError(e.target.checked)}
//                   />{' '}
//                   Continue on Error
//                 </label>
//               </span>
//             </div>
//           </fieldset>
//         </div>

//         <div style={{ flex: 1, minWidth: 260 }}>
//           <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
//             <legend>Couchbase</legend>
//             <div style={{ marginBottom: 8 }}>
//               <label>
//                 Bucket:{' '}
//                 <select
//                   value={couchbaseBucket}
//                   onChange={(e) => setCouchbaseBucket(e.target.value)}
//                   style={{ width: 200 }}
//                 >
//                   <option value="">-- select bucket --</option>
//                   {couchbaseBuckets.map((b) => (
//                     <option key={b} value={b}>
//                       {b}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button
//                 onClick={fetchCouchbaseBuckets}
//                 style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
//               >
//                 Refresh Buckets
//               </button>
//             </div>
//             <div>
//               <label>
//                 Scope:{' '}
//                 <select
//                   value={couchbaseScope}
//                   onChange={(e) => setCouchbaseScope(e.target.value)}
//                   style={{ width: 200 }}
//                   disabled={couchbaseScopes.length === 0}
//                 >
//                   <option value="">-- select scope --</option>
//                   {couchbaseScopes.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//           </fieldset>
//         </div>
//       </div>

//       {/* Functions list */}
//       <div
//         style={{
//           marginTop: 20,
//           display: 'flex',
//           gap: 30,
//           flexWrap: 'wrap',
//           alignItems: 'flex-start',
//         }}
//       >
//         <div style={{ flex: 1, minWidth: 300 }}>
//           <div style={{ marginBottom: 6 }}>
//             <strong>Available Functions (from DB):</strong>
//           </div>
//           <div
//             style={{
//               maxHeight: 220,
//               overflowY: 'auto',
//               border: '1px solid #ddd',
//               padding: 8,
//               borderRadius: 4,
//             }}
//           >
//             {functions.length === 0 && <div>No functions loaded.</div>}
//             {functions.map((fnName) => (
//               <div key={fnName}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={selectedFunctions.includes(fnName)}
//                     onChange={() => toggleFunctionSelection(fnName)}
//                   />{' '}
//                   {fnName}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div style={{ minWidth: 260 }}>
//           <div style={{ marginBottom: 6 }}>
//             <label>
//               Single Function:{' '}
//               <select
//                 value={selectedFunction}
//                 onChange={(e) => setSelectedFunction(e.target.value)}
//                 disabled={functions.length === 0}
//                 style={{ width: 200 }}
//               >
//                 <option value="">-- select function --</option>
//                 {functions.map((fn) => (
//                   <option key={fn} value={fn}>
//                     {fn}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>
//           <div>
//             <button
//               onClick={handleTransferSingle}
//               style={{ padding: '8px 14px', cursor: 'pointer', marginRight: 10 }}
//               disabled={!mongoDatabase || !selectedFunction || !couchbaseBucket}
//             >
//               Transfer Single Function
//             </button>
//           </div>
//           <div style={{ marginTop: 12 }}>
//             <button
//               onClick={handleTransferAll}
//               style={{ padding: '8px 14px', cursor: 'pointer' }}
//               disabled={!mongoDatabase || !couchbaseBucket || selectedFunctions.length === 0}
//             >
//               Transfer All Selected Functions
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Status / Errors */}
//       <div style={{ marginTop: 20 }}>
//         {statusMessage && <div style={{ color: 'green', marginBottom: 6 }}>{statusMessage}</div>}
//         {errorMessage && <div style={{ color: 'red', marginBottom: 6 }}>{errorMessage}</div>}
//       </div>
//     </div>
//   );
// }





// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import './Function.css';
// import FunctionProgressbar from './FunctionProgressbar';

// const API_BASE = 'http://localhost:8080/api/transfer';

// export default function UnifiedFunctionTransfer() {
//   const { getAccessTokenSilently } = useAuth0();

//   // Connection & selection state
//   const [mongoDatabase, setMongoDatabase] = useState('');
//   const [mongoDatabases, setMongoDatabases] = useState([]);
//   const [mongoCollections, setMongoCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState('');

//   const [couchbaseBucket, setCouchbaseBucket] = useState(
//     () => sessionStorage.getItem('couchbaseBucket') || ''
//   );
//   const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
//   const [couchbaseScope, setCouchbaseScope] = useState(
//     () => sessionStorage.getItem('couchbaseScope') || ''
//   );
//   const [couchbaseScopes, setCouchbaseScopes] = useState([]);

//   const [functions, setFunctions] = useState([]);
//   const [selectedFunction, setSelectedFunction] = useState('');
//   const [selectedFunctions, setSelectedFunctions] = useState([]);

//   // UI feedback
//   const [statusMessage, setStatusMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [loading, setLoading] = useState({
//     mongoDBs: false,
//     mongoColls: false,
//     mongoFuncs: false,
//     cbBuckets: false,
//     cbScopes: false,
//     transferSingle: false,
//     transferAll: false,
//   });

//   // Set up axios instance with auth header injection
//   const axiosInstance = useCallback(async () => {
//     const token = await getAccessTokenSilently();
//     const instance = axios.create();
//     instance.defaults.headers.common.Authorization = `Bearer ${token}`;
//     return instance;
//   }, [getAccessTokenSilently]);

//   // Persist couchbase selections
//   useEffect(() => {
//     if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
//   }, [couchbaseBucket]);

//   useEffect(() => {
//     if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
//   }, [couchbaseScope]);

//   // Fetch MongoDB databases
//   const fetchMongoDatabases = useCallback(async () => {
//     setErrorMessage(null);
//     setLoading((l) => ({ ...l, mongoDBs: true }));
//     try {
//       const ax = await axiosInstance();
//       const resp = await ax.get(`${API_BASE}/databases`);
//       if (Array.isArray(resp.data)) {
//         setMongoDatabases(resp.data);
//       } else {
//         setMongoDatabases([]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch MongoDB databases', err);
//       setErrorMessage('Failed to fetch MongoDB databases.');
//       setMongoDatabases([]);
//     } finally {
//       setLoading((l) => ({ ...l, mongoDBs: false }));
//     }
//   }, [axiosInstance]);

//   // Fetch MongoDB collections when database changes
//   useEffect(() => {
//     async function doFetchCollections() {
//       setErrorMessage(null);
//       setLoading((l) => ({ ...l, mongoColls: true }));
//       if (!mongoDatabase) {
//         setMongoCollections([]);
//         setSelectedCollection('');
//         setLoading((l) => ({ ...l, mongoColls: false }));
//         return;
//       }
//       try {
//         const ax = await axiosInstance();
//         const resp = await ax.get(
//           `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`
//         );
//         if (Array.isArray(resp.data)) {
//           setMongoCollections(resp.data);
//           setSelectedCollection((prev) => (prev && resp.data.includes(prev) ? prev : resp.data[0] || ''));
//         } else {
//           setMongoCollections([]);
//           setSelectedCollection('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch MongoDB collections', err);
//         setErrorMessage('Failed to fetch MongoDB collections.');
//         setMongoCollections([]);
//         setSelectedCollection('');
//       } finally {
//         setLoading((l) => ({ ...l, mongoColls: false }));
//       }
//     }
//     doFetchCollections();
//   }, [mongoDatabase, axiosInstance]);

//   // Fetch MongoDB functions when database changes
//   useEffect(() => {
//     async function fetchFunctions() {
//       setErrorMessage(null);
//       setLoading((l) => ({ ...l, mongoFuncs: true }));
//       if (!mongoDatabase) {
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//         setLoading((l) => ({ ...l, mongoFuncs: false }));
//         return;
//       }
//       try {
//         const ax = await axiosInstance();
//         const resp = await ax.get(
//           `${API_BASE}/mongo-functions?database=${encodeURIComponent(mongoDatabase)}`
//         );
//         if (Array.isArray(resp.data)) {
//           const funcNames = resp.data
//             .map((fn) => fn.name || fn._id || '')
//             .filter(Boolean);
//           setFunctions(funcNames);
//           setSelectedFunction(funcNames[0] || '');
//           setSelectedFunctions(funcNames.slice()); // default select all
//         } else {
//           setFunctions([]);
//           setSelectedFunction('');
//           setSelectedFunctions([]);
//         }
//       } catch (err) {
//         console.warn('Failed to fetch functions', err);
//         setErrorMessage(
//           'Failed to fetch functions: ' +
//             (err?.response?.data?.message || err?.message || 'unknown error')
//         );
//         setFunctions([]);
//         setSelectedFunction('');
//         setSelectedFunctions([]);
//       } finally {
//         setLoading((l) => ({ ...l, mongoFuncs: false }));
//       }
//     }
//     fetchFunctions();
//   }, [mongoDatabase, axiosInstance]);

//   // Fetch Couchbase buckets
//   const fetchCouchbaseBuckets = useCallback(async () => {
//     setErrorMessage(null);
//     setLoading((l) => ({ ...l, cbBuckets: true }));
//     try {
//       const ax = await axiosInstance();
//       const resp = await ax.get(`${API_BASE}/buckets`);
//       const bucketList = Array.isArray(resp.data)
//         ? resp.data
//         : Array.isArray(resp.data?.buckets)
//         ? resp.data.buckets
//         : [];
//       setCouchbaseBuckets(bucketList);
//       if (!couchbaseBucket && bucketList.length) {
//         setCouchbaseBucket(bucketList[0]);
//       }
//     } catch (err) {
//       console.warn('Failed to fetch Couchbase buckets', err);
//       setErrorMessage('Failed to fetch Couchbase buckets.');
//       setCouchbaseBuckets([]);
//     } finally {
//       setLoading((l) => ({ ...l, cbBuckets: false }));
//     }
//   }, [axiosInstance, couchbaseBucket]);

//   // When bucket changes: select it and fetch scopes
//   useEffect(() => {
//     async function fetchScopes() {
//       setErrorMessage(null);
//       setLoading((l) => ({ ...l, cbScopes: true }));
//       if (!couchbaseBucket) {
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//         setLoading((l) => ({ ...l, cbScopes: false }));
//         return;
//       }
//       try {
//         const ax = await axiosInstance();
//         // Notify backend about bucket selection
//         await ax.post(`${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`, null);
//         // Then fetch scopes / collections mapping
//         const res = await ax.get(`${API_BASE}/couchbase-collections`, {
//           params: { bucketName: couchbaseBucket },
//         });
//         if (res.data && typeof res.data === 'object') {
//           const mapping = res.data;
//           const scopeList = Object.keys(mapping);
//           setCouchbaseScopes(scopeList);
//           const resolvedScope = scopeList[0] || '';
//           setCouchbaseScope((prev) => (prev || resolvedScope));
//         } else {
//           setCouchbaseScopes([]);
//           setCouchbaseScope('');
//         }
//       } catch (err) {
//         console.warn('Failed to fetch Couchbase scopes', err);
//         setErrorMessage('Failed to fetch Couchbase scopes.');
//         setCouchbaseScopes([]);
//         setCouchbaseScope('');
//       } finally {
//         setLoading((l) => ({ ...l, cbScopes: false }));
//       }
//     }
//     fetchScopes();
//   }, [couchbaseBucket, axiosInstance]);

//   // Initial load
//   useEffect(() => {
//     fetchMongoDatabases();
//     fetchCouchbaseBuckets();
//   }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

//   const toggleFunctionSelection = (fnName) => {
//     setSelectedFunctions((prev) =>
//       prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
//     );
//   };

//   const handleTransferAll = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     if (!mongoDatabase || !couchbaseBucket) {
//       setErrorMessage('MongoDB database and Couchbase bucket are required.');
//       return;
//     }
//     if (selectedFunctions.length === 0) {
//       setErrorMessage('Please select at least one function to transfer.');
//       return;
//     }
//     try {
//       setLoading((l) => ({ ...l, transferAll: true }));
//       setStatusMessage('Transferring all selected functions...');
//       const ax = await axiosInstance();
//       const payload = {
//         mongoDatabase,
//         couchbaseBucket,
//         couchbaseScope: couchbaseScope || null,
//         functionNames: selectedFunctions,
//       };
//       const resp = await ax.post(`${API_BASE}/transfer-functions`, payload);
//       setStatusMessage(resp.data || 'All functions transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer all failed', err);
//       setErrorMessage(
//         (err?.response?.data?.message || err?.message) || 'Transfer failed'
//       );
//     } finally {
//       setLoading((l) => ({ ...l, transferAll: false }));
//     }
//   };

//   const handleTransferSingle = async () => {
//     setStatusMessage(null);
//     setErrorMessage(null);
//     const cleanedFunction = (selectedFunction || '').trim();
//     if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
//       setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
//       return;
//     }
//     try {
//       setLoading((l) => ({ ...l, transferSingle: true }));
//       setStatusMessage('Transferring single function...');
//       const ax = await axiosInstance();
//       const payload = {
//         mongoDatabase,
//         functionName: cleanedFunction,
//         couchbaseScope: couchbaseScope || null,
//       };
//       const resp = await ax.post(`${API_BASE}/transfer-function`, payload);
//       setStatusMessage(resp.data || 'Function transferred successfully.');
//     } catch (err) {
//       console.warn('Transfer single failed', err);
//       setErrorMessage(
//         (err?.response?.data?.message || err?.message) || 'Transfer failed'
//       );
//     } finally {
//       setLoading((l) => ({ ...l, transferSingle: false }));
//     }
//   };

//   return (
//     <div className="function-transfer-container">
//       <div className="database-panels-container">
//         {/* MongoDB Panel */}
//         <div className="database-panel mongo-panel">
//           <div className="panel-header">
//             <h3>MongoDB Source</h3>
//           </div>

//           <div className="form-group">
//             <label>Database</label>
//             <div className="select-row">
//               <select
//                 value={mongoDatabase}
//                 onChange={(e) => setMongoDatabase(e.target.value)}
//                 disabled={loading.mongoDBs}
//               >
//                 <option value="">-- Select database --</option>
//                 {mongoDatabases.map((db) => (
//                   <option key={db} value={db}>
//                     {db}
//                   </option>
//                 ))}
//               </select>
//               {/* <button onClick={fetchMongoDatabases} disabled={loading.mongoDBs}>
//                 {loading.mongoDBs ? 'Refreshing...' : 'Refresh DBs'}
//               </button> */}
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Collection</label>
//             <select
//               value={selectedCollection}
//               onChange={(e) => setSelectedCollection(e.target.value)}
//               disabled={mongoCollections.length === 0 || loading.mongoColls}
//             >
//               <option value="">-- Select collection --</option>
//               {mongoCollections.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Couchbase Panel */}
//         <div className="database-panel couchbase-panel">
//           <div className="panel-header">
//             <h3>Couchbase Target</h3>
//           </div>

//           <div className="form-group">
//             <label>Bucket</label>
//             <div className="select-row">
//               <select
//                 value={couchbaseBucket}
//                 onChange={(e) => setCouchbaseBucket(e.target.value)}
//                 disabled={loading.cbBuckets}
//               >
//                 <option value="">-- Select bucket --</option>
//                 {couchbaseBuckets.map((b) => (
//                   <option key={b} value={b}>
//                     {b}
//                   </option>
//                 ))}
//               </select>
//               {/* <button onClick={fetchCouchbaseBuckets} disabled={loading.cbBuckets}>
//                 {loading.cbBuckets ? 'Refreshing...' : 'Refresh Buckets'}
//               </button> */}
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Scope</label>
//             <select
//               value={couchbaseScope}
//               onChange={(e) => setCouchbaseScope(e.target.value)}
//               disabled={couchbaseScopes.length === 0 || loading.cbScopes}
//             >
//               <option value="">-- Select scope --</option>
//               {couchbaseScopes.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Functions Section */}
//       <div className="functions-section">
//         <div className="functions-list-container">
//           <h3>Available Functions</h3>
//           <div className="functions-list">
//             {functions.length === 0 ? (
//               <div className="no-functions">No functions found</div>
//             ) : (
//               <>
//                 <div className="select-all-functions">
//                   <label>
//                     <input
//                       type="checkbox"
//                       checked={selectedFunctions.length === functions.length}
//                       onChange={() => {
//                         if (selectedFunctions.length === functions.length) {
//                           setSelectedFunctions([]);
//                         } else {
//                           setSelectedFunctions([...functions]);
//                         }
//                       }}
//                     />
//                     All Functions
//                   </label>
//                 </div>
//                 {functions.map((fnName) => (
//                   <div key={fnName} className="function-item">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={selectedFunctions.includes(fnName)}
//                         onChange={() => toggleFunctionSelection(fnName)}
//                       />
//                       {fnName}
//                     </label>
//                   </div>
//                 ))}
//               </>
//             )}
//           </div>
//         </div>

//         <div className="transfer-actions">
//           <div className="single-transfer">
//             <label>Transfer Single Function</label>
//             <div className="single-transfer-row">
//               <select
//                 value={selectedFunction}
//                 onChange={(e) => setSelectedFunction(e.target.value)}
//                 disabled={functions.length === 0}
//               >
//                 <option value="">-- Select function --</option>
//                 {functions.map((fn) => (
//                   <option key={fn} value={fn}>
//                     {fn}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 className="transfer-button secondary"
//                 onClick={handleTransferSingle}
//                 disabled={
//                   !mongoDatabase || !selectedFunction || !couchbaseBucket || loading.transferSingle
//                 }
//               >
//                 {loading.transferSingle ? 'Transferring...' : 'Transfer Single'}
//               </button>
//             </div>
//           </div>

//           <div className="bulk-transfer">
//             <button
//               className="transfer-button primary"
//               onClick={handleTransferAll}
//               disabled={
//                 !mongoDatabase ||
//                 !couchbaseBucket ||
//                 selectedFunctions.length === 0 ||
//                 loading.transferAll
//               }
//             >
//               {loading.transferAll
//                 ? `Transferring (${selectedFunctions.length})...`
//                 : `Transfer All Selected (${selectedFunctions.length})`}
//             </button>
//             {/* <FunctionProgressbar/> */}
//           </div>
//         </div>
//       </div>

//       {/* Status Messages */}
//       <div className="status-messages">
//         {statusMessage && <div className="status-message success">{statusMessage}</div>}
//         {errorMessage && <div className="status-message error">{errorMessage}</div>}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import './Function.css';
import FunctionProgressbar from './FunctionProgressbar';

const API_BASE = 'http://localhost:8080/api/transfer';
const REFRESH_INTERVAL = 5000; // 5 seconds

export default function UnifiedFunctionTransfer() {
  const { getAccessTokenSilently } = useAuth0();

  // Connection & selection state
  const [mongoDatabase, setMongoDatabase] = useState('');
  const [mongoDatabases, setMongoDatabases] = useState([]);
  const [mongoCollections, setMongoCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');

  const [couchbaseBucket, setCouchbaseBucket] = useState(
    () => sessionStorage.getItem('couchbaseBucket') || ''
  );
  const [couchbaseBuckets, setCouchbaseBuckets] = useState([]);
  const [couchbaseScope, setCouchbaseScope] = useState(
    () => sessionStorage.getItem('couchbaseScope') || ''
  );
  const [couchbaseScopes, setCouchbaseScopes] = useState([]);

  const [functions, setFunctions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [selectedFunctions, setSelectedFunctions] = useState([]);

  // UI feedback
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState({
    mongoDBs: false,
    mongoColls: false,
    mongoFuncs: false,
    cbBuckets: false,
    cbScopes: false,
    transferSingle: false,
    transferAll: false,
  });

  // Set up axios instance with auth header injection
  const axiosInstance = useCallback(async () => {
    const token = await getAccessTokenSilently();
    const instance = axios.create();
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return instance;
  }, [getAccessTokenSilently]);

  // Persist couchbase selections
  useEffect(() => {
    if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
  }, [couchbaseBucket]);

  useEffect(() => {
    if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
  }, [couchbaseScope]);

  // Clear error messages when user makes changes to inputs
  useEffect(() => {
    setErrorMessage(null);
  }, [mongoDatabase, selectedCollection, couchbaseBucket, couchbaseScope]);

  // Fetch MongoDB databases
  const fetchMongoDatabases = useCallback(async () => {
    setErrorMessage(null);
    setLoading((l) => ({ ...l, mongoDBs: true }));
    try {
      const ax = await axiosInstance();
      const resp = await ax.get(`${API_BASE}/databases`);
      if (Array.isArray(resp.data)) {
        setMongoDatabases(resp.data);
      } else {
        setMongoDatabases([]);
      }
    } catch (err) {
      console.warn('Failed to fetch MongoDB databases', err);
      setErrorMessage('Failed to fetch MongoDB databases.');
      setMongoDatabases([]);
    } finally {
      setLoading((l) => ({ ...l, mongoDBs: false }));
    }
  }, [axiosInstance]);

  // Fetch MongoDB collections when database changes
  const fetchMongoCollections = useCallback(async () => {
    setErrorMessage(null);
    setLoading((l) => ({ ...l, mongoColls: true }));
    if (!mongoDatabase) {
      setMongoCollections([]);
      setSelectedCollection('');
      setLoading((l) => ({ ...l, mongoColls: false }));
      return;
    }
    try {
      const ax = await axiosInstance();
      const resp = await ax.get(
        `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`
      );
      if (Array.isArray(resp.data)) {
        setMongoCollections(resp.data);
        // Preserve selection if it still exists, otherwise select first or empty
        setSelectedCollection((prev) => (prev && resp.data.includes(prev) ? prev : resp.data[0] || ''));
      } else {
        setMongoCollections([]);
        setSelectedCollection('');
      }
    } catch (err) {
      console.warn('Failed to fetch MongoDB collections', err);
      setErrorMessage('Failed to fetch MongoDB collections.');
      setMongoCollections([]);
      setSelectedCollection('');
    } finally {
      setLoading((l) => ({ ...l, mongoColls: false }));
    }
  }, [mongoDatabase, axiosInstance]);

  // Fetch MongoDB functions when database or collection changes
  const fetchMongoFunctions = useCallback(async () => {
    setErrorMessage(null);
    setLoading((l) => ({ ...l, mongoFuncs: true }));
    if (!mongoDatabase || !selectedCollection) {
      setFunctions([]);
      setSelectedFunction('');
      setSelectedFunctions([]);
      setLoading((l) => ({ ...l, mongoFuncs: false }));
      return;
    }
    try {
      const ax = await axiosInstance();
      const resp = await ax.get(
        `${API_BASE}/mongo-functions?database=${encodeURIComponent(mongoDatabase)}&collection=${encodeURIComponent(selectedCollection)}`
      );
      if (Array.isArray(resp.data)) {
        const funcNames = resp.data
          .map((fn) => fn.name || fn._id || '')
          .filter(Boolean);
        setFunctions(funcNames);
        // Preserve selections that still exist, or select all if none exist
        setSelectedFunctions((prev) => 
          prev.filter(f => funcNames.includes(f)).length > 0 
            ? prev.filter(f => funcNames.includes(f)) 
            : funcNames
        );
        setSelectedFunction((prev) => funcNames.includes(prev) ? prev : funcNames[0] || '');
      } else {
        setFunctions([]);
        setSelectedFunction('');
        setSelectedFunctions([]);
      }
    } catch (err) {
      console.warn('Failed to fetch functions', err);
      setErrorMessage(
        'Failed to fetch functions: ' +
          (err?.response?.data?.message || err?.message || 'unknown error')
      );
      setFunctions([]);
      setSelectedFunction('');
      setSelectedFunctions([]);
    } finally {
      setLoading((l) => ({ ...l, mongoFuncs: false }));
    }
  }, [mongoDatabase, selectedCollection, axiosInstance]);

  // Fetch Couchbase buckets
  const fetchCouchbaseBuckets = useCallback(async () => {
    setErrorMessage(null);
    setLoading((l) => ({ ...l, cbBuckets: true }));
    try {
      const ax = await axiosInstance();
      const resp = await ax.get(`${API_BASE}/buckets`);
      const bucketList = Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.data?.buckets)
        ? resp.data.buckets
        : [];
      setCouchbaseBuckets(bucketList);
      // Preserve selection if it still exists, otherwise select first or empty
      setCouchbaseBucket((prev) => (prev && bucketList.includes(prev) ? prev : bucketList[0] || ''));
    } catch (err) {
      console.warn('Failed to fetch Couchbase buckets', err);
      setErrorMessage('Failed to fetch Couchbase buckets.');
      setCouchbaseBuckets([]);
    } finally {
      setLoading((l) => ({ ...l, cbBuckets: false }));
    }
  }, [axiosInstance]);

  // Fetch Couchbase scopes when bucket changes
  const fetchCouchbaseScopes = useCallback(async () => {
    setErrorMessage(null);
    setLoading((l) => ({ ...l, cbScopes: true }));
    if (!couchbaseBucket) {
      setCouchbaseScopes([]);
      setCouchbaseScope('');
      setLoading((l) => ({ ...l, cbScopes: false }));
      return;
    }
    try {
      const ax = await axiosInstance();
      // Notify backend about bucket selection
      await ax.post(`${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`, null);
      // Then fetch scopes / collections mapping
      const res = await ax.get(`${API_BASE}/couchbase-collections`, {
        params: { bucketName: couchbaseBucket },
      });
      if (res.data && typeof res.data === 'object') {
        const mapping = res.data;
        const scopeList = Object.keys(mapping);
        setCouchbaseScopes(scopeList);
        // Preserve scope selection if it still exists, otherwise select first or empty
        setCouchbaseScope((prev) => (prev && scopeList.includes(prev) ? prev : scopeList[0] || ''));
      } else {
        setCouchbaseScopes([]);
        setCouchbaseScope('');
      }
    } catch (err) {
      console.warn('Failed to fetch Couchbase scopes', err);
      setErrorMessage('Failed to fetch Couchbase scopes.');
      setCouchbaseScopes([]);
      setCouchbaseScope('');
    } finally {
      setLoading((l) => ({ ...l, cbScopes: false }));
    }
  }, [couchbaseBucket, axiosInstance]);

  // Initial load and setup auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchMongoDatabases();
    fetchCouchbaseBuckets();

    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchMongoDatabases();
      fetchCouchbaseBuckets();
      
      if (mongoDatabase) {
        fetchMongoCollections();
      }
      
      if (mongoDatabase && selectedCollection) {
        fetchMongoFunctions();
      }
      
      if (couchbaseBucket) {
        fetchCouchbaseScopes();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [
    fetchMongoDatabases, 
    fetchCouchbaseBuckets,
    fetchMongoCollections,
    fetchMongoFunctions,
    fetchCouchbaseScopes,
    mongoDatabase,
    selectedCollection,
    couchbaseBucket
  ]);

  // Fetch dependent data when selections change
  useEffect(() => {
    fetchMongoCollections();
  }, [mongoDatabase, fetchMongoCollections]);

  useEffect(() => {
    fetchMongoFunctions();
  }, [mongoDatabase, selectedCollection, fetchMongoFunctions]);

  useEffect(() => {
    fetchCouchbaseScopes();
  }, [couchbaseBucket, fetchCouchbaseScopes]);

  const toggleFunctionSelection = (fnName) => {
    setSelectedFunctions((prev) =>
      prev.includes(fnName) ? prev.filter((f) => f !== fnName) : [...prev, fnName]
    );
  };

  const handleTransferAll = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    if (!mongoDatabase || !couchbaseBucket) {
      setErrorMessage('MongoDB database and Couchbase bucket are required.');
      return;
    }
    if (selectedFunctions.length === 0) {
      setErrorMessage('Please select at least one function to transfer.');
      return;
    }
    try {
      setLoading((l) => ({ ...l, transferAll: true }));
      setStatusMessage('Transferring all selected functions...');
      const ax = await axiosInstance();
      const payload = {
        mongoDatabase,
        couchbaseBucket,
        couchbaseScope: couchbaseScope || null,
        functionNames: selectedFunctions,
      };
      const resp = await ax.post(`${API_BASE}/transfer-functions`, payload);
      setStatusMessage(resp.data || 'All functions transferred successfully.');
      // Refresh functions after transfer
      fetchMongoFunctions();
    } catch (err) {
      console.warn('Transfer all failed', err);
      setErrorMessage(
        (err?.response?.data?.message || err?.message) || 'Transfer failed'
      );
    } finally {
      setLoading((l) => ({ ...l, transferAll: false }));
    }
  };

  const handleTransferSingle = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    const cleanedFunction = (selectedFunction || '').trim();
    if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
      setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
      return;
    }
    try {
      setLoading((l) => ({ ...l, transferSingle: true }));
      setStatusMessage('Transferring single function...');
      const ax = await axiosInstance();
      const payload = {
        mongoDatabase,
        functionName: cleanedFunction,
        couchbaseScope: couchbaseScope || null,
      };
      const resp = await ax.post(`${API_BASE}/transfer-function`, payload);
      setStatusMessage(resp.data || 'Function transferred successfully.');
      // Refresh functions after transfer
      fetchMongoFunctions();
    } catch (err) {
      console.warn('Transfer single failed', err);
      setErrorMessage(
        (err?.response?.data?.message || err?.message) || 'Transfer failed'
      );
    } finally {
      setLoading((l) => ({ ...l, transferSingle: false }));
    }
  };

  return (
    <div className="function-transfer-container">
      <div className="database-panels-container">
        {/* MongoDB Panel */}
        <div className="database-panel mongo-panel">
          <div className="panel-header">
            <h3>MongoDB Source</h3>
          </div>

          <div className="form-group">
            <label>Database</label>
            <div className="select-row">
              <select
                value={mongoDatabase}
                onChange={(e) => setMongoDatabase(e.target.value)}
                disabled={loading.mongoDBs}
              >
                <option value="">-- Select database --</option>
                {mongoDatabases.map((db) => (
                  <option key={db} value={db}>
                    {db}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Collection</label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              disabled={mongoCollections.length === 0 || loading.mongoColls}
            >
              <option value="">-- Select collection --</option>
              {mongoCollections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Couchbase Panel */}
        <div className="database-panel couchbase-panel">
          <div className="panel-header">
            <h3>Couchbase Target</h3>
          </div>

          <div className="form-group">
            <label>Bucket</label>
            <div className="select-row">
              <select
                value={couchbaseBucket}
                onChange={(e) => setCouchbaseBucket(e.target.value)}
                disabled={loading.cbBuckets}
              >
                <option value="">-- Select bucket --</option>
                {couchbaseBuckets.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Scope</label>
            <select
              value={couchbaseScope}
              onChange={(e) => setCouchbaseScope(e.target.value)}
              disabled={couchbaseScopes.length === 0 || loading.cbScopes}
            >
              <option value="">-- Select scope --</option>
              {couchbaseScopes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Functions Section */}
      <div className="functions-section">
        <div className="functions-list-container">
          <h3>Available Functions</h3>
          <div className="functions-list">
            {functions.length === 0 ? (
              <div className="no-functions">No functions found</div>
            ) : (
              <>
                <div className="select-all-functions">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedFunctions.length === functions.length}
                      onChange={() => {
                        if (selectedFunctions.length === functions.length) {
                          setSelectedFunctions([]);
                        } else {
                          setSelectedFunctions([...functions]);
                        }
                      }}
                    />
                    All Functions
                  </label>
                </div>
                {functions.map((fnName) => (
                  <div key={fnName} className="function-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFunctions.includes(fnName)}
                        onChange={() => toggleFunctionSelection(fnName)}
                      />
                      {fnName}
                    </label>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="transfer-actions">
          <div className="single-transfer">
            <label>Transfer Single Function</label>
            <div className="single-transfer-row">
              <select
                value={selectedFunction}
                onChange={(e) => setSelectedFunction(e.target.value)}
                disabled={functions.length === 0}
              >
                <option value="">-- Select function --</option>
                {functions.map((fn) => (
                  <option key={fn} value={fn}>
                    {fn}
                  </option>
                ))}
              </select>
              <button
                className="transfer-button secondary"
                onClick={handleTransferSingle}
                disabled={
                  !mongoDatabase || !selectedFunction || !couchbaseBucket || loading.transferSingle
                }
              >
                {loading.transferSingle ? 'Transferring...' : 'Transfer Single'}
              </button>
            </div>
          </div>

          <div className="bulk-transfer">
            <button
              className="transfer-button primary"
              onClick={handleTransferAll}
              disabled={
                !mongoDatabase ||
                !couchbaseBucket ||
                selectedFunctions.length === 0 ||
                loading.transferAll
              }
            >
              {loading.transferAll
                ? `Transferring (${selectedFunctions.length})...`
                : `Transfer All Selected (${selectedFunctions.length})`}
                
            </button>
            {/* <FunctionProgressbar/> */}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="status-messages">
        {statusMessage && <div className="status-message success">{statusMessage}</div>}
        {errorMessage && <div className="status-message error">{errorMessage}</div>}
      </div>

      <FunctionProgressbar/>
    </div>
  );
}
