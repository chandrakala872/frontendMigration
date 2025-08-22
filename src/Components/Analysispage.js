// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useAuth0 } from '@auth0/auth0-react';
// // import { useNavigate } from 'react-router-dom';
// //  import './Analysispage.css';

// // const API_BASE = 'http://localhost:8080/api/transfer';

// // const AnalysisPage = () => {
// //   const { getAccessTokenSilently } = useAuth0();
// //   const navigate = useNavigate();

// //   const [metadata, setMetadata] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   const getAuthHeader = async () => {
// //     const token = await getAccessTokenSilently();
// //     return { Authorization: `Bearer ${token}` };
// //   };

// //   const fetchMetadata = async () => {
// //     try {
// //       const headers = await getAuthHeader();
// //       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
// //       setMetadata(response.data);
// //     } catch (err) {
// //       setError('Failed to fetch MongoDB metadata');
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const verifyConnections = async () => {
// //       const mongoUri = sessionStorage.getItem('mongoUri');
// //       const couchUri = sessionStorage.getItem('couchUri');
      
// //       if (!mongoUri || !couchUri) {
// //         navigate('/');
// //         return;
// //       }
      
// //       await fetchMetadata();
// //     };

// //     verifyConnections();
// //   }, [navigate]);

// //   if (loading) {
// //     return <div className="loading-container">Loading metadata...</div>;
// //   }

// //   if (error) {
// //     return <div className="error-container">{error}</div>;
// //   }

// //   return (
// //     <div className="metadata-container">
// //       {/* <h2>MongoDB Storage Analysis</h2> */}
// //       {/* <p className="analysis-description">
// //         This analysis shows the difference between your logical data size and actual storage usage.
// //       </p> */}
      
// //       <div className="metadata-summary">
// //         <div className="summary-card">
// //           <h3>Databases</h3>
// //           <p>{metadata.totalDatabases}</p>
// //         </div>
        
// //         <div className="summary-card">
// //           <h3>Collections</h3>
// //           <p>{metadata.totalCollections}</p>
// //         </div>
        
// //         <div className="summary-card">
// //           <h3>Documents</h3>
// //           <p>{metadata.totalDocuments.toLocaleString()}</p>
// //         </div>
// //       </div>

// //       <div className="storage-metrics">
// //         <div className="metric-row">
// //           <div className="metric-card">
// //             <h4>Logical Data Size</h4>
// //             <p>{metadata.logicalDataSize}</p>
// //             {/* <p className="metric-description">Uncompressed data size</p> */}
// //           </div>
          
// //           <div className="metric-card">
// //             <h4>Storage Size</h4>
// //             <p>{metadata.storageSize}</p>
// //             {/* <p className="metric-description">Actual disk usage</p> */}
// //           </div>
// //         </div>

// //         <div className="metric-row">
// //           {/* <div className="metric-card">
// //             <h4>Index Size</h4>
// //             <p>{metadata.indexSize}</p>
// //             <p className="metric-description">Space used by indexes</p>
// //           </div> */}
          
// //           {/* <div className="metric-card">
// //             <h4>Compression Ratio</h4>
// //             <p>{metadata.compressionRatio}x</p>
// //             <p className="metric-description">Higher is better</p>
// //           </div> */}
// //         </div>
// //       </div>

// //       <div className="navigation-buttons">
// //         <button onClick={() => navigate('/collections')} className="proceed-button">
// //           Proceed to Migration
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AnalysisPage;

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useAuth0 } from '@auth0/auth0-react';
// // import { useNavigate } from 'react-router-dom';
// // import './Analysispage.css';

// // const API_BASE = 'http://localhost:8080/api/transfer';

// // const AnalysisPage = () => {
// //   const { getAccessTokenSilently } = useAuth0();
// //   const navigate = useNavigate();

// //   const [metadata, setMetadata] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   const getAuthHeader = async () => {
// //     const token = await getAccessTokenSilently();
// //     return { Authorization: `Bearer ${token}` };
// //   };

