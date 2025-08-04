import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
//  import './Function.css';

const API_BASE = 'http://localhost:8080/api/transfer';

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
  const [includeSystemFunctions, setIncludeSystemFunctions] = useState(false);
  const [continueOnError, setContinueOnError] = useState(false);

  // UI feedback
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Utility to get token and set common headers
  const getAuthHeaders = useCallback(async () => {
    const token = await getAccessTokenSilently();
    return { Authorization: `Bearer ${token}` };
  }, [getAccessTokenSilently]);

  // Persist couchbase selections in sessionStorage
  useEffect(() => {
    if (couchbaseBucket) sessionStorage.setItem('couchbaseBucket', couchbaseBucket);
  }, [couchbaseBucket]);

  useEffect(() => {
    if (couchbaseScope) sessionStorage.setItem('couchbaseScope', couchbaseScope);
  }, [couchbaseScope]);

  // Fetch MongoDB databases
  const fetchMongoDatabases = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const resp = await axios.get(`${API_BASE}/databases`, { headers });
      if (Array.isArray(resp.data)) {
        setMongoDatabases(resp.data);
      } else {
        setMongoDatabases([]);
      }
    } catch (err) {
      console.warn('Failed to fetch MongoDB databases', err);
      setErrorMessage('Failed to fetch MongoDB databases.');
    }
  }, [getAuthHeaders]);

  // Fetch collections for selected MongoDB database
  useEffect(() => {
    async function doFetchCollections() {
      if (!mongoDatabase) {
        setMongoCollections([]);
        setSelectedCollection('');
        return;
      }
      try {
        const headers = await getAuthHeaders();
        const resp = await axios.get(
          `${API_BASE}/databases/${encodeURIComponent(mongoDatabase)}/collections`,
          { headers }
        );
        if (Array.isArray(resp.data)) {
          setMongoCollections(resp.data);
          setSelectedCollection(resp.data[0] || '');
        } else {
          setMongoCollections([]);
          setSelectedCollection('');
        }
      } catch (err) {
        console.warn('Failed to fetch MongoDB collections', err);
        setErrorMessage('Failed to fetch MongoDB collections.');
        setMongoCollections([]);
      }
    }
    doFetchCollections();
  }, [mongoDatabase, getAuthHeaders]);

  // Fetch MongoDB functions when database or includeSystemFunctions changes
  useEffect(() => {
    async function fetchFunctions() {
      if (!mongoDatabase) {
        setFunctions([]);
        setSelectedFunction('');
        setSelectedFunctions([]);
        return;
      }
      try {
        const headers = await getAuthHeaders();
        const resp = await axios.get(
          `${API_BASE}/mongo-functions?database=${encodeURIComponent(
            mongoDatabase
          )}&includeSystem=${includeSystemFunctions}`,
          { headers }
        );
        if (Array.isArray(resp.data)) {
          const funcNames = resp.data
            .map((fn) => fn.name || fn._id || '')
            .filter(Boolean);
          setFunctions(funcNames);
          setSelectedFunctions(funcNames);
          setSelectedFunction(funcNames[0] || '');
        } else {
          setFunctions([]);
          setSelectedFunctions([]);
          setSelectedFunction('');
        }
      } catch (err) {
        console.warn('Failed to fetch functions', err);
        setErrorMessage(
          'Failed to fetch functions: ' +
            (err?.response?.data?.message || err?.message || 'unknown error')
        );
        setFunctions([]);
      }
    }
    fetchFunctions();
  }, [mongoDatabase, includeSystemFunctions, getAuthHeaders]);

  // Fetch Couchbase buckets
  const fetchCouchbaseBuckets = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const resp = await axios.get(`${API_BASE}/buckets`, { headers });
      const bucketList = Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.data?.buckets)
        ? resp.data.buckets
        : [];
      setCouchbaseBuckets(bucketList);
      if (!couchbaseBucket && bucketList.length) {
        setCouchbaseBucket(bucketList[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch Couchbase buckets', err);
      setErrorMessage('Failed to fetch Couchbase buckets.');
      setCouchbaseBuckets([]);
    }
  }, [getAuthHeaders, couchbaseBucket]);

  // When bucket changes: select it and then fetch scopes from backend
  useEffect(() => {
    async function fetchScopes() {
      if (!couchbaseBucket) {
        setCouchbaseScopes([]);
        setCouchbaseScope('');
        return;
      }
      try {
        const headers = await getAuthHeaders();
        // Notify backend about bucket selection
        await axios.post(
          `${API_BASE}/select-bucket?bucketName=${encodeURIComponent(couchbaseBucket)}`,
          null,
          { headers }
        );
        // Then fetch scopes (via your existing endpoint)
        const res = await axios.get(`${API_BASE}/couchbase-collections`, {
          headers,
          params: { bucketName: couchbaseBucket },
        });
        if (res.data && typeof res.data === 'object') {
          const mapping = res.data;
          const scopeList = Object.keys(mapping);
          setCouchbaseScopes(scopeList);
          const resolvedScope = scopeList[0] || '';
          setCouchbaseScope((prev) => prev || resolvedScope);
        } else {
          setCouchbaseScopes([]);
          setCouchbaseScope('');
        }
      } catch (err) {
        console.warn('Failed to fetch Couchbase scopes', err);
        setErrorMessage('Failed to fetch Couchbase scopes.');
        setCouchbaseScopes([]);
        setCouchbaseScope('');
      }
    }
    fetchScopes();
  }, [couchbaseBucket, getAuthHeaders]);

  // Initial load
  useEffect(() => {
    fetchMongoDatabases();
    fetchCouchbaseBuckets();
  }, [fetchMongoDatabases, fetchCouchbaseBuckets]);

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
      setStatusMessage('Transferring all selected functions...');
      const headers = await getAuthHeaders();
      const payload = {
        mongoDatabase,
        couchbaseBucket,
        couchbaseScope: couchbaseScope || null,
        includeSystemFunctions,
        functionNames: selectedFunctions,
        continueOnError,
      };
      const resp = await axios.post(`${API_BASE}/transfer-functions`, payload, {
        headers,
      });
      setStatusMessage(resp.data || 'All functions transferred successfully.');
    } catch (err) {
      console.warn('Transfer all failed', err);
      setErrorMessage(
        (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
          (err && err.message) ||
          'Transfer failed'
      );
    }
  };

  const handleTransferSingle = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    const cleanedFunction = selectedFunction.trim();
    if (!mongoDatabase || !cleanedFunction || !couchbaseBucket) {
      setErrorMessage('MongoDB database, function, and Couchbase bucket are required.');
      return;
    }
    try {
      setStatusMessage('Transferring single function...');
      const headers = await getAuthHeaders();
      const payload = {
        mongoDatabase,
        functionName: cleanedFunction,
        couchbaseScope: couchbaseScope || null,
      };
      const resp = await axios.post(`${API_BASE}/transfer-function`, payload, {
        headers,
      });
      setStatusMessage(resp.data || 'Function transferred successfully.');
    } catch (err) {
      console.warn('Transfer single failed', err);
      setErrorMessage(
        (err && err.response && (err.response.data?.message || err.response.data?.error)) ||
          (err && err.message) ||
          'Transfer failed'
      );
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 900 }}>
      {/* <h2>Unified Function Transfer</h2> */}

      {/* Connection / Metadata Section */}
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
            <legend>MongoDB</legend>
            <div style={{ marginBottom: 8 }}>
              <label>
                Database:{' '}
                <select
                  value={mongoDatabase}
                  onChange={(e) => setMongoDatabase(e.target.value)}
                  style={{ width: 200 }}
                >
                  <option value="">-- select db --</option>
                  {mongoDatabases.map((db) => (
                    <option key={db} value={db}>
                      {db}
                    </option>
                  ))}
                </select>
              </label>
              {/* <button
                onClick={fetchMongoDatabases}
                style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
              >
                Refresh DBs
              </button> */}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>
                Collection:{' '}
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  style={{ width: 220 }}
                  disabled={mongoCollections.length === 0}
                >
                  <option value="">-- select collection --</option>
                  {mongoCollections.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              {/* <label> */}
                {/* <input
                  type="checkbox"
                  checked={includeSystemFunctions}
                  onChange={(e) => setIncludeSystemFunctions(e.target.checked)}
                />{' '}
                Include System Functions
              </label> */}
              <span style={{ marginLeft: 20 }}>
                {/* <label>
                  <input
                    type="checkbox"
                    checked={continueOnError}
                    onChange={(e) => setContinueOnError(e.target.checked)}
                  />{' '}
                  Continue on Error
                </label> */}
              </span>
            </div>
          </fieldset>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <fieldset style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
            <legend>Couchbase</legend>
            <div style={{ marginBottom: 8 }}>
              <label>
                Bucket:{' '}
                <select
                  value={couchbaseBucket}
                  onChange={(e) => setCouchbaseBucket(e.target.value)}
                  style={{ width: 200 }}
                >
                  <option value="">-- select bucket --</option>
                  {couchbaseBuckets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              {/* <button
                onClick={fetchCouchbaseBuckets}
                style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}
              >
                Refresh Buckets
              </button> */}
            </div>
            <div>
              <label>
                Scope:{' '}
                <select
                  value={couchbaseScope}
                  onChange={(e) => setCouchbaseScope(e.target.value)}
                  style={{ width: 200 }}
                  disabled={couchbaseScopes.length === 0}
                >
                  <option value="">-- select scope --</option>
                  {couchbaseScopes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      {/* Functions list */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 30,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ marginBottom: 6 }}>
            <strong>Available Functions (from DB):</strong>
          </div>
          <div
            style={{
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: 8,
              borderRadius: 4,
            }}
          >
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
        </div>

        <div style={{ minWidth: 260 }}>
          <div style={{ marginBottom: 6 }}>
            <label>
              Single Function:{' '}
              <select
                value={selectedFunction}
                onChange={(e) => setSelectedFunction(e.target.value)}
                disabled={functions.length === 0}
                style={{ width: 200 }}
              >
                <option value="">-- select function --</option>
                {functions.map((fn) => (
                  <option key={fn} value={fn}>
                    {fn}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <button
              onClick={handleTransferSingle}
              style={{ padding: '8px 14px', cursor: 'pointer', marginRight: 10 }}
              disabled={!mongoDatabase || !selectedFunction || !couchbaseBucket}
            >
              Transfer Single Function
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={handleTransferAll}
              style={{ padding: '8px 14px', cursor: 'pointer' }}
              disabled={!mongoDatabase || !couchbaseBucket || selectedFunctions.length === 0}
            >
              Transfer All Selected Functions
            </button>
          </div>
        </div>
      </div>

      {/* Status / Errors */}
      <div style={{ marginTop: 20 }}>
        {statusMessage && <div style={{ color: 'green', marginBottom: 6 }}>{statusMessage}</div>}
        {errorMessage && <div style={{ color: 'red', marginBottom: 6 }}>{errorMessage}</div>}
      </div>
    </div>
  );
}






