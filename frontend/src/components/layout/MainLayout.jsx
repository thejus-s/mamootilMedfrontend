import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Store, User as UserIcon, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './MainLayout.module.css';
import useAnalytics from '../../hooks/useAnalytics';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const MOBILE_BREAKPOINT = 768;

const MainLayout = () => {
  const navigate = useNavigate();

  // On desktop: sidebar open by default. On mobile: closed by default.
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= MOBILE_BREAKPOINT);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        // On desktop, keep sidebar open
        setSidebarOpen(true);
      } else {
        // On mobile, close sidebar
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update CSS variable for Loading overlay awareness
  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty('--sidebar-offset', '0px');
    } else {
      document.documentElement.style.setProperty(
        '--sidebar-offset',
        sidebarOpen ? `${SIDEBAR_WIDTH}px` : `${SIDEBAR_COLLAPSED_WIDTH}px`
      );
    }
  }, [sidebarOpen, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const { data: analytics } = useAnalytics('24h');
  const expiredCount = analytics?.expired_count || 0;

  const navItems = [
    { to: '/sales-entry', icon: <ShoppingCart size={20} />, label: 'Quick Sales' },
    { to: '/manage-products', icon: <Package size={20} />, label: 'Manage Products' },
    {
      to: '/view-store',
      icon: (
        <div className={styles.navIconWrapper}>
          <Store size={20} />
          {expiredCount > 0 && (
            <span className={styles.navBadge}>{expiredCount}</span>
          )}
        </div>
      ),
      label: 'View Store Analytics',
    },
    { to: '/account', icon: <UserIcon size={20} />, label: 'Account' },
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div className={styles.backdrop} onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <nav
        className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''} ${isMobile ? styles.sidebarMobile : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo + Desktop Collapse Toggle */}
        <div className={styles.logoContainer}>
          <img src="/favicon.png" alt="MamootilMedicals Logo" className={styles.logoIcon} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          <h1 className={styles.logoText}>MamootilMedicals</h1>
          {/* Desktop collapse button (inside sidebar) */}
          {!isMobile && (
            <button
              className={styles.collapseBtn}
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
          {/* Mobile close button */}
          {isMobile && (
            <button className={styles.mobileCloseBtn} onClick={closeSidebar} aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        <div className={styles.navLinks}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={isMobile ? closeSidebar : undefined}
              title={!sidebarOpen && !isMobile ? label : undefined}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn} title={!sidebarOpen && !isMobile ? 'Logout' : undefined}>
          <span className={styles.navIcon}><LogOut size={20} /></span>
          <span className={styles.navLabel}>Logout</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main
        className={`${styles.mainContent} ${!sidebarOpen && !isMobile ? styles.mainContentExpanded : ''} ${isMobile ? styles.mainContentMobile : ''}`}
      >
        {/* Top bar with hamburger for mobile, and toggle for desktop */}
        <div className={styles.topBar}>
          <button
            className={styles.hamburger}
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu size={22} />
          </button>
        </div>

        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
