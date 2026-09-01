import React, { useState } from 'react';
import styles from './Maintenance.module.css';

const Maintenance = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  const handleAdminBypass = (e) => {
    e.preventDefault();
    // Allow simple bypass parameter or passkey entry
    if (passkey === 'admin' || passkey === 'mamootil123' || passkey.trim() !== '') {
      localStorage.setItem('mamootil_maintenance_bypass', 'true');
      window.location.reload();
    } else {
      setError('Invalid passkey. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Background ambient lighting */}
      <div className={styles.bgGlowTop} />
      <div className={styles.bgGlowBottom} />

      <main className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoContainer}>
            <img 
              src="/favicon.png" 
              alt="Mamootil Meds Logo" 
              className={styles.logoImage} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <h1 className={styles.brandName}>MamootilMedicals</h1>
        </div>

        {/* Animated Maintenance Icon */}
        <div className={styles.animationContainer}>
          <div className={styles.pulseRing} />
          <div className={styles.pulseRingOuter} />
          <div className={styles.iconCircle}>
            <svg 
              className={styles.wrenchIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h2 className={styles.heading}>We'll be back soon!</h2>
        <p className={styles.message}>
          Mamootil Meds is currently undergoing maintenance. We're working to improve your experience and will be back shortly.
        </p>

        {/* Status Bar */}
        <div className={styles.statusBox}>
          <div className={styles.statusHeader}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>System Maintenance in Progress</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} />
          </div>
        </div>

        {/* Footer info & Admin Bypass link */}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} MamootilMedicals. All rights reserved.</p>
          <button 
            type="button" 
            className={styles.adminToggleBtn} 
            onClick={() => setShowAdminModal(!showAdminModal)}
          >
            Admin Access
          </button>
        </footer>

        {/* Admin Bypass Modal */}
        {showAdminModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Admin Maintenance Bypass</h3>
              <p className={styles.modalSubtext}>Enter passkey or bypass key to preview normal site.</p>
              <form onSubmit={handleAdminBypass}>
                <input 
                  type="password"
                  placeholder="Enter admin passkey..."
                  value={passkey}
                  onChange={(e) => { setPasskey(e.target.value); setError(''); }}
                  className={styles.modalInput}
                  autoFocus
                />
                {error && <p className={styles.errorText}>{error}</p>}
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn} 
                    onClick={() => setShowAdminModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Enable Bypass
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Maintenance;
