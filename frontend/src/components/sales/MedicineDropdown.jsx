import styles from './Sales.module.css';
import { getExpiryStatus, formatDate } from '../../utils/dateUtils';

const MedicineDropdown = ({ results, onSelect }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className={styles.dropdownContainer}>
      {results.map((item) => {
        const status = getExpiryStatus(item.expiry_date);
        return (
          <div 
            key={item.id} 
            className={styles.dropdownItem}
            onClick={() => onSelect(item)}
          >
            <div>
              <div className={`${styles.itemName} ${status === 'expired' ? styles.expiredName : ''}`}>
                {item.name}
                <span className={`${styles.itemStock} ${item.quantity > 0 || item.loose_tablets > 0 ? styles.inStock : styles.outOfStock}`}>
                  {item.is_tablet && item.packing 
                    ? `Stock: ${item.quantity} Strips, ${item.loose_tablets || 0} Tabs`
                    : (item.quantity > 0 ? `Stock: ${item.quantity}` : 'Out of Stock')
                  }
                </span>
                {status !== 'valid' && (
                  <span className={`${styles.statusBadge} ${status === 'expired' ? styles.expiredBadge : styles.nearExpiryBadge}`} style={{ marginLeft: '10px' }}>
                    {status === 'expired' ? 'Expired' : 'Near Expiry'} ({formatDate(item.expiry_date)})
                  </span>
                )}
              </div>
              <div className={styles.itemDetails}>
                {item.content && <span>{item.content.substring(0, 30)}... | </span>}
                {item.manufacturer}
              </div>
            </div>
            <div className={styles.itemPrice}>
              {item.is_tablet && item.single_tablet_price ? (
                 <>
                   <div>Strip: ₹{item.price}</div>
                   <div style={{fontSize: '12px', color: '#666'}}>Tab: ₹{item.single_tablet_price}</div>
                 </>
              ) : (
                `₹${item.price}`
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MedicineDropdown;
