
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
 
const API_BASE = 'http://localhost:8080/api/transfer';
 
export default function TransferSingleFunction() {
  const { getAccessTokenSilently } = useAuth0();
 
  const [mongoDatabase, setMongoDatabase] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [functions, setFunctions] = useState([]);
 
  const [couchbaseScope, setCouchbaseScope] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
 
  // Fetch functions when mongoDatabase changes
  useEffect(() => {
    async function fetchFunctions() {
      if (!mongoDatabase) {
        setFunctions([]);
        setFunctionName('');
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${API_BASE}/mongo-functions?database=${encodeURIComponent(mongoDatabase)}&includeSystem=false`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
 
        if (Array.isArray(response.data)) {
          const funcNames = response.data.map((fn) => fn.name || fn._id || '');
          setFunctions(funcNames);
          setFunctionName(funcNames[0] || '');
        } else {
          setFunctions([]);
          setFunctionName('');
        }
      } catch (error) {
        setErrorMessage(
          'Failed to fetch functions: ' +
            (error.response?.data?.message || error.message)
        );
      }
    }
    fetchFunctions();
  }, [mongoDatabase, getAccessTokenSilently]);
 
  const handleTransferSingle = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    if (!mongoDatabase || !functionName) {
      setErrorMessage('Please select MongoDB database and function name.');
      return;
    }
    try {
      setStatusMessage('Transferring function...');
      const token = await getAccessTokenSilently();
 
      const payload = {
        mongoDatabase,
        functionName,
        couchbaseScope: couchbaseScope || null,
      };
 
      const response = await axios.post(`${API_BASE}/transfer-function`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
 
      setStatusMessage(response.data || 'Function transferred successfully.');
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
    <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 6, marginTop: 20 }}>
      <h3>Transfer Single Function</h3>
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
          Function Name:{' '}
          <select
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            style={{ width: 220 }}
            disabled={functions.length === 0}
          >
            {functions.length === 0 && <option value="">-- No functions --</option>}
            {functions.map((fnName) => (
              <option key={fnName} value={fnName}>
                {fnName}
              </option>
            ))}
          </select>
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
      <button onClick={handleTransferSingle} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Transfer Function
      </button>
      {statusMessage && <div style={{ marginTop: 10, color: 'green' }}>{statusMessage}</div>}
      {errorMessage && <div style={{ marginTop: 10, color: 'red' }}>{errorMessage}</div>}
    </div>
  );
}
 