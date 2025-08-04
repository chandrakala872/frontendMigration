import React from 'react';
import Conectiondb from './Conectiondb'; // ✅ Import at top
import Collection from './Collection';
 import Function from './Function';

function Migration() {
  return (
    <div>
     
      <Conectiondb /> {/* ✅ Render the component */}
      {/* <Collection/> */}
      {/* <Function/> */}
    </div>
  );
}

export default Migration;
