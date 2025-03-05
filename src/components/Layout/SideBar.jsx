import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import LogoNoir from '../../assets/images/logo/LogoNoir.png';
import LogoBlanc from '../../assets/images/logo/LogoBlanc.png';
import { jwtDecode } from "jwt-decode";

const menuConfig = {
  dashboard: {
    label: 'Dashboard',
    path: '/dash',
    icon: 'iconoir-home-alt',
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member', 'Guest'],
    paths: ['/dashboard', '/'],
  },
  projects: {
    label: 'Project Management',
    icon: 'iconoir-folder',
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member', 'Guest'],
    paths: ['/projects'],
    subItems: [
      { label: 'Projects', path: '/projects' },
     
    ],
  },
  tasks: {
    label: 'Task Management',
    icon: 'iconoir-task-list',
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member', 'Guest'],
    paths: ['/tasks'],
    subItems: [{ label: 'Tasks', path: '/tasks' }],
  },
  notifications: {
    label: 'Smart Notifications',
    icon: 'iconoir-bell',
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member'],
    paths: ['/notifications'],
    subItems: [{ label: 'Notifications', path: '/notifications' }],
  },
  activity: {
    label: 'Activity Log',
    icon: 'iconoir-eye',
    roles: ['Admin', 'Project Manager', 'Team Leader'],
    paths: ['/activity-log'],
    subItems: [{ label: 'Activity History', path: '/activity-log' }],
  },
  auth: {
    label: 'User Management',
    icon: 'iconoir-lock',
    roles: ['Admin'],
    paths: ['/roles','users'],
    subItems: [
      { label: 'roles', path: '/roles' },
    { label: 'Users', path: '/users' }],
  },
};

