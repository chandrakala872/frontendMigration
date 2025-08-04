

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
 
const API_BASE = 'http://localhost:8080/api/transfer';
 
export default function TransferAllFunctions() {
  const { getAccessTokenSilently } = useAuth0();
 
  const [mongoDatabase, setMongoDatabase] = useState('');
  const [couchbaseBucket, setCouchbaseBucket] = useState('');
  const [couchbaseScope, setCouchbaseScope] = useState('');
  const [functions, setFunctions] = useState([]);
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const [includeSystemFunctions, setIncludeSystemFunctions] = useState(false);
  const [continueOnError, setContinueOnError] = useState(false);
 
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
 
  // Fetch MongoDB functions based on selected database and includeSystemFunctions flag
  useEffect(() => {
    async function fetchFunctions() {
      if (!mongoDatabase) {
        setFunctions([]);
        setSelectedFunctions([]);
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${API_BASE}/mongo-functions?database=${encodeURIComponent(
            mongoDatabase
          )}&includeSystem=${includeSystemFunctions}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
 
        if (Array.isArray(response.data)) {
          const funcNames = response.data.map((fn) => fn.name || fn._id || '');
          setFunctions(funcNames);
          setSelectedFunctions(funcNames);
        } else {
          setFunctions([]);
          setSelectedFunctions([]);
        }
      } catch (error) {
        setErrorMessage(
          'Failed to fetch functions: ' +
            (error.response?.data?.message || error.message)
        );
      }
    }
    fetchFunctions();
  }, [mongoDatabase, includeSystemFunctions, getAccessTokenSilently]);
 
  const toggleFunctionSelection = (fnName) => {
    setSelectedFunctions((prev) =>
      prev.includes(fnName)
        ? prev.filter((fn) => fn !== fnName)
        : [...prev, fnName]
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
      setStatusMessage('Transferring functions...');
      const token = await getAccessTokenSilently();
 
      const payload = {
        mongoDatabase,
        couchbaseBucket,
        couchbaseScope: couchbaseScope || null,
        includeSystemFunctions,
        functionNames: selectedFunctions,
        continueOnError,
      };
 
      const response = await axios.post(`${API_BASE}/transfer-functions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
 
      setStatusMessage(response.data || 'Functions transferred successfully.');
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Transfer failed'
      );
    }
  };
 
  return (
    <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 6 }}>
      <h3>Transfer All Functions</h3>
      <div style={{ marginBottom: 10 }}>
        <label>
          MongoDB Database:{' '}
          <input
            type="text"
            value={mongoDatabase}
            onChange={(e) => setMongoDatabase(e.target.value)}
            placeholder="e.g., myMongoDb"
            style={{ width: 200 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Couchbase Bucket:{' '}
          <input
            type="text"
            value={couchbaseBucket}
            onChange={(e) => setCouchbaseBucket(e.target.value)}
            placeholder="e.g., myBucket"
            style={{ width: 200 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Couchbase Scope (optional):{' '}
          <input
            type="text"
            value={couchbaseScope}
            onChange={(e) => setCouchbaseScope(e.target.value)}
            placeholder="default_scope"
            style={{ width: 200 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={includeSystemFunctions}
            onChange={(e) => setIncludeSystemFunctions(e.target.checked)}
          />{' '}
          Include System Functions
        </label>
        <span style={{ marginLeft: 20 }}>
          <label>
            <input
              type="checkbox"
              checked={continueOnError}
              onChange={(e) => setContinueOnError(e.target.checked)}
            />{' '}
            Continue on Error
          </label>
        </span>
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ddd', padding: 8, marginBottom: 10 }}>
        {functions.length === 0 && <div>No functions loaded.</div>}
        {functions.map((fnName) => (
          <div key={fnName}>
            <label>
              <input
                type="checkbox"
                checked={selectedFunctions.includes(fnName)}
                onChange={() => toggleFunctionSelection(fnName)}
              />{' '}
              {fnName}
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleTransferAll} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Transfer Selected Functions
      </button>
      {statusMessage && <div style={{ marginTop: 10, color: 'green' }}>{statusMessage}</div>}
      {errorMessage && <div style={{ marginTop: 10, color: 'red' }}>{errorMessage}</div>}
    </div>
  );
}