// //   const fetchMetadata = async () => {
// //     try {
// //       const headers = await getAuthHeader();
// //       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
// //       setMetadata(response.data);
// //     } catch (err) {
// //       setError('Failed to fetch MongoDB metadata');
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const verifyConnections = async () => {
// //       const mongoUri = sessionStorage.getItem('mongoUri');
// //       const couchUri = sessionStorage.getItem('couchUri');
      
// //       if (!mongoUri || !couchUri) {
// //         navigate('/');
// //         return;
// //       }
      
// //       await fetchMetadata();
// //     };

// //     verifyConnections();
// //   }, [navigate]);

// //   if (loading) {
// //     return <div className="loading-container">Loading metadata...</div>;
// //   }

// //   if (error) {
// //     return <div className="error-container">{error}</div>;
// //   }

// //   return (
// //     <div className="analysis-container">
// //       <h1 className="analysis-header">Schema Analysis Page</h1>
      
// //       <div className="summary-row">
// //         <div className="summary-card">
// //           <h3>Databases</h3>
// //           <p>{metadata.totalDatabases}</p>
// //         </div>
        
// //         <div className="summary-card">
// //           <h3>Collections</h3>
// //           <p>{metadata.totalCollections}</p>
// //         </div>
        
// //         <div className="summary-card">
// //           <h3>Documents</h3>
// //           <p>{metadata.totalDocuments.toLocaleString()}</p>
// //         </div>
// //       </div>

// //       <div className="data-size-container">
// //         {/* <h2 className="data-size-header">Data Size</h2> */}
// //         <div className="metric-row">
// //           <div className="metric-card">
// //             <h4>Logical Data Size</h4>
// //             <p>{metadata.logicalDataSize}</p>
// //           </div>
          
// //           <div className="metric-card">
// //             <h4>Storage Size</h4>
// //             <p>{metadata.storageSize}</p>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="navigation-buttons">
// //         <button onClick={() => navigate('/collections')} className="proceed-button">
// //           Proceed to Migration
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AnalysisPage;

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useAuth0 } from '@auth0/auth0-react';
// // import { useNavigate } from 'react-router-dom';
// // import './Analysispage.css';

// // const API_BASE = 'http://localhost:8080/api/transfer';

// // const AnalysisPage = () => {
// //   const { getAccessTokenSilently } = useAuth0();
// //   const navigate = useNavigate();

// //   const [metadata, setMetadata] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   const getAuthHeader = async () => {
// //     const token = await getAccessTokenSilently();
// //     return { Authorization: `Bearer ${token}` };
// //   };

