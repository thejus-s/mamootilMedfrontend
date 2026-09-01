import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import styles from './ViewStore.module.css';
import api from '../api';
import { formatDate } from '../utils/dateUtils';
import Loading from '../UI/Loading';

const ViewStore = () => {
  const expiredTableRef = useRef(null);
  
  const scrollToExpired = () => {
    expiredTableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [data, setData] = useState({
    total_medicines: 0,
    low_stock: 0,
    expiring_soon: 0,
    expired_count: 0,
    expired_products: [],
    monthly_sales: [],
    yearly_profit: 0,
    recent_sales: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const fetchAnalytics = async (range) => {
    try {
      const response = await api.get(`analytics/?range=${range}`);
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading Analytics..." />;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Store Overview</h2>
        <div className={styles.filterGroup}>
          <button 
            className={`${styles.filterBtn} ${timeRange === '24h' ? styles.active : ''}`}
            onClick={() => setTimeRange('24h')}
          >24 Hours</button>
          <button 
            className={`${styles.filterBtn} ${timeRange === '7d' ? styles.active : ''}`}
            onClick={() => setTimeRange('7d')}
          >7 Days</button>
          <button 
            className={`${styles.filterBtn} ${timeRange === '30d' ? styles.active : ''}`}
            onClick={() => setTimeRange('30d')}
          >1 Month</button>
        </div>
      </div>
      
      {/* Top Value Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
              <Package size={24} />
            </div>
            <span>Total Medicines</span>
          </div>
          <h3>{data.total_medicines}</h3>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <span>Low Stock Items</span>
          </div>
          <h3>{data.low_stock}</h3>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={24} />
            </div>
            <span>Expiring Soon</span>
          </div>
          <h3>{data.expiring_soon}</h3>
        </div>

        <div className={`${styles.card} ${styles.interactiveCard}`} onClick={scrollToExpired}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#fff1f2', color: '#be123c' }}>
              <AlertTriangle size={24} />
            </div>
            <span>Expired Items</span>
          </div>
          <h3 className={data.expired_count > 0 ? styles.countDanger : ''}>{data.expired_count}</h3>
          <div className={styles.cardInfo}>Click to view ↴</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}>
              <TrendingUp size={24} />
            </div>
            <span>{timeRange === '30d' ? 'Yearly Revenue' : 'Period Revenue'}</span>
          </div>
          <h3>₹{data.yearly_profit.toLocaleString()}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Monthly Sales Trend</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly_sales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Sales Volume Comparison</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_sales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tables Section */}
      <div className={styles.tablesGrid}>
        <div className={styles.chartCard}>
          <h3>Recently Sold Products</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.recentTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Date Sold</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_sales.map((sale, idx) => (
                  <tr key={idx}>
                    <td>{sale.product_name}</td>
                    <td>{sale.quantity}</td>
                    <td>₹{sale.subtotal.toFixed(2)}</td>
                    <td>{formatDate(sale.created_at)}</td>
                  </tr>
                ))}
                {data.recent_sales.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No sales for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.tableTitleRow}>
            <h3>Expired Inventory</h3>
            {data.expired_count > 0 && <span className={styles.badgeDanger}>Critical Action Required</span>}
          </div>
          <div className={styles.tableWrapper} ref={expiredTableRef}>
            <table className={styles.recentTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.expired_products.map((p, idx) => (
                  <tr key={idx}>
                    <td className={styles.expiredProductName}>{p.product_name}</td>
                    <td>{p.batch_number}</td>
                    <td className={styles.expiredDate}>{formatDate(p.expiry_date)}</td>
                    <td>{p.quantity}</td>
                  </tr>
                ))}
                {data.expired_products.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No expired inventory found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStore;
