// import React, { useState } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const MigrationButton = ({
//   mongoUri,
//   mongoCert,
//   selectedDatabase,
//   selectedMongoCollection,
//   couchbaseUri,
//   couchCert,
//   couchUsername,
//   couchPassword,
//   selectedBucket,
//   selectedScope,
//   selectedCollection,
// }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [error, setError] = useState(null);
//   const [migrationStatus, setMigrationStatus] = useState(null);

//   // Validate required inputs before sending migration request
//   const validateInputs = () => {
//     if (!selectedDatabase || selectedDatabase.trim() === '') {
//       return 'MongoDB database name is required';
//     }
//     if (!selectedMongoCollection || selectedMongoCollection.trim() === '') {
//       return 'MongoDB collection is required';
//     }
//     if (!couchbaseUri || couchbaseUri.trim() === '') {
//       return 'Couchbase URI is required';
//     }
//     if (!selectedBucket || !selectedScope || !selectedCollection) {
//       return 'Couchbase bucket, scope, and collection are required';
//     }
//     return null;
//   };

//   // Handle the migration button click
//   const handleStartMigration = async () => {
//     setError(null);
//     setMigrationStatus(null);

//     const validationError = validateInputs();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setIsMigrating(true);
//     setMigrationStatus('Preparing migration...');

//     try {
//       const token = await getAccessTokenSilently();

//       const payload = {
//         mongoDatabase: selectedDatabase.trim(),
//         mongoCollection: selectedMongoCollection.trim(),
//         bucketName: selectedBucket,
//         scopeName: selectedScope,
//         collectionName: selectedCollection,
//       };

//       console.log('Migration payload:', payload); // for debugging

//       setMigrationStatus('Connecting to databases...');

//       const response = await axios.post(
//         'http://localhost:8080/api/transfer/transfer',
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       setMigrationStatus('Migration completed successfully!');
//       setError(null);
//     } catch (error) {
//       let errorMessage = 'Migration failed';

//       if (error.response) {
//         errorMessage =
//           typeof error.response.data === 'string'
//             ? error.response.data
//             : JSON.stringify(error.response.data) || `Backend error: ${error.response.status}`;
//       } else if (error.request) {
//         errorMessage = 'No response from server';
//       } else {
//         errorMessage = error.message;
//       }

