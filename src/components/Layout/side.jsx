import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import LogoNoir from '../../assets/images/logo/LogoNoir.png';
import LogoBlanc from '../../assets/images/logo/LogoBlanc.png';
import { jwtDecode } from "jwt-decode";

// Menu configuration object
const menuConfig = {
  dashboard: { label: 'Dashboard', path: '/dashboard', icon: 'iconoir-home-alt', paths: ['/dashboard', '/'] },
  projects: {
    label: 'Project Management',
    icon: 'iconoir-folder',
    paths: ['/projects', '/project-details'],
    subItems: [
      { label: 'Projects', path: '/projects' },
      { label: 'Project Details', path: '/project-details' },
    ],
  },
  tasks: {
    label: 'Task Management',
    icon: 'iconoir-task-list',
    paths: ['/tasks'],
    subItems: [{ label: 'Tasks', path: '/tasks' }],
  },
  notifications: {
    label: 'Smart Notifications',
    icon: 'iconoir-bell',
    paths: ['/notifications'],
    subItems: [{ label: 'Notifications', path: '/notifications' }],
  },
  activity: {
    label: 'Activity Log',
    icon: 'iconoir-eye',
    paths: ['/activity-log'],
    subItems: [{ label: 'Activity History', path: '/activity-log' }],
  },
  auth: {
    label: 'User Auth',
    icon: 'iconoir-lock',
    paths: ['/login', '/register', '/forgot-password'],
    subItems: [
      { label: 'Login', path: '/login' },
      { label: 'Register', path: '/register' },
      { label: 'Forgot Password', path: '/forgot-password' },
    ],
  },
};

const Sidebar = () => {
  const [userRole, setUserRole] = useState(null); 

  const [openMenus, setOpenMenus] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  // Toggle sidebar visibility and update body class
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      document.body.classList.toggle('sidebar-open', newState);
      return newState;
    });
  };

  // Updated styles with refined toggle button visibility
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
      width: '200px',
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
    subLink: {
      color: isDarkMode ? '#ffffff' : '#000',
    },
    activeSubLink: {
      color: isDarkMode ? '#ffffff' : '#333333',
      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      fontWeight: '700',
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
    dashboard: { backgroundColor: isDarkMode ? '#2e4a66' : '#e0e7f2' },
    projects: { backgroundColor: isDarkMode ? '#3b5998' : '#cce6ff' },
    tasks: { backgroundColor: isDarkMode ? '#6b4e31' : '#ffe6cc' },
    notifications: { backgroundColor: isDarkMode ? '#7a3e3e' : '#ffe0e0' },
    activity: { backgroundColor: isDarkMode ? '#3e6654' : '#e0f2e9' },
    auth: { backgroundColor: isDarkMode ? '#5e3f7a' : '#f2e0f7' },
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
  };

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


  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      try {
        const decoded = jwtDecode(jwtToken);
        setUserRole(decoded?.role); // Mettre à jour le rôle de l'utilisateur
      } catch (error) {
        console.error("Erreur lors du décodage du token JWT", error);
      }
    }
  }, []);
  
  const renderMenuItem = (menuId, config) => {
    const hasSubItems = !!config.subItems;
    const isOpen = openMenus[menuId] || isMenuOpenByDefault(menuId);
    const isParentActive = config.paths.some((path) => location.pathname.startsWith(path));
  // Vérifier le rôle de l'utilisateur et décider de l'affichage des éléments

  if (userRole !== 'Admin' && ['projects', 'tasks', 'activity', 'notifications'].includes(menuId)) {
    return null; 
  }
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
                      ...styles.subLink,
                      ...(isActive ? styles.activeSubLink : {}),
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
        onClick={toggleSidebar}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <i className={isSidebarOpen ? 'iconoir-xmark' : 'iconoir-menu'} style={styles.icon}></i>
      </button>
      <nav style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <NavLink to="/" style={styles.logo}>
            <img src={isDarkMode ? LogoBlanc : LogoNoir} alt="Logo Orkestra" width="200" />
          </NavLink>
        </div>
        <div style={styles.nav}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(menuConfig).map(([menuId, config]) => renderMenuItem(menuId, config))}
          </ul>
        </div>
        <div
          style={styles.themeButton}
          onClick={toggleTheme}
          onMouseEnter={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => (e.currentTarget.querySelector('i').style.transform = 'scale(1)')}
        >
          <i
            className={isDarkMode ? 'iconoir-sun-light' : 'iconoir-half-moon'}
            style={styles.icon}
          ></i>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;