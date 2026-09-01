import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from '../components/sales/Sales.module.css';
import SearchBar from '../components/sales/SearchBar';
import MedicineDropdown from '../components/sales/MedicineDropdown';
import SelectedItemsTable from '../components/sales/SelectedItemsTable';
import BillingSummary from '../components/sales/BillingSummary';
import { toast } from 'react-hot-toast';
import { getExpiryStatus } from '../utils/dateUtils';
import { generateBillPDF } from '../utils/billGenerator';

const SalesEntry = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warningPopup, setWarningPopup] = useState(null); // array of warnings or null
  const [storeProfile, setStoreProfile] = useState({});
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const fetchStoreProfile = async () => {
    try {
      const response = await api.get('user/profile/');
      setStoreProfile(response.data);
    } catch (err) {
      console.error("Failed to fetch store profile", err);
    }
  };


  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await api.get(`medicines/search/?q=${query}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedicine = (medicine) => {
    const isTablet = medicine.is_tablet && medicine.packing;
    const tabletsPerStrip = isTablet ? parseInt(medicine.packing.replace(/\D/g, '')) || 0 : 0;
    const maxTablets = isTablet && tabletsPerStrip > 0 ? (medicine.quantity * tabletsPerStrip) + (medicine.loose_tablets || 0) : medicine.quantity;

    if (maxTablets <= 0) {
      toast.error("This medicine is out of stock!");
      return;
    }

    const defaultUnit = isTablet ? 'piece' : 'strip';
    const existingItemIndex = selectedItems.findIndex(item => item.id === medicine.id);
    
    if (existingItemIndex >= 0) {
      const currentItem = selectedItems[existingItemIndex];
      const maxForUnit = (isTablet && currentItem.saleUnit === 'strip') ? Math.floor(maxTablets / tabletsPerStrip) : maxTablets;
      if (currentItem.selectedQty >= maxForUnit) {
        toast.error("Cannot add more than available stock!");
        return;
      }
      handleUpdateQuantity(medicine.id, currentItem.selectedQty + 1);
    } else {
      const taxRate = parseFloat(medicine.tax || 0);
      const unitPrice = (isTablet && defaultUnit === 'piece' && tabletsPerStrip > 0) ? parseFloat(medicine.single_tablet_price || (medicine.price / tabletsPerStrip)) : parseFloat(medicine.price);
      const baseSubtotal = 1 * unitPrice;
      const subtotalWithTax = baseSubtotal + (baseSubtotal * taxRate / 100);

      const expiryStatus = getExpiryStatus(medicine.expiry_date);

      setSelectedItems([
        ...selectedItems, 
        { 
          ...medicine, 
          selectedQty: 1, 
          maxQuantity: maxTablets,
          tax: taxRate,
          subtotal: subtotalWithTax,
          expiryStatus: expiryStatus,
          isTablet: isTablet,
          unitPrice: unitPrice,
          saleUnit: defaultUnit,
          tabletsPerStrip: tabletsPerStrip
        }
      ]);
    }
    setSearchTerm('');
    setSearchResults([]); 
  };

  const handleUpdateUnit = (id, newUnit) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const isStrip = newUnit === 'strip';
        const absoluteMax = item.maxQuantity;
        const maxForUnit = isStrip ? Math.floor(absoluteMax / item.tabletsPerStrip) : absoluteMax;
        
        let validQty = item.selectedQty;
        if (validQty > maxForUnit) validQty = maxForUnit;
        if (validQty < 1) validQty = 1;

        const unitPrice = isStrip ? parseFloat(item.price) : parseFloat(item.single_tablet_price || (item.price / item.tabletsPerStrip));
        const taxRate = parseFloat(item.tax || 0);
        const baseSubtotal = validQty * unitPrice;
        const subtotalWithTax = baseSubtotal + (baseSubtotal * taxRate / 100);

        return {
          ...item,
          saleUnit: newUnit,
          selectedQty: validQty,
          unitPrice: unitPrice,
          subtotal: subtotalWithTax
        };
      }
      return item;
    }));
  };

  const handleUpdateQuantity = (id, newQty) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const absoluteMax = item.maxQuantity;
        const maxForUnit = (item.isTablet && item.saleUnit === 'strip') ? Math.floor(absoluteMax / item.tabletsPerStrip) : absoluteMax;
        const validQty = Math.min(newQty, maxForUnit);

        const taxRate = parseFloat(item.tax || 0);
        const baseSubtotal = validQty * item.unitPrice;
        const subtotalWithTax = baseSubtotal + (baseSubtotal * taxRate / 100);

        return {
          ...item,
          selectedQty: validQty,
          subtotal: subtotalWithTax
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleGenerateBill = async () => {
    if (selectedItems.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    const payload = {
      total_amount: totalAmount,
      items: selectedItems.map(item => ({
        product_id: item.id,
        quantity: item.selectedQty,
        price_at_sale: item.unitPrice,
        subtotal: item.subtotal,
        sale_unit: item.saleUnit
      }))
    };

    try {
      const response = await api.post('sales/', payload);
      toast.success("Bill generated successfully!");
      
      if (response.data.warnings && response.data.warnings.length > 0) {
        setWarningPopup(response.data.warnings);
      }

      setLastSale(response.data);
      setSelectedItems([]);
      setSearchTerm('');
      
      // Auto-trigger PDF download for better UX
      generateBillPDF(response.data, storeProfile);
      
    } catch (err) {
      console.error("Sale Error:", err);
      // Show specific error from backend if available
      const backendError = err.response?.data?.error || 
                           (err.response?.data ? Object.values(err.response.data)[0] : null) ||
                           err.message;
      toast.error(backendError || "Failed to generate bill.");
    } finally {
      setIsGenerating(false);
    }
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const hasExpiredItems = selectedItems.some(item => item.expiryStatus === 'expired');

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Quick Sales Entry</h1>
      
      {/* Existing status divs removed in favor of professional toasts */}

      <div style={{ position: 'relative' }}>
        <SearchBar 
          onSearch={handleSearch} 
          isSearching={isSearching} 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        {searchResults.length > 0 && (
          <MedicineDropdown results={searchResults} onSelect={handleSelectMedicine} />
        )}
      </div>

      <SelectedItemsTable 
        items={selectedItems} 
        onUpdateQuantity={handleUpdateQuantity} 
        onUpdateUnit={handleUpdateUnit}
        onRemove={handleRemoveItem} 
      />

      <BillingSummary 
        total={totalAmount} 
        onGenerateBill={handleGenerateBill} 
        isGenerating={isGenerating} 
        hasExpiredItems={hasExpiredItems}
      />

      {warningPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>⚠️</span>
              <h3>Stock Health Warning</h3>
            </div>
            <div className={styles.modalBody}>
              <ul className={styles.warningList}>
                {warningPopup.map((warning, idx) => (
                  <li key={idx} className={styles.warningItem}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              className={styles.acknowledgeBtn}
              onClick={() => setWarningPopup(null)}
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEntry;
