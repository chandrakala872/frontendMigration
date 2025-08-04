


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from 'react-router-dom';
// import './Conectiondb.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const fileToBase64 = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result.split(',')[1]); // remove prefix
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// };

// const prependAll = (arr) => {
//   if (!Array.isArray(arr)) return ['All'];
//   return ['All', ...arr];
// };

// const MigrationConnection = () => {
//   const { getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   // --- Mongo state ---
//   const [mongoCert, setMongoCert] = useState(null);
//   const [mongoUri, setMongoUri] = useState('');
//   const [mongoConnected, setMongoConnected] = useState(false);

//   // --- Mongo Metadata ---
//   const [mongoMetadata, setMongoMetadata] = useState(null);
//   const [loadingMetadata, setLoadingMetadata] = useState(false);
//   const [metadataError, setMetadataError] = useState(null);

//   // --- Couchbase state ---
//   const [couchCert, setCouchCert] = useState(null);
//   const [couchUri, setCouchUri] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [bucketName, setBucketName] = useState('');
//   const [couchConnected, setCouchConnected] = useState(false);

//   const [error, setError] = useState(null);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   // === Mongo connect ===
//   const uploadMongoCert = async () => {
//     const headers = await getAuthHeader();
//     const formData = new FormData();
//     formData.append('certificate', mongoCert);
//     await axios.post(`${API_BASE}/upload/mongo-certificate`, formData, { headers });
//   };

//   const connectMongo = async () => {
//     const headers = await getAuthHeader();
//     await axios.post(`${API_BASE}/connect-mongo`, { uri: mongoUri }, { headers });
//     setMongoConnected(true);
//   };

  

//   const handleMongoSetup = async () => {
//   if (!mongoCert || !mongoUri) {
//     setError('MongoDB certificate and URI are required');
//     return;
//   }
//   try {
//     await uploadMongoCert();
//     await connectMongo();

//     // Convert cert to base64
//     const mongoCertBase64 = await fileToBase64(mongoCert);

//     // Store in session storage
//     sessionStorage.setItem('mongoUri', mongoUri);
//     sessionStorage.setItem('mongoCert', mongoCertBase64);

//     console.log('MongoDB Details Saved:', { mongoUri, mongoCertBase64 });
//   } catch {
//     setError('MongoDB connection failed');
//   }
// };


//   // === Fetch Mongo Metadata ===
//   const fetchMongoMetadata = async () => {
//     setLoadingMetadata(true);
//     setMetadataError(null);
//     try {
//       const headers = await getAuthHeader();
//       const res = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
//       setMongoMetadata(res.data);
//     } catch {
//       setMetadataError('Failed to fetch MongoDB metadata');
//     } finally {
//       setLoadingMetadata(false);
//     }
//   };

//   const downloadMongoMetadata = () => {
//     if (!mongoMetadata) return;
//     const blob = new Blob([JSON.stringify(mongoMetadata, null, 2)], {
//       type: 'application/json',
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'mongo_metadata.json';
//     a.click();
//     URL.revokeObjectURL(url);
//   };



//   useEffect(() => {
//     if (mongoConnected) {
//       fetchMongoMetadata();
//     }
//   }, [mongoConnected]);

//   // === Couchbase connect ===
//   const uploadCouchCert = async () => {
//     const headers = await getAuthHeader();
//     const formData = new FormData();
//     formData.append('certificate', couchCert);
//     await axios.post(`${API_BASE}/upload/couchbase-certificate`, formData, { headers });
//   };

//   const connectCouchbase = async () => {
//     const headers = await getAuthHeader();
//     await axios.post(
//       `${API_BASE}/connect-couchbase`,
//       { connectionString: couchUri, username, password, bucketName },
//       { headers }
//     );
//     setCouchConnected(true);
//   };

//  const handleCouchSetup = async () => {
//   if (!couchCert || !couchUri || !username || !password || !bucketName) {
//     setError('All Couchbase fields are required');
//     return;
//   }
//   try {
//     await uploadCouchCert();
//     await connectCouchbase();

//     // Convert cert to base64
//     const couchCertBase64 = await fileToBase64(couchCert);

//     // Store in session storage
//     sessionStorage.setItem('couchUri', couchUri);
//     sessionStorage.setItem('couchCert', couchCertBase64);
//     sessionStorage.setItem('username', username);
//     sessionStorage.setItem('password', password);
//     sessionStorage.setItem('bucketName', bucketName);

