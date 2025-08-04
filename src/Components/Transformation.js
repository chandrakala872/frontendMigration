// import React, { useState } from 'react';
// import './Transformation.css';

// const Transformation = ({ documents = [] }) => {
//   // Field name mappings from MongoDB to Couchbase
//   const fieldMappings = {
//     // Standard field mappings
//     '_id': 'id',          // MongoDB _id to Couchbase id
//     'firstName': 'firstName',
//     'lastName': 'lastName',
//     'email': 'email',
//     'status': 'status',
//     'createdAt': 'createdAt',
//     'updatedAt': 'updatedAt',
    
//     // Common nested field mappings
//     'address.street': 'address.street',
//     // 'address.city': 'address.city',
//     'address.state': 'address.state',
//     'address.zip': 'address.zipCode', // Example of slight variation
    
//     // Special cases
//     'isActive': 'active',
//     'userType': 'type'
//   };

//   // Default sample data showing proper MongoDB to Couchbase transformation
//   const defaultDocuments = [
//     {
//       before: { 
//         _id: "507f1f77bcf86cd799439011",
//         firstName: "John",
//         lastName: "Doe",
//         email: "john@example.com",
//         status: "active",
//         createdAt: new Date("2023-01-15").toISOString(),
//         updatedAt: new Date("2023-06-20").toISOString(),
//         address: {
//           street: "123 Main St",
//           city: "New York",
//           state: "NY",
//           zip: "10001"
//         },
//         Active: true,
//         Type: "premium"
//       },
//       after: { 
//         id: "507f1f77bcf86cd799439011", // _id transformed to id
//         firstName: "John",
//         lastName: "Doe",
//         email: "john@example.com",
//         status: "active",
//         createdAt: "2023-01-15T00:00:00.000Z",
//         updatedAt: "2023-06-20T00:00:00.000Z",
//         address: {
//           street: "123 Main St",
//           city: "New York",
//           state: "NY",
//           zipCode: "10001" // zip transformed to zipCode
//         },
//         active: true, // isActive transformed to active
//         type: "premium" // userType transformed to type
//       }
//     },
//     {
//       before: {
//         _id: "5e9f8f8f8f8f8f8f8f8f8f8f",
//         firstName: "Jane",
//         lastName: "Smith",
//         email: "jane@example.com",
//         status: "inactive",
//         createdAt: new Date("2023-02-10").toISOString(),
//         orders: [
//           { orderId: "ORD123", amount: 99.99 },
//           { orderId: "ORD456", amount: 149.99 }
//         ]
//       },
//       after: {
//         id: "5e9f8f8f8f8f8f8f8f8f8f8f8f",
//         firstName: "Jane",
//         lastName: "Smith",
//         email: "jane@example.com",
//         status: "inactive",
//         createdAt: "2023-02-10T00:00:00.000Z",
//         orders: [
//           { orderId: "ORD123", amount: 99.99 },
//           { orderId: "ORD456", amount: 149.99 }
//         ]
//       }
//     }
//   ];

//   // Use provided documents or default samples
//   const docsToShow = documents.length > 0 ? documents : defaultDocuments;
  
//   const [activeDocIndex, setActiveDocIndex] = useState(0);
//   const [activeView, setActiveView] = useState('before');

//   const currentDoc = docsToShow[activeDocIndex];

//   const formatJson = (obj) => {
//     return JSON.stringify(obj, null, 2);
//   };

//   // Function to transform MongoDB doc to Couchbase doc
//   const transformDocument = (mongoDoc) => {
//     const couchbaseDoc = {};
    
//     // Transform each field according to mappings
//     Object.entries(fieldMappings).forEach(([mongoField, couchbaseField]) => {
//       if (mongoField in mongoDoc) {
//         couchbaseDoc[couchbaseField] = mongoDoc[mongoField];
//       }
//     });
    
//     // Copy unmapped fields as-is
//     Object.keys(mongoDoc).forEach(key => {
//       if (!Object.keys(fieldMappings).includes(key) && !key.includes('.')) {
//         couchbaseDoc[key] = mongoDoc[key];
//       }
//     });
    
//     return couchbaseDoc;
//   };

//   const renderDiff = () => {
//     const transformedDoc = transformDocument(currentDoc.before);
    
//     return (
//       <div className="diff-container">
//         <div className="diff-column">
//           <h4>MongoDB Document</h4>
//           <div className="code-block">
//             {formatJson(currentDoc.before).split('\n').map((line, i) => (
//               <div key={`old-${i}`} className="code-line">{line}</div>
//             ))}
//           </div>
//         </div>
//         <div className="diff-column">
//           <h4>Couchbase Document</h4>
//           <div className="code-block">
//             {formatJson(transformedDoc).split('\n').map((line, i) => (
//               <div key={`new-${i}`} className="code-line">{line}</div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="transformation-container">
//       {/* <h3>MongoDB to Couchbase Transformation Preview</h3> */}
      
//       <div className="document-selector">
//         {docsToShow.map((doc, index) => (
//           <button
//             key={`doc-${index}`}
//             className={`doc-button ${activeDocIndex === index ? 'active' : ''}`}
//             onClick={() => setActiveDocIndex(index)}
//           >
//             Doc {index + 1}
//           </button>
//         ))}
//       </div>

//       <div className="view-tabs">
//         <button
//           className={`tab-button ${activeView === 'before' ? 'active' : ''}`}
//           onClick={() => setActiveView('before')}
//         >
//           MongoDB
//         </button>
//         <button
//           className={`tab-button ${activeView === 'after' ? 'active' : ''}`}
//           onClick={() => setActiveView('after')}
//         >
//           Couchbase
//         </button>
//         <button
//           className={`tab-button ${activeView === 'diff' ? 'active' : ''}`}
//           onClick={() => setActiveView('diff')}
//         >
//           Transformation
//         </button>
//       </div>

//       <div className="document-view">
//         {activeView === 'before' && (
//           <div className="code-block">
//             {formatJson(currentDoc.before).split('\n').map((line, i) => (
//               <div key={`before-${i}`} className="code-line">{line}</div>
//             ))}
//           </div>
//         )}
        
//         {activeView === 'after' && (
//           <div className="code-block">
//             {formatJson(transformDocument(currentDoc.before)).split('\n').map((line, i) => (
//               <div key={`after-${i}`} className="code-line">{line}</div>
//             ))}
//           </div>
//         )}
        
//         {activeView === 'diff' && renderDiff()}
//       </div>
//     </div>
//   );
// };

// export default Transformation;