//       setError(errorMessage);
//       setMigrationStatus('Migration failed');
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   return (
//     <div className="migration-controls">
//       <button
//         onClick={handleStartMigration}
//         disabled={isMigrating}
//         className={`migrate-button ${isMigrating ? 'migrating' : ''}`}
//         aria-busy={isMigrating}
//       >
//         {isMigrating ? (
//           <>
//             <span className="spinner" aria-label="Loading"></span> Migrating...
//           </>
//         ) : (
//           'Start Migration'
//         )}
//       </button>

//       {migrationStatus && (
//         <div className={`status-message ${error ? 'error' : ''}`}>{migrationStatus}</div>
//       )}

//       {error && <div className="error-message">{error}</div>}
//     </div>
//   );
// };

// export default MigrationButton;

// import React, { useState } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';

// const MigrationButton = ({
//   mongoUri,
//   mongoCert,
//   selectedDatabase,
//   selectedMongoCollection,
//   couchbaseUri,
//   couchCert,
//   couchUsername,
//   couchPassword,
//   selectedBucket,
//   selectedScope,
//   selectedCollection,
// }) => {
//   const { getAccessTokenSilently } = useAuth0();
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [error, setError] = useState(null);
//   const [migrationStatus, setMigrationStatus] = useState(null);
//   const [progress, setProgress] = useState(0);

  

//   const validateInputs = () => {
//     if (!selectedDatabase?.trim()) return 'MongoDB database name is required';
//     if (!selectedMongoCollection?.trim()) return 'MongoDB collection is required';
//     if (!couchbaseUri?.trim()) return 'Couchbase URI is required';
//     if (!selectedBucket || !selectedScope || !selectedCollection) {
//       return 'Couchbase bucket, scope, and collection are required';
//     }
//     return null;
//   };

//   const handleStartMigration = async () => {
//     setError(null);
//     setMigrationStatus(null);
//     setProgress(0);
//     setIsMigrating(true);

//     try {
//       const validationError = validateInputs();
//       if (validationError) {
//         throw new Error(validationError);
//       }

//       const token = await getAccessTokenSilently();
//       const headers = {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       };

//       const payload = {
//         mongoDatabase: selectedDatabase.trim(),
//         mongoCollection: selectedMongoCollection.trim(),
//         bucketName: selectedBucket,
//         scopeName: selectedScope,
//         collectionName: selectedCollection,
//       };

//       setMigrationStatus('Initializing migration...');

//       // Enhanced with progress tracking
//       const response = await axios.post(
//         'http://localhost:8080/api/transfer/transfer',
//         payload,
//         {
//           headers,
//           onUploadProgress: (progressEvent) => {
//             const percentCompleted = Math.round(
//               (progressEvent.loaded * 100) / (progressEvent.total || 100)
//             );
//             setProgress(percentCompleted);
//             setMigrationStatus(`Transferring data (${percentCompleted}%)...`);
//           }
//         }
//       );

//       setProgress(100);
//       setMigrationStatus('Migration completed successfully!');
      
//       // Optional: Handle response data
//       if (response.data) {
//         console.log('Migration results:', response.data);
//       }

//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 
//                          error.message || 
//                          'Migration failed';
//       setError(errorMessage);
//       setMigrationStatus('Migration failed');
//       setProgress(0);
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   return (
//     <div style={{
//       padding: '1rem',
//       border: '1px solid #e2e8f0',
//       borderRadius: '0.5rem',
//       backgroundColor: '#f8fafc'
//     }}>
//       <button
//         onClick={handleStartMigration}
//         disabled={isMigrating}
//         style={{
//           padding: '0.5rem 1rem',
//           backgroundColor: isMigrating ? '#f59e0b' : '#3b82f6',
//           color: 'white',
//           border: 'none',
//           borderRadius: '0.375rem',
//           cursor: 'pointer',
//           fontWeight: '500',
//           width: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           gap: '0.5rem'
//         }}
//       >
//         {isMigrating ? (
//           <>
//             <span 
//               style={{
//                 display: 'inline-block',
//                 width: '1rem',
//                 height: '1rem',
//                 border: '2px solid rgba(255,255,255,0.3)',
//                 borderTopColor: 'white',
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite'
//               }} 
//               aria-label="Loading"
//             />
//             Migrating... {progress}%
//           </>
//         ) : (
//           'Start Migration'
//         )}
//       </button>

//       {migrationStatus && (
//         <div style={{
//           marginTop: '0.75rem',
//           padding: '0.5rem',
//           borderRadius: '0.375rem',
//           backgroundColor: error ? '#fee2e2' : '#ecfdf5',
//           color: error ? '#dc2626' : '#059669',
//           borderLeft: `4px solid ${error ? '#ef4444' : '#10b981'}`
//         }}>
//           {migrationStatus}
//         </div>
//       )}

//       {error && (
//         <div style={{
//           marginTop: '0.75rem',
//           padding: '0.5rem',
//           color: '#dc2626',
//           backgroundColor: '#fee2e2',
//           borderRadius: '0.375rem'
//         }}>
//           {error}
//         </div>
//       )}

//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MigrationButton;




import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const API_BASE = 'http://localhost:8080/api/transfer';

export default function MigrationButton({
  mongoUri,
  mongoCert,
  selectedDatabase,
  selectedMongoCollection,
  couchbaseUri,
  couchCert,
  couchUsername,
  couchPassword,
  selectedBucket,
  selectedScope,
  selectedCollection,
}) {
  const { getAccessTokenSilently } = useAuth0();
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);

  const validateInputs = () => {
    if (!selectedDatabase || selectedDatabase.trim() === '') {
      return 'MongoDB database name is required';
    }
    if (!selectedMongoCollection || selectedMongoCollection.trim() === '') {
      return 'MongoDB collection is required';
    }
    if (!couchbaseUri || couchbaseUri.trim() === '') {
      return 'Couchbase URI is required';
    }
    if (!selectedBucket || selectedBucket === 'All') {
      return 'Couchbase bucket is required';
    }
    if (!selectedScope || selectedScope === 'All') {
      return 'Couchbase scope is required';
    }
    if (!selectedCollection || selectedCollection === 'All') {
      return 'Couchbase collection is required';
    }
    return null;
  };

  const handleStartMigration = async () => {
    setError(null);
    setMigrationStatus(null);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('Preparing migration...');

    try {
      const token = await getAccessTokenSilently();

      const payload = {
        mongoUri,
        mongoCert,
        mongoDatabase: selectedDatabase.trim(),
        mongoCollection: selectedMongoCollection.trim(),
        couchbaseUri,
        couchCert,
        couchUsername,
        couchPassword,
        bucketName: selectedBucket,
        scopeName: selectedScope,
        collectionName: selectedCollection,
      };

      console.log('Migration payload:', payload);

      await axios.post(`${API_BASE}/transfer`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setMigrationStatus('Migration completed successfully!');
    } catch (err) {
      let errorMessage = 'Migration failed';
      if (err.response) {
        errorMessage =
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data) || `Backend error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setMigrationStatus('Migration failed');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleStartMigration}
        disabled={isMigrating}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          backgroundColor: isMigrating ? '#ccc' : '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: isMigrating ? 'not-allowed' : 'pointer',
        }}
      >
        {isMigrating ? 'Migrating...' : 'Start Migration'}
      </button>

      {migrationStatus && (
        <div style={{ marginTop: 10, color: error ? 'red' : 'green' }}>{migrationStatus}</div>
      )}

      {error && (
        <div style={{ marginTop: 8, color: 'red', whiteSpace: 'pre-wrap' }}>{error}</div>
      )}
    </div>
  );
}
