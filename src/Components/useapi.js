import { useState } from 'react';
import ApiService from './api-service';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadMongoCertificate: (token, file) => callApi(ApiService.uploadMongoCertificate, token, file),
    uploadCouchbaseCertificate: (token, file) => callApi(ApiService.uploadCouchbaseCertificate, token, file),
    connectToMongo: (token, details) => callApi(ApiService.connectToMongo, token, details),
    connectToCouchbase: (token, details) => callApi(ApiService.connectToCouchbase, token, details),
    selectBucket: (token, bucketName) => callApi(ApiService.selectBucket, token, bucketName),
    getDatabases: (token) => callApi(ApiService.getDatabases, token),
    getCollections: (token, dbName) => callApi(ApiService.getCollections, token, dbName),
    getCouchbaseCollections: (token) => callApi(ApiService.getCouchbaseCollections, token),
    transferCollections: (token, dbName, collectionsMap, scope) => 
      callApi(ApiService.transferCollections, token, dbName, collectionsMap, scope),
    getMongoMetadata: (token) => callApi(ApiService.getMongoMetadata, token),
    getKafkaMessages: () => callApi(ApiService.getKafkaMessages)
  };
};

export default useApi;