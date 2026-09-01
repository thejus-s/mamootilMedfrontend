import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Store, Phone, MapPin, Globe, CreditCard, AlertCircle } from 'lucide-react';
import styles from './Account.module.css';
import api from '../api';
import { toast } from 'react-hot-toast';
import Loading from '../UI/Loading';

const Account = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    store_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    lowstock_threshold: 10
  });
  
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('user/profile/');
      setProfileData({
        username: response.data.username || '',
        email: response.data.email || '',
        store_name: response.data.store_name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
        pincode: response.data.pincode || '',
        lowstock_threshold: response.data.lowstock_threshold || 10
      });
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoadingFetch(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    try {
      await api.put('user/update/', profileData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match.');
      setLoadingPassword(false);
      return;
    }

    try {
      await api.post('user/change-password/', { new_password: passwordData.new_password });
      toast.success('Password changed successfully!');
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error('Failed to change password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (loadingFetch) {
    return <Loading message="Loading profile details..." />;
  }

  if (loadingProfile) {
    return <Loading message="Updating profile..." />;
  }

  if (loadingPassword) {
    return <Loading message="Updating password..." />;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Account & Store Profile</h2>

      <div className={styles.mainLayout}>
        {/* Left Column: Forms */}
        <div className={styles.formColumn}>
          
          {/* Store Profile Section */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <Store size={22} />
              </div>
              <h3>Store Information</h3>
            </div>
            
            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Store Name</label>
                  <input 
                    type="text" 
                    name="store_name" 
                    value={profileData.store_name} 
                    onChange={handleProfileChange}
                    placeholder="e.g. HealthCare Pharmacy"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contact Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={profileData.phone} 
                    onChange={handleProfileChange}
                    placeholder="Store phone number"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Street Address</label>
                <textarea 
                  name="address" 
                  value={profileData.address} 
                  onChange={handleProfileChange}
                  placeholder="Full street address"
                  rows={2}
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={profileData.city} 
                    onChange={handleProfileChange}
                    placeholder="City"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={profileData.state} 
                    onChange={handleProfileChange}
                    placeholder="State"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={profileData.pincode} 
                    onChange={handleProfileChange}
                    placeholder="ZIP / Pincode"
                  />
                </div>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Low Stock Alert Threshold</label>
                  <input 
                    type="number" 
                    name="lowstock_threshold" 
                    value={profileData.lowstock_threshold} 
                    onChange={handleProfileChange}
                    placeholder="e.g. 10"
                    min="1"
                  />
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <User size={22} />
                </div>
                <h3>Login Account</h3>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={profileData.username} 
                    onChange={handleProfileChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profileData.email} 
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <button type="submit" disabled={loadingProfile} className={styles.submitBtn}>
                <Save size={18} />
                {loadingProfile ? 'Saving...' : 'Save All Changes'}
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <Lock size={22} />
              </div>
              <h3>Security</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input 
                    required
                    type="password" 
                    name="new_password" 
                    value={passwordData.new_password} 
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <input 
                    required
                    type="password" 
                    name="confirm_password" 
                    value={passwordData.confirm_password} 
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" disabled={loadingPassword || !passwordData.new_password} className={styles.submitBtn}>
                <Save size={18} />
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Profile Preview Card */}
        <div className={styles.previewColumn}>
          <div className={styles.previewSticky}>
            <h4 className={styles.previewTitle}>Store Identity Preview</h4>
            <div className={styles.identityCard}>
              <div className={styles.cardBranding}>
                <div className={styles.logoCircle}>
                  <Store color="#2e7d32" size={32} />
                </div>
                <div className={styles.brandText}>
                  <h5>{profileData.store_name || "Your Store Medical"}</h5>
                  <span>Pharmacy License Active</span>
                </div>
              </div>
              
              <div className={styles.cardDetails}>
                <div className={styles.detailRow}>
                  <MapPin size={16} />
                  <div>
                    <p>{profileData.address || "Street Address"}</p>
                    <p>{profileData.city && profileData.state ? `${profileData.city}, ${profileData.state}` : "City, State"} {profileData.pincode}</p>
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <Phone size={16} />
                  <p>{profileData.phone || "+91 00000 00000"}</p>
                </div>
                <div className={styles.detailRow}>
                  <Globe size={16} />
                  <p>{profileData.email || "support@store.com"}</p>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <div className={styles.chip}>Certified Vendor</div>
                <div className={styles.chip}>Gst Registered</div>
              </div>
            </div>
            
            <div className={styles.previewInfo}>
              <AlertCircle size={16} />
              <p>This information will appear automatically on your generated bills and invoices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
