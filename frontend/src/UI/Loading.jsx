// src/components/common/LoadingScreen.jsx
import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ message = 'Processing...' }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.loadingContainer}>
        {/* Pharmaceutical-themed spinner */}
        <div className={styles.spinnerContainer}>
          <div className={styles.pharmaSpinner}>
            <div className={styles.pillShape}></div>
            <div className={styles.pillShape}></div>
            <div className={styles.pillShape}></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className={styles.loadingText}>
          <h3 className={styles.title}>{message}</h3>
          <p className={styles.subtitle}>Please wait while we process your request</p>
        </div>
        
        {/* Progress indicator */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <span className={styles.progressText}>Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;