//     console.log('Couchbase Details Saved:', {
//       couchUri,
//       couchCertBase64,
//       username,
//       password,
//       bucketName
//     });
//   } catch {
//     setError('Couchbase connection failed');
//   }
// };


//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 20 }}>
//       <div style={{ display: 'flex', gap: 20 }}>
//         {/* MongoDB */}
//         <div style={{ flex: 1, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
//           <h3>MongoDB Connection</h3>
//           <input type="file" accept=".pem,.crt" onChange={(e) => setMongoCert(e.target.files[0])} disabled={mongoConnected} />
//           <input type="text" placeholder="MongoDB URI" value={mongoUri} onChange={(e) => setMongoUri(e.target.value)} disabled={mongoConnected} style={{ width: '100%', marginTop: 8 }} />
//           <button onClick={handleMongoSetup} disabled={mongoConnected} style={{ marginTop: 8 }}>
//             {mongoConnected ? ' Connected' : 'Upload & Connect'}
//           </button>

//           {/* Metadata Section */}
//           {mongoConnected && (
//             <div style={{ marginTop: 20 }}>
//               <h4>MongoDB Metadata</h4>
//               {loadingMetadata && <p>Loading metadata...</p>}
//               {metadataError && <p style={{ color: 'red' }}>{metadataError}</p>}
//               {mongoMetadata && (
//                 <>
//                   <pre style={{ background: '#f4f4f4', padding: 10, maxHeight: 200, overflow: 'auto' }}>
//                     {JSON.stringify(mongoMetadata, null, 2)}
//                   </pre>
//                   <button
//                     style={{
//                       padding: '6px 12px',
//                       marginTop: 8,
//                       background: '#28a745',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: 4,
//                       cursor: 'pointer',
//                     }}
//                     onClick={downloadMongoMetadata}
//                   >
//                      Download Metadata
//                   </button>
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Couchbase */}
//         <div style={{ flex: 1, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
//           <h3>Couchbase Connection</h3>
//           <input type="file" accept=".pem,.crt" onChange={(e) => setCouchCert(e.target.files[0])} disabled={couchConnected} />
//           <input type="text" placeholder="couchbases://127.0.0.1" value={couchUri} onChange={(e) => setCouchUri(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
//           <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
//           <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
//           <input type="text" placeholder="Bucket Name" value={bucketName} onChange={(e) => setBucketName(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
//           <button onClick={handleCouchSetup} disabled={couchConnected} style={{ marginTop: 8 }}>
//             {couchConnected ? ' Connected' : 'Upload & Connect'}
//           </button>
//         </div>
//       </div>

//       {/* Error */}
//       {error && <div style={{ color: 'red', width: '100%' }}>{error}</div>}

//       {/* Navigation Buttons */}
//       {mongoConnected && couchConnected && (
//         <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
//           <button style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => navigate('/collections')}>
//              Migrate Collections
//           </button>
//           <button style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => navigate('/functions')}>
//              Migrate Functions
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MigrationConnection;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Conectiondb.css';

const API_BASE = 'http://localhost:8080/api/transfer';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // remove prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const prependAll = (arr) => {
  if (!Array.isArray(arr)) return ['All'];
  return ['All', ...arr];
};

