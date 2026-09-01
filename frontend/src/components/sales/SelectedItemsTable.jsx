import styles from './Sales.module.css';
import { formatDate, getExpiryStatus } from '../../utils/dateUtils';

const SelectedItemsTable = ({ items, onUpdateQuantity, onUpdateUnit, onRemove }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Medicine Name & Expiry</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Tax (%)</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
             const status = getExpiryStatus(item.expiry_date);
             return (
               <tr key={`${item.id}-${index}`}>
                <td>
                  <div className={styles.itemTableDetails}>
                    <div className={`${styles.itemName} ${status === 'expired' ? styles.expiredName : ''}`}>
                      {item.name}
                    </div>
                    <div className={styles.itemDetails}>{item.manufacturer}</div>
                    <div className={styles.badgeContainer}>
                      {status !== 'valid' && (
                        <div className={`${styles.statusBadge} ${status === 'expired' ? styles.expiredBadge : styles.nearExpiryBadge}`}>
                          {status === 'expired' ? 'EXPIRED' : 'NEAR EXPIRY'} ({formatDate(item.expiry_date)})
                        </div>
                      )}
                      {status === 'valid' && item.expiry_date && (
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          Exp: {formatDate(item.expiry_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className={styles.itemPrice}>
                   ₹{item.unitPrice.toFixed(2)}
                   {item.isTablet && <div style={{fontSize: '10px', color: '#888'}}>per {item.saleUnit}</div>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max={(item.isTablet && item.saleUnit === 'strip') ? Math.floor(item.maxQuantity / item.tabletsPerStrip) : item.maxQuantity}
                      value={item.selectedQty} 
                      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className={styles.quantityInput}
                    />
                    {item.isTablet && (
                      <select 
                        value={item.saleUnit} 
                        onChange={(e) => onUpdateUnit(item.id, e.target.value)}
                        className={styles.quantityInput}
                        style={{ padding: '4px', fontSize: '11px', width: 'auto' }}
                      >
                        <option value="piece">Tabs</option>
                        <option value="strip">Strips</option>
                      </select>
                    )}
                  </div>
                </td>
                <td className={styles.itemPrice}>{item.tax}%</td>
                <td className={styles.itemPrice}>₹{item.subtotal.toFixed(2)}</td>
                <td>
                  <button 
                    onClick={() => onRemove(item.id)} 
                    className={styles.removeBtn}
                    title="Remove Item"
                  >
                    ✕
                  </button>
                </td>
              </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SelectedItemsTable;