// //   const fetchMetadata = async () => {
// //     try {
// //       const headers = await getAuthHeader();
// //       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
// //       setMetadata(response.data);
// //     } catch (err) {
// //       setError('Failed to fetch MongoDB metadata');
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const verifyConnections = async () => {
// //       const mongoUri = sessionStorage.getItem('mongoUri');
// //       const couchUri = sessionStorage.getItem('couchUri');
      
// //       if (!mongoUri || !couchUri) {
// //         navigate('/');
// //         return;
// //       }
      
// //       await fetchMetadata();
// //     };

// //     verifyConnections();
// //   }, [navigate]);

// //   if (loading) {
// //     return <div className="loading-container">Loading metadata...</div>;
// //   }

// //   if (error) {
// //     return <div className="error-container">{error}</div>;
// //   }

// //   return (
// //     <div className="analysis-container">
// //       {/* <h1 className="analysis-header">Schema Analysis Page</h1> */}
      
// //       <div className="summary-row">
// //         <div className="summary-card">
// //           <h3>Databases</h3>
// //           <p>{metadata.totalDatabases}</p>
// //         </div>
        
// //         <div className="summary-card">
// //           <h3>Collections</h3>
// //           <p>{metadata.totalCollections}</p>
// //         </div>
        
// //         <div className="summary-card">
// //           <h3>Documents</h3>
// //           <p>{metadata.totalDocuments.toLocaleString()}</p>
// //         </div>
// //       </div>

// //       <div className="data-size-container">
// //         {/* <h2 className="data-size-header">Data Size</h2> */}
// //         <div className="summary-row">
// //           <div className="summary-card">
// //             <h4>Logical Data Size</h4>
// //             <p>{metadata.logicalDataSize}</p>
// //           </div>
          
// //           <div className="summary-card">
// //             <h4>Storage Size</h4>
// //             <p>{metadata.storageSize}</p>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="navigation-buttons">
// //         <button onClick={() => navigate('/collections')} className="proceed-button">
// //           Proceed to Migration
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AnalysisPage;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from 'react-router-dom';
// import './Analysispage.css';

// const API_BASE = 'http://localhost:8080/api/transfer';
// const REFRESH_INTERVAL = 5000; // Refresh every 5 seconds

// const AnalysisPage = () => {
//   const { getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   const [metadata, setMetadata] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState('');

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   const fetchMetadata = async () => {
//     try {
//       const headers = await getAuthHeader();
//       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
//       setMetadata(response.data);
//       setLastUpdated(new Date().toLocaleTimeString());
//     } catch (err) {
//       setError('Failed to fetch MongoDB metadata');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const verifyConnections = async () => {
//       const mongoUri = sessionStorage.getItem('mongoUri');
//       const couchUri = sessionStorage.getItem('couchUri');
      
//       if (!mongoUri || !couchUri) {
//         navigate('/');
//         return;
//       }
      
//       await fetchMetadata();
//     };

//     verifyConnections();

//     // Set up auto-refresh
//     const intervalId = setInterval(fetchMetadata, REFRESH_INTERVAL);

//     // Clean up interval on component unmount
//     return () => clearInterval(intervalId);
//   }, [navigate]);

//   if (loading) {
//     return <div className="loading-container">Loading metadata...</div>;
//   }

//   if (error) {
//     return <div className="error-container">{error}</div>;
//   }

//   return (
//     <div className="analysis-container">
//       <div className="summary-row">
//         <div className="summary-card">
//           <h3>Databases</h3>
//           <p>{metadata.totalDatabases}</p>
//           {/* <small>Updated: {lastUpdated}</small> */}
//         </div>
        
//         <div className="summary-card">
//           <h3>Collections</h3>
//           <p>{metadata.totalCollections}</p>
//           {/* <small>Updated: {lastUpdated}</small> */}
//         </div>
        
//         <div className="summary-card">
//           <h3>Documents</h3>
//           <p>{metadata.totalDocuments.toLocaleString()}</p>
//           {/* <small>Updated: {lastUpdated}</small> */}
//         </div>
//       </div>

//       <div className="data-size-container">
//         <div className="summary-row">
//           <div className="summary-card">
//             <h4>Logical Data Size</h4>
//             <p>{metadata.logicalDataSize}</p>
//             {/* <small>Updated: {lastUpdated}</small> */}
//           </div>
          
//           <div className="summary-card">
//             <h4>Storage Size</h4>
//             <p>{metadata.storageSize}</p>
//             {/* <small>Updated: {lastUpdated}</small> */}
//           </div>
//         </div>
//       </div>

//       <div className="navigation-buttons">
//         <button onClick={() => navigate('/collections')} className="proceed-button">
//           Proceed to Migration
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AnalysisPage;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from 'react-router-dom';
//  import './Analysispage.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const AnalysisPage = () => {
//   const { getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   const [metadata, setMetadata] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   const fetchMetadata = async () => {
//     try {
//       const headers = await getAuthHeader();
//       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
//       setMetadata(response.data);
//     } catch (err) {
//       setError('Failed to fetch MongoDB metadata');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const verifyConnections = async () => {
//       const mongoUri = sessionStorage.getItem('mongoUri');
//       const couchUri = sessionStorage.getItem('couchUri');
      
//       if (!mongoUri || !couchUri) {
//         navigate('/');
//         return;
//       }
      
//       await fetchMetadata();
//     };

//     verifyConnections();
//   }, [navigate]);

//   if (loading) {
//     return <div className="loading-container">Loading metadata...</div>;
//   }

//   if (error) {
//     return <div className="error-container">{error}</div>;
//   }

//   return (
//     <div className="metadata-container">
//       {/* <h2>MongoDB Storage Analysis</h2> */}
//       {/* <p className="analysis-description">
//         This analysis shows the difference between your logical data size and actual storage usage.
//       </p> */}
      
//       <div className="metadata-summary">
//         <div className="summary-card">
//           <h3>Databases</h3>
//           <p>{metadata.totalDatabases}</p>
//         </div>
        
//         <div className="summary-card">
//           <h3>Collections</h3>
//           <p>{metadata.totalCollections}</p>
//         </div>
        
//         <div className="summary-card">
//           <h3>Documents</h3>
//           <p>{metadata.totalDocuments.toLocaleString()}</p>
//         </div>
//       </div>

//       <div className="storage-metrics">
//         <div className="metric-row">
//           <div className="metric-card">
//             <h4>Logical Data Size</h4>
//             <p>{metadata.logicalDataSize}</p>
//             {/* <p className="metric-description">Uncompressed data size</p> */}
//           </div>
          
//           <div className="metric-card">
//             <h4>Storage Size</h4>
//             <p>{metadata.storageSize}</p>
//             {/* <p className="metric-description">Actual disk usage</p> */}
//           </div>
//         </div>

//         <div className="metric-row">
//           {/* <div className="metric-card">
//             <h4>Index Size</h4>
//             <p>{metadata.indexSize}</p>
//             <p className="metric-description">Space used by indexes</p>
//           </div> */}
          
//           {/* <div className="metric-card">
//             <h4>Compression Ratio</h4>
//             <p>{metadata.compressionRatio}x</p>
//             <p className="metric-description">Higher is better</p>
//           </div> */}
//         </div>
//       </div>

//       <div className="navigation-buttons">
//         <button onClick={() => navigate('/collections')} className="proceed-button">
//           Proceed to Migration
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AnalysisPage;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from 'react-router-dom';
// import './Analysispage.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const AnalysisPage = () => {
//   const { getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   const [metadata, setMetadata] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   const fetchMetadata = async () => {
//     try {
//       const headers = await getAuthHeader();
//       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
//       setMetadata(response.data);
//     } catch (err) {
//       setError('Failed to fetch MongoDB metadata');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const verifyConnections = async () => {
//       const mongoUri = sessionStorage.getItem('mongoUri');
//       const couchUri = sessionStorage.getItem('couchUri');
      
//       if (!mongoUri || !couchUri) {
//         navigate('/');
//         return;
//       }
      
//       await fetchMetadata();
//     };

//     verifyConnections();
//   }, [navigate]);

//   if (loading) {
//     return <div className="loading-container">Loading metadata...</div>;
//   }

//   if (error) {
//     return <div className="error-container">{error}</div>;
//   }

//   return (
//     <div className="analysis-container">
//       <h1 className="analysis-header">Schema Analysis Page</h1>
      
//       <div className="summary-row">
//         <div className="summary-card">
//           <h3>Databases</h3>
//           <p>{metadata.totalDatabases}</p>
//         </div>
        
//         <div className="summary-card">
//           <h3>Collections</h3>
//           <p>{metadata.totalCollections}</p>
//         </div>
        
//         <div className="summary-card">
//           <h3>Documents</h3>
//           <p>{metadata.totalDocuments.toLocaleString()}</p>
//         </div>
//       </div>

//       <div className="data-size-container">
//         {/* <h2 className="data-size-header">Data Size</h2> */}
//         <div className="metric-row">
//           <div className="metric-card">
//             <h4>Logical Data Size</h4>
//             <p>{metadata.logicalDataSize}</p>
//           </div>
          
//           <div className="metric-card">
//             <h4>Storage Size</h4>
//             <p>{metadata.storageSize}</p>
//           </div>
//         </div>
//       </div>

//       <div className="navigation-buttons">
//         <button onClick={() => navigate('/collections')} className="proceed-button">
//           Proceed to Migration
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AnalysisPage;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import { useNavigate } from 'react-router-dom';
// import './Analysispage.css';

// const API_BASE = 'http://localhost:8080/api/transfer';

// const AnalysisPage = () => {
//   const { getAccessTokenSilently } = useAuth0();
//   const navigate = useNavigate();

//   const [metadata, setMetadata] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const getAuthHeader = async () => {
//     const token = await getAccessTokenSilently();
//     return { Authorization: `Bearer ${token}` };
//   };

//   const fetchMetadata = async () => {
//     try {
//       const headers = await getAuthHeader();
//       const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
//       setMetadata(response.data);
//     } catch (err) {
//       setError('Failed to fetch MongoDB metadata');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const verifyConnections = async () => {
//       const mongoUri = sessionStorage.getItem('mongoUri');
//       const couchUri = sessionStorage.getItem('couchUri');
      
//       if (!mongoUri || !couchUri) {
//         navigate('/');
//         return;
//       }
      
//       await fetchMetadata();
//     };

//     verifyConnections();
//   }, [navigate]);

//   if (loading) {
//     return <div className="loading-container">Loading metadata...</div>;
//   }

//   if (error) {
//     return <div className="error-container">{error}</div>;
//   }

//   return (
//     <div className="analysis-container">
//       {/* <h1 className="analysis-header">Schema Analysis Page</h1> */}
      
//       <div className="summary-row">
//         <div className="summary-card">
//           <h3>Databases</h3>
//           <p>{metadata.totalDatabases}</p>
//         </div>
        
//         <div className="summary-card">
//           <h3>Collections</h3>
//           <p>{metadata.totalCollections}</p>
//         </div>
        
//         <div className="summary-card">
//           <h3>Documents</h3>
//           <p>{metadata.totalDocuments.toLocaleString()}</p>
//         </div>
//       </div>

//       <div className="data-size-container">
//         {/* <h2 className="data-size-header">Data Size</h2> */}
//         <div className="summary-row">
//           <div className="summary-card">
//             <h4>Logical Data Size</h4>
//             <p>{metadata.logicalDataSize}</p>
//           </div>
          
//           <div className="summary-card">
//             <h4>Storage Size</h4>
//             <p>{metadata.storageSize}</p>
//           </div>
//         </div>
//       </div>

//       <div className="navigation-buttons">
//         <button onClick={() => navigate('/collections')} className="proceed-button">
//           Proceed to Migration
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AnalysisPage;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Analysispage.css';

const API_BASE = 'http://localhost:8080/api/transfer';
const REFRESH_INTERVAL = 5000; // Refresh every 5 seconds

const AnalysisPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const getAuthHeader = async () => {
    const token = await getAccessTokenSilently();
    return { Authorization: `Bearer ${token}` };
  };

  const fetchMetadata = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${API_BASE}/metadata/mongo`, { headers });
      setMetadata(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch MongoDB metadata');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyConnections = async () => {
      const mongoUri = sessionStorage.getItem('mongoUri');
      const couchUri = sessionStorage.getItem('couchUri');
      
      if (!mongoUri || !couchUri) {
        navigate('/');
        return;
      }
      
      await fetchMetadata();
    };

    verifyConnections();

    // Set up auto-refresh
    const intervalId = setInterval(fetchMetadata, REFRESH_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  if (loading) {
    return <div className="loading-container">Loading metadata...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="analysis-container">
      <div className="summary-row">
        <div className="summary-card">
          <h3>Databases</h3>
          <p>{metadata.totalDatabases}</p>
          {/* <small>Updated: {lastUpdated}</small> */}
        </div>
        
        <div className="summary-card">
          <h3>Collections</h3>
          <p>{metadata.totalCollections}</p>
          {/* <small>Updated: {lastUpdated}</small> */}
        </div>
        
        <div className="summary-card">
          <h3>Documents</h3>
          <p>{metadata.totalDocuments.toLocaleString()}</p>
          {/* <small>Updated: {lastUpdated}</small> */}
        </div>
      </div>

      <div className="data-size-container">
        <div className="summary-row">
          <div className="summary-card">
            <h4>Logical Data Size</h4>
            <p>{metadata.logicalDataSize}</p>
            {/* <small>Updated: {lastUpdated}</small> */}
          </div>
          
          <div className="summary-card">
            <h4>Storage Size</h4>
            <p>{metadata.storageSize}</p>
            {/* <small>Updated: {lastUpdated}</small> */}
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button onClick={() => navigate('/collections')} className="proceed-button">
          Proceed to Migration
        </button>
      </div>
    </div>
  );
};

export default AnalysisPage;