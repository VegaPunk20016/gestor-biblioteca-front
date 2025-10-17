import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium' }) => {
  return (
    <div className={`loading loading--${size}`}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Loading;