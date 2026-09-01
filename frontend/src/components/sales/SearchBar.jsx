import React, { useState, useEffect } from 'react';
import styles from './Sales.module.css';

const SearchBar = ({ onSearch, isSearching, value, onChange }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={styles.searchSection}>
      <input
        autoFocus
        type="text"
        className={styles.searchInput}
        placeholder="Search medicine by name, composition, or manufacturer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {isSearching && <small style={{position: 'absolute', right: '15px', top: '15px'}}>Search...</small>}
    </div>
  );
};

export default SearchBar;