const MigrationConnection = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  // --- Mongo state ---
  const [mongoCert, setMongoCert] = useState(null);
  const [mongoUri, setMongoUri] = useState('');
  const [mongoConnected, setMongoConnected] = useState(false);

  // --- Mongo Metadata ---
  const [mongoMetadata, setMongoMetadata] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  // --- Couchbase state ---
  const [couchCert, setCouchCert] = useState(null);
  const [couchUri, setCouchUri] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [couchConnected, setCouchConnected] = useState(false);

  const [error, setError] = useState(null);

  const getAuthHeader = async () => {
    const token = await getAccessTokenSilently();
    return { Authorization: `Bearer ${token}` };
  };

  // === Mongo connect ===
  const uploadMongoCert = async () => {
    const headers = await getAuthHeader();
    const formData = new FormData();
    formData.append('certificate', mongoCert);
    await axios.post(`${API_BASE}/upload/mongo-certificate`, formData, { headers });
  };

  const connectMongo = async () => {
    const headers = await getAuthHeader();
    await axios.post(`${API_BASE}/connect-mongo`, { uri: mongoUri }, { headers });
    setMongoConnected(true);
  };

  const handleMongoSetup = async () => {
    if (!mongoCert || !mongoUri) {
      setError('MongoDB certificate and URI are required');
      return;
    }
    try {
      await uploadMongoCert();
      await connectMongo();

      // Convert cert to base64
      const mongoCertBase64 = await fileToBase64(mongoCert);

      // Store in session storage
      sessionStorage.setItem('mongoUri', mongoUri);
      sessionStorage.setItem('mongoCert', mongoCertBase64);

      console.log('MongoDB Details Saved:', { mongoUri, mongoCertBase64 });
    } catch {
      setError('MongoDB connection failed');
    }
  };

  // === Fetch Mongo Metadata ===
  const fetchMongoMetadata = async () => {
    setLoadingMetadata(true);
    setMetadataError(null);
    try {
      const headers = await getAuthHeader();
      const res = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
      setMongoMetadata(res.data);
    } catch {
      setMetadataError('Failed to fetch MongoDB metadata');
    } finally {
      setLoadingMetadata(false);
    }
  };

  const downloadMongoMetadata = () => {
    if (!mongoMetadata) return;
    const blob = new Blob([JSON.stringify(mongoMetadata, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mongo_metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (mongoConnected) {
      fetchMongoMetadata();
    }
  }, [mongoConnected]);

  // === Couchbase connect ===
  const uploadCouchCert = async () => {
    const headers = await getAuthHeader();
    const formData = new FormData();
    formData.append('certificate', couchCert);
    await axios.post(`${API_BASE}/upload/couchbase-certificate`, formData, { headers });
  };

  const connectCouchbase = async () => {
    const headers = await getAuthHeader();
    await axios.post(
      `${API_BASE}/connect-couchbase`,
      { connectionString: couchUri, username, password, bucketName },
      { headers }
    );
    setCouchConnected(true);
  };

  const handleCouchSetup = async () => {
    if (!couchCert || !couchUri || !username || !password || !bucketName) {
      setError('All Couchbase fields are required');
      return;
    }
    try {
      await uploadCouchCert();
      await connectCouchbase();

      // Convert cert to base64
      const couchCertBase64 = await fileToBase64(couchCert);

      // Store in session storage
      sessionStorage.setItem('couchUri', couchUri);
      sessionStorage.setItem('couchCert', couchCertBase64);
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('password', password);
      sessionStorage.setItem('bucketName', bucketName);

      console.log('Couchbase Details Saved:', {
        couchUri,
        couchCertBase64,
        username,
        password,
        bucketName
      });
    } catch {
      setError('Couchbase connection failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 20 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        {/* MongoDB */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
          <h3>MongoDB Connection</h3>
          <input type="file" accept=".pem,.crt" onChange={(e) => setMongoCert(e.target.files[0])} disabled={mongoConnected} />
          <input type="text" placeholder="MongoDB URI" value={mongoUri} onChange={(e) => setMongoUri(e.target.value)} disabled={mongoConnected} style={{ width: '100%', marginTop: 8 }} />
          <button onClick={handleMongoSetup} disabled={mongoConnected} style={{ marginTop: 8 }}>
            {mongoConnected ? ' Connected' : 'Upload & Connect'}
          </button>

          {/* Download-only Metadata Section */}
          {mongoMetadata && (
            <div style={{ marginTop: 20 }}>
              <button
                style={{
                  padding: '6px 12px',
                  marginTop: 8,
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={downloadMongoMetadata}
              >
                Download Metadata
              </button>
            </div>
          )}
        </div>

        {/* Couchbase */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
          <h3>Couchbase Connection</h3>
          <input type="file" accept=".pem,.crt" onChange={(e) => setCouchCert(e.target.files[0])} disabled={couchConnected} />
          <input type="text" placeholder="couchbases://127.0.0.1" value={couchUri} onChange={(e) => setCouchUri(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
          <input type="text" placeholder="Bucket Name" value={bucketName} onChange={(e) => setBucketName(e.target.value)} disabled={couchConnected} style={{ width: '100%', marginTop: 8 }} />
          <button onClick={handleCouchSetup} disabled={couchConnected} style={{ marginTop: 8 }}>
            {couchConnected ? ' Connected' : 'Upload & Connect'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div style={{ color: 'red', width: '100%' }}>{error}</div>}

      {/* Navigation Buttons */}
      {mongoConnected && couchConnected && (
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => navigate('/collections')}>
            Migrate Collections
          </button>
          <button style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => navigate('/functions')}>
            Migrate Functions
          </button>
        </div>
      )}
    </div>
  );
};

export default MigrationConnection;
