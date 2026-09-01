export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    
    return `${d}-${m}-${y}`;
  } catch (e) {
    return dateStr;
  }
};

export const getExpiryStatus = (expiryDateStr) => {
  if (!expiryDateStr) return 'valid';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  thirtyDaysFromNow.setHours(0, 0, 0, 0);
  
  if (expiry <= today) return 'expired';
  if (expiry <= thirtyDaysFromNow) return 'nearExpiry';
  return 'valid';
};
