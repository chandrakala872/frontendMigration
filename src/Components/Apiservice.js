import Apiservice from './Apiservice';

const attachAuth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const Appservice = {
  // Certificate Uploads
  uploadMongoCert: (file, token) => {
    const formData = new FormData();
    formData.append('certificate', file);
    return Apiservice.post('/upload/mongo-certificate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  uploadCouchbaseCert: (file, token) => {
    const formData = new FormData();
    formData.append('certificate', file);
    return Apiservice.post('/upload/couchbase-certificate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Connection Management
  connectMongo: (connectionDetails, token) =>
    Apiservice.post('/connect-mongo', connectionDetails, attachAuth(token)),

  connectCouchbase: (connectionDetails, token) =>
    Apiservice.post('/connect-couchbase', connectionDetails, attachAuth(token)),

  selectBucket: (bucketName, token) =>
    Apiservice.post('/select-bucket', null, {
      params: { bucketName },
      ...attachAuth(token),
    }),

  // Data Operations
  getDatabases: (token) => Apiservice.get('/databases', attachAuth(token)),

  getCollections: (db, token) =>
    Apiservice.get(`/databases/${db}/collections`, attachAuth(token)),

  getCouchbaseCollections: (token) =>
    Apiservice.get('/couchbase-collections', attachAuth(token)),

  transferCollections: (db, collectionsMap, scope, token) =>
    Apiservice.post('/transfer', collectionsMap, {
      params: { db, couchbaseScope: scope },
      ...attachAuth(token),
    }),

  // Metadata
  getMongoMetadata: (token) =>
    Apiservice.get('/metadata/mongo', attachAuth(token))
};

export default Appservice;