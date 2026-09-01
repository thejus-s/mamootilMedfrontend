import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, X, Plus, Search } from 'lucide-react';
import styles from './ManageProducts.module.css';
import api from '../api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';
import Loading from '../UI/Loading';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, lowStock, expiring
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [newCategory, setNewCategory] = useState({ category_name: '', tax: 0 });
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchProducts();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [catRes, supRes, profileRes] = await Promise.all([
        api.get('categories/'),
        api.get('suppliers/'),
        api.get('user/profile/')
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
      if (profileRes.data && profileRes.data.lowstock_threshold) {
        setLowStockThreshold(profileRes.data.lowstock_threshold);
      }
    } catch (err) {
      console.error("Failed to fetch dependencies");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('products/');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setCurrentProduct({...product, category_id: product.category?.id || 1, supplier_id: product.supplier?.id || 1});
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setCurrentProduct({
      product_name: '',
      compositon: '',
      company: '',
      batchno: '',
      quantity: 0,
      price: 0.00,
      mgf_date: '',
      expiry_date: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      supplier_id: suppliers.length > 0 ? suppliers[0].id : '',
      packing: '',
      single_tablet_price: '',
      low_stock_threshold: 10
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await api.delete(`medicines/${id}/`);
        if (isModalOpen) setIsModalOpen(false);
        toast.success("Product deleted successfully");
        await fetchProducts();
      } catch (err) {
        toast.error("Failed to delete product");
        setLoading(false);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...currentProduct };
      if (!payload.mgf_date) delete payload.mgf_date;
      if (!payload.expiry_date) delete payload.expiry_date;
      if (!payload.category_id) delete payload.category_id;
      if (!payload.supplier_id) delete payload.supplier_id;

      if (currentProduct.id) {
        await api.put(`medicines/${currentProduct.id}/`, payload);
        toast.success("Product updated successfully");
      } else {
        // Check for duplicates before creating new product
        const isDuplicate = products.some(p => 
          p.product_name?.toLowerCase() === payload.product_name?.toLowerCase() &&
          p.compositon?.toLowerCase() === payload.compositon?.toLowerCase() &&
          p.batchno?.toLowerCase() === payload.batchno?.toLowerCase() &&
          p.company?.toLowerCase() === payload.company?.toLowerCase() &&
          p.supplier?.id === parseInt(payload.supplier_id)
        );

        if (isDuplicate) {
          toast.error("Product already exists!");
          setLoading(false);
          return;
        }

        await api.post(`products/`, payload);
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.detail || "Could not save product"}`);
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (newCategory.tax === '' || newCategory.tax === null || newCategory.tax === undefined) {
      toast.error("Tax field is required.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('categories/', newCategory);
      toast.success("Category added successfully");
      setIsCategoryModalOpen(false);
      setNewCategory({ category_name: '', tax: 0 });
      await fetchDependencies(); // refresh category list
      if (response.data && response.data.id) {
        setCurrentProduct(prev => ({
          ...prev,
          category_id: response.data.id
        }));
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to add category");
      setLoading(false);
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) {
      toast.error("Supplier name is required.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('suppliers/', { name: newSupplier.name });
      toast.success("Supplier added successfully");
      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', phone: '' });
      await fetchDependencies(); // refresh supplier list
      if (response.data && response.data.id) {
        setCurrentProduct(prev => ({
          ...prev,
          supplier_id: response.data.id
        }));
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to add supplier");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    
    // If it's a numeric field, only parse if not empty
    if (type === 'number') {
      if (value === "") {
        finalValue = ""; // Allow empty string while typing
      } else {
        finalValue = name === 'quantity' ? parseInt(value) : parseFloat(value);
      }
    }

    setCurrentProduct(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  if (loading) return <Loading message="Loading products..." />;
  if (error) return <div className={styles.error}>{error}</div>;

  const filteredProducts = products.filter(product => {
    // Inventory condition search
    if (activeFilter === 'lowStock' && product.quantity >= lowStockThreshold) return false;
    
    if (activeFilter === 'expiring') {
      if (!product.expiry_date) return false;
      const expiry = new Date(product.expiry_date);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      if (expiry > thirtyDaysFromNow) return false;
    }

    const term = searchTerm.toLowerCase();
    return (
      product.product_name?.toLowerCase().includes(term) ||
      product.compositon?.toLowerCase().includes(term) ||
      product.company?.toLowerCase().includes(term) ||
      product.supplier?.name?.toLowerCase().includes(term) ||
      product.category?.category_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Products</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <button 
              className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >All</button>
            <button 
              className={`${styles.filterBtn} ${activeFilter === 'lowStock' ? styles.active : ''}`}
              onClick={() => setActiveFilter('lowStock')}
            >Low Stock</button>
            <button 
              className={`${styles.filterBtn} ${activeFilter === 'expiring' ? styles.active : ''}`}
              onClick={() => setActiveFilter('expiring')}
            >Expiring</button>
          </div>
          <button onClick={handleAddClick} className={styles.addBtn}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Composition</th>
              <th>Manufacturer</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} onClick={() => handleEditClick(product)} className={styles.productRow}>
                <td>
                  {product.product_name}
                  {product.category?.category_name?.toLowerCase().includes('tablet') && product.packing 
                    ? ` - ${product.packing}` 
                    : ''}
                </td>
                <td>{product.compositon}</td>
                <td>{product.company}</td>
                <td>{product.supplier?.name || "N/A"}</td>
                <td>
                  <span className={`${styles.badge} ${product.quantity < (product.low_stock_threshold || lowStockThreshold) ? styles.badgeDanger : styles.badgeSuccess}`}>
                    {product.category?.category_name?.toLowerCase().includes('tablet') && product.packing
                      ? `${product.quantity} Strips, ${product.loose_tablets || 0} Tabs`
                      : product.quantity}
                  </span>
                </td>
                <td>₹{product.price}</td>
                <td>{formatDate(product.expiry_date)}</td>
                <td className={styles.actions}>
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(product); }} className={styles.iconBtn}>
                    <Pencil size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className={`${styles.iconBtn} ${styles.danger}`}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="8" className={styles.emptyState}>No products found matching "{searchTerm}"</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && currentProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{currentProduct.id ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input required type="text" name="product_name" value={currentProduct.product_name || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Batch No.</label>
                  <input required type="text" name="batchno" value={currentProduct.batchno || ''} onChange={handleInputChange} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Content (Composition)</label>
                  <input required type="text" name="compositon" value={currentProduct.compositon || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Manufacturer</label>
                  <input required type="text" name="company" value={currentProduct.company || ''} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <div className={styles.selectWithAdd}>
                    <select name="category_id" value={currentProduct.category_id || ''} onChange={handleInputChange} required className={styles.selectInput}>
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                    </select>
                    <button type="button" className={styles.inlineAddBtn} onClick={() => setIsCategoryModalOpen(true)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Supplier</label>
                  <div className={styles.selectWithAdd}>
                    <select name="supplier_id" value={currentProduct.supplier_id || ''} onChange={handleInputChange} required className={styles.selectInput}>
                      <option value="" disabled>Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button type="button" className={styles.inlineAddBtn} onClick={() => setIsSupplierModalOpen(true)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Quantity</label>
                  <input 
                    required 
                    type="number" 
                    name="quantity" 
                    value={currentProduct.quantity === 0 ? '' : currentProduct.quantity} 
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    name="price" 
                    value={currentProduct.price === 0 ? '' : currentProduct.price} 
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
              
              {categories.find(c => c.id === parseInt(currentProduct.category_id))?.category_name.toLowerCase().includes('tablet') && (
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label>Packing</label>
                    <select name="packing" value={currentProduct.packing || ''} onChange={handleInputChange} className={styles.selectInput} required>
                      <option value="" disabled>Select Packing</option>
                      <option value="10s">10s</option>
                      <option value="14s">14s</option>
                      <option value="15s">15s</option>
                      <option value="20s">20s</option>
                      <option value="30s">30s</option>
                      <option value="50s">50s</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Single Tablet Price (₹)</label>
                    <input type="number" step="0.01" name="single_tablet_price" value={currentProduct.single_tablet_price || ''} onChange={handleInputChange} required />
                  </div>
                </div>
              )}
              
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Low Stock Threshold</label>
                  <input type="number" name="low_stock_threshold" value={currentProduct.low_stock_threshold || ''} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Mfg Date</label>
                  <input type="date" name="mgf_date" value={currentProduct.mgf_date || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Expiry Date</label>
                  <input type="date" name="expiry_date" value={currentProduct.expiry_date || ''} min={currentProduct.mgf_date || ''} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button type="submit" className={styles.updateBtn}>
                  {currentProduct.id ? 'Update Product' : 'Create Product'}
                </button>
                {currentProduct.id && (
                  <button type="button" onClick={() => handleDelete(currentProduct.id)} className={styles.deleteBtn}>
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1100 }}>
          <div className={styles.smallModal}>
            <div className={styles.modalHeader}>
              <h3>Add New Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleCategorySubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Category Name</label>
                <input 
                  required 
                  type="text" 
                  value={newCategory.category_name} 
                  onChange={(e) => setNewCategory({...newCategory, category_name: e.target.value})} 
                  placeholder="e.g. Tablets, Syrup"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tax Percentage (%)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={newCategory.tax} 
                  onChange={(e) => setNewCategory({...newCategory, tax: e.target.value})} 
                  placeholder="e.g. 5.00"
                />
              </div>
              <button type="submit" className={styles.updateBtn}>Add Category</button>
            </form>
          </div>
        </div>
      )}

      {isSupplierModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1100 }}>
          <div className={styles.smallModal}>
            <div className={styles.modalHeader}>
              <h3>Add New Supplier</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSupplierSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Supplier Name</label>
                <input 
                  required 
                  type="text" 
                  value={newSupplier.name} 
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} 
                  placeholder="e.g. Acme Pharmaceuticals"
                />
              </div>
              <button type="submit" className={styles.updateBtn}>Add Supplier</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
