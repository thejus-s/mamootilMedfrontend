import React from 'react';
import styles from './Sales.module.css';

const BillingSummary = ({ total, onGenerateBill, isGenerating, hasExpiredItems }) => {
  if (total <= 0) return null;

  return (
    <div className={styles.billingSummary}>
      <div>
        <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Total Amount</div>
        <div className={styles.summaryTotal}>₹{total.toFixed(2)}</div>
        {hasExpiredItems && (
          <div className={styles.expiredWarning}>
            ⚠️ Cannot proceed with expired products
          </div>
        )}
      </div>
      <div className={styles.summaryWarning}>
        <button 
          className={styles.generateBtn} 
          onClick={onGenerateBill}
          disabled={isGenerating || total <= 0 || hasExpiredItems}
        >
          {isGenerating ? 'Generating...' : 'Generate Bill'}
        </button>
      </div>
    </div>
  );
};

export default BillingSummary;