const Sidebar = () => {
  const [userRole, setUserRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  useEffect(() => {
    const jwtToken = localStorage.getItem("token");
    if (jwtToken) {
      try {
        const decoded = jwtDecode(jwtToken);
        console.log("✅ Token décodé :", decoded);
        setUserRole(decoded?.role || 'Guest'); 
      } catch (error) {
        console.error("Erreur lors du décodage du token JWT", error);
      }
    }
  }, []);

  // Filtrage des menus selon le rôle
  const filteredMenu = useMemo(() => {
    return Object.entries(menuConfig).filter(([_, config]) => config.roles.includes(userRole));
  }, [userRole]);

  // Styles
  const styles = {
    sidebar: {
      position: 'fixed',
      width: isSidebarOpen ? '280px' : '0',
      height: '100vh',
      boxShadow: isSidebarOpen ? '5px 0 15px rgba(0, 0, 0, 0.1)' : 'none',
      borderRadius: '0',
      overflowY: 'auto',
      background: isDarkMode
        ? 'linear-gradient(135deg, #1f2a44 0%, #141b2d 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      color: isDarkMode ? '#ffffff' : '#000',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      zIndex: 1050,
    },
    toggleButton: {
      position: 'fixed',
      top: '15px',
      left: '15px',
      width: '30px',
      height: '30px',
      borderRadius: '8px',
      backgroundColor: isDarkMode ? '#2e4a66' : '#e0e7f2',
      color: isDarkMode ? '#ffffff' : '#000',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 1051,
      border: `1px solid ${isDarkMode ? '#ffffff20' : '#00000020'}`,
      display: window.innerWidth < 768 ? 'flex' : 'none', // Only show on mobile
    },
    logoContainer: {
      padding: '20px',
      display: isSidebarOpen ? 'flex' : 'none',
      justifyContent: 'center',
      borderBottom: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
    },
    logo: {
      width: '150px',
      display: 'block',
      margin: '0 auto',
      transition: 'transform 0.3s ease',
    },
    nav: {
      padding: '20px',
      flexGrow: 1,
      display: isSidebarOpen ? 'block' : 'none',
    },
    menuItem: {
      margin: '15px 0',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    },
    menuLink: {
      padding: '15px 20px',
      display: 'flex',
      alignItems: 'center',
      textTransform: 'uppercase',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '1px',
      cursor: 'pointer',
      color: isDarkMode ? '#ffffff' : '#000',
    },
    activeLink: {
      color: '#ffffff',
      background: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',
    },
    icon: {
      fontSize: '20px',
      marginRight: '15px',
      transition: 'transform 0.3s ease',
      color: isDarkMode ? '#ffffff' : '#000',
    },
    subMenu: {
      transition: 'all 0.4s ease',
      marginLeft: '30px',
      borderLeft: `2px dashed ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
    },
    subItem: {
      padding: '10px 15px',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      color: isDarkMode ? '#ffffff' : '#000',
    },
    themeButton: {
      padding: '10px 20px',
      display: isSidebarOpen ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      backgroundColor: isDarkMode ? '#374b66' : '#e0e7f2',
      color: isDarkMode ? '#ffffff' : '#000',
      cursor: 'pointer',
      margin: '20px',
      transition: 'all 0.3s ease',
    },
    dashboard: { backgroundColor: isDarkMode ? '#2e4a66' : '#e0e7f2' },
    projects: { backgroundColor: isDarkMode ? '#3b5998' : '#cce6ff' },
    tasks: { backgroundColor: isDarkMode ? '#6b4e31' : '#ffe6cc' },
    notifications: { backgroundColor: isDarkMode ? '#7a3e3e' : '#ffe0e0' },
    activity: { backgroundColor: isDarkMode ? '#3e6654' : '#e0f2e9' },
    auth: { backgroundColor: isDarkMode ? '#5e3f7a' : '#f2e0f7' },
    role: { backgroundColor: isDarkMode ? '#3b5998' : '#cce6ff' },

  };

  // Toggle menu open/close
  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const isMenuOpenByDefault = useMemo(
    () => (menuId) => menuConfig[menuId].paths.some((path) => location.pathname.startsWith(path)),
    [location.pathname]
  );

  // Render a menu item with sub-items
  const renderMenuItem = (menuId, config) => {
    const hasSubItems = !!config.subItems;
    const isOpen = openMenus[menuId] || isMenuOpenByDefault(menuId);
    const isParentActive = config.paths.some((path) => location.pathname.startsWith(path));

    return (
      <li key={menuId} style={{ ...styles.menuItem, ...styles[menuId] }}>
        {hasSubItems ? (
          <>
            <a
              style={{
                ...styles.menuLink,
                ...(isParentActive ? styles.activeLink : {}),
              }}
              onClick={() => toggleMenu(menuId)}
              onMouseEnter={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1)')}
            >
              <i className={config.icon} style={styles.icon}></i>
              {config.label}
            </a>
            <ul style={{ ...styles.subMenu, maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}>
              {config.subItems.map((subItem) => (
                <li key={subItem.path} style={styles.subItem}>
                  <NavLink
                    to={subItem.path}
                    style={({ isActive }) => ({
                      color: isDarkMode ? '#ffffff' : '#000',
                      ...(isActive ? { fontWeight: '700', background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } : {}),
                    })}
                  >
                    {subItem.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <NavLink
            to={config.path}
            style={({ isActive }) => ({
              ...styles.menuLink,
              ...(isActive ? styles.activeLink : {}),
            })}
            onMouseEnter={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1)')}
          >
            <i className={config.icon} style={styles.icon}></i>
            {config.label}
          </NavLink>
        )}
      </li>
    );
  };

  return (
    <>
      <button
        style={styles.toggleButton}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <i className={isSidebarOpen ? 'iconoir-xmark' : 'iconoir-menu'} style={styles.icon}></i>
      </button>
      <nav style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <NavLink to="/" style={styles.logo}>
            <img src={isDarkMode ? LogoBlanc : LogoNoir} alt="Logo" width="150" />
          </NavLink>
        </div>
        <div style={styles.nav}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredMenu.map(([menuId, config]) => renderMenuItem(menuId, config))}
          </ul>
        </div>
        <div
          style={styles.themeButton}
          onClick={() => setIsDarkMode(!isDarkMode)}
          onMouseEnter={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1)')}
        >
          <i className={isDarkMode ? 'iconoir-sun-light' : 'iconoir-half-moon'} style={styles.icon}></i>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;