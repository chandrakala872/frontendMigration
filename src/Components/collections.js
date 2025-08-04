
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api/transfer';
const STORAGE_KEY = 'migration_connection_details';

const MetadataView = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [mongoDatabases, setMongoDatabases] = useState([]);
  const [mongoCollections, setMongoCollections] = useState({});
  const [couchCollections, setCouchCollections] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  };

  const normalizeCouchCollections = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw) && raw.every((c) => c.scopeName && c.collectionName)) {
      return raw.map((c) => ({
        scopeName: c.scopeName,
        collectionName: c.collectionName,
        fields: Array.isArray(c.fields) ? c.fields : [],
      }));
    }
    if (raw.scopes && Array.isArray(raw.scopes)) {
      const result = [];
      for (const scope of raw.scopes) {
        const scopeName = scope.name || scope.scopeName || 'default';
        if (Array.isArray(scope.collections)) {
          for (const coll of scope.collections) {
            result.push({
              scopeName,
              collectionName: coll.name || coll.collectionName || 'unknown',
              fields: Array.isArray(coll.fields) ? coll.fields : [],
            });
          }
        }
      }
      if (result.length) return result;
    }
    // fallback deep extract
    const extract = (node) => {
      if (!node || typeof node !== 'object') return [];
      if (Array.isArray(node)) return node.flatMap(extract);
      if ((node.name || node.scopeName) && Array.isArray(node.collections)) {
        const scp = node.name || node.scopeName;
        return node.collections.flatMap((coll) => ({
          scopeName: scp,
          collectionName: coll.name || coll.collectionName || 'unknown',
          fields: Array.isArray(coll.fields) ? coll.fields : [],
        }));
      }
      if (node.scopes) return extract(node.scopes);
      return Object.values(node).flatMap(extract);
    };
    const fallback = extract(raw);
    if (fallback.length) return fallback;
    return [];
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const saved = getSaved();
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        // Mongo fetch
        const dbRes = await axios.get(`${API_BASE}/databases`, { headers });
        const dbs = Array.isArray(dbRes.data) ? dbRes.data : [];
        setMongoDatabases(dbs);

        const colMap = {};
        for (const db of dbs) {
          try {
            const colRes = await axios.get(
              `${API_BASE}/databases/${encodeURIComponent(db)}/collections`,
              { headers }
            );
            colMap[db] = Array.isArray(colRes.data) ? colRes.data : [];
          } catch {
            colMap[db] = [];
          }
        }
        setMongoCollections(colMap);

        // Couchbase collections
        // ensure bucket is selected already by earlier flow
        await axios.post(
          `${API_BASE}/select-bucket?bucketName=${encodeURIComponent(saved.bucketName)}`,
          {},
          { headers }
        );
        const couchRes = await axios.get(`${API_BASE}/couchbase-collections`, { headers });
        setCouchCollections(normalizeCouchCollections(couchRes.data));
      } catch (e) {
        console.error(e);
        setError('Failed to fetch metadata from one or both sides.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [getAccessTokenSilently]);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/connection')}
        style={{
          marginBottom: 16,
          padding: '8px 14px',
          borderRadius: 6,
          border: '1px solid #ccc',
          background: '#f0f0f0',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
      <h2 style={{ marginTop: 0 }}>Fetched Metadata</h2>
      {loading && <div>Loading metadata...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Mongo */}
      <div style={{ marginTop: 24, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h3>MongoDB Databases & Collections</h3>
          {mongoDatabases.map((db) => (
            <div key={db} style={{ marginBottom: 12, border: '1px solid #e2e8f0', padding: 8, borderRadius: 6 }}>
              <div style={{ fontWeight: '700' }}>{db}</div>
              <ul style={{ marginTop: 4 }}>
                {(mongoCollections[db] || []).map((col) => (
                  <li key={col}>{col}</li>
                ))}
              </ul>
            </div>
          ))}
          {mongoDatabases.length === 0 && <div>No MongoDB databases found.</div>}
        </div>

        {/* Couchbase */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <h3>Couchbase Scopes / Collections / Fields</h3>
          {couchCollections.length === 0 && <div>No Couchbase collections found.</div>}
          <ul>
            {couchCollections.map((coll, idx) => (
              <li key={`${coll.scopeName}-${coll.collectionName}-${idx}`} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: '700' }}>
                  {coll.scopeName} / {coll.collectionName}
                </div>
                <div style={{ marginLeft: 16 }}>
                  <div style={{ fontStyle: 'italic' }}>Fields:</div>
                  <ul>
                    {(coll.fields || []).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <button style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => navigate('/functions')}>
             Migrate Functions
          </button>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <pre
          style={{
            background: '#f5f5f7',
            padding: 12,
            borderRadius: 6,
            overflowX: 'auto',
            fontSize: 12,
          }}
        >
          {/* For debugging: show saved connection info (mask password) */}
          {JSON.stringify(
            {
              ...getSaved(),
              password: '****',
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default MetadataView;
