import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import LogoNoir from '../../assets/images/logo/LogoNoir.png';
import LogoBlanc from '../../assets/images/logo/LogoBlanc.png';
import { jwtDecode } from "jwt-decode";
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { RiDashboardLine, RiFolderLine, RiTaskLine, RiNotification2Line, RiEyeLine, RiLockLine } from 'react-icons/ri';

const menuConfig = {
  dashboard: {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <RiDashboardLine />,
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member', 'Guest'],
    paths: ['/dashboard', '/'],
  },
  projects: {
    label: 'Project Management',
    icon: <RiFolderLine />,
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member', 'Guest'],
    paths: ['/projects', '/team'],
    subItems: [
      { label: 'Projects', path: '/projects' },
      { label: 'Teams', path: '/team' }
    ],
  },
  tasks: {
    label: 'Task Management',
    icon: <RiTaskLine />,
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member', 'Guest'],
    paths: ['/tasksusers'],
    subItems: [{ label: 'Tasks', path: '/tasksusers' }],
  },
  notifications: {
    label: 'Smart Notifications',
    icon: <RiNotification2Line />,
    roles: ['Admin', 'Project Manager', 'Team Leader', 'Team Member'],
    paths: ['/notifications'],
    subItems: [{ label: 'Notifications', path: '/notifications' }],
  },
  activity: {
    label: 'Activity Log',
    icon: <RiEyeLine />,
    roles: ['Admin', 'Project Manager', 'Team Leader'],
    paths: ['/activitylogs'],
    subItems: [{ label: 'Activity History', path: '/activitylogs' }],
  },
  auth: {
    label: 'User Management',
    icon: <RiLockLine />,
    roles: ['Admin'],
    paths: ['/roles', 'users'],
    subItems: [
      { label: 'Roles', path: '/roles' },
      { label: 'Users', path: '/users' }
    ],
  },
};

const Sidebar = ({ setContentMargin }) => {
  const [userRole, setUserRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });
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

    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (setContentMargin) {
      setContentMargin(isSidebarOpen ? 280 : 0);
    }
  }, [isSidebarOpen, setContentMargin]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredMenu = useMemo(() => {
    return Object.entries(menuConfig).filter(([_, config]) => config.roles.includes(userRole));
  }, [userRole]);

  const styles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: isSidebarOpen ? '280px' : '0',
      height: '100vh',
      boxShadow: isSidebarOpen ? '5px 0 15px rgba(0, 0, 0, 0.1)' : 'none',
      borderRadius: '0',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      background: isDarkMode
        ? 'linear-gradient(135deg, #1f2a44 0%, #141b2d 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      color: isDarkMode ? '#ffffff' : '#000',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      zIndex: 1050,
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    overlay: {
      display: isSidebarOpen && window.innerWidth < 768 ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1049,
      cursor: 'pointer',
    },
    toggleLink: {
      position: 'fixed',
      top: '15px',
      left: '15px',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 1051,
      textDecoration: 'none',
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
              onMouseEnter={(e) => {
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.transform = 'scale(1)';
              }}
            >
              <span style={styles.icon}>{config.icon}</span>
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
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector('svg');
              if (icon) icon.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector('svg');
              if (icon) icon.style.transform = 'scale(1)';
            }}
          >
            <span style={styles.icon}>{config.icon}</span>
            {config.label}
          </NavLink>
        )}
      </li>
    );
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div style={styles.overlay} onClick={handleOverlayClick}></div>
      <a
        href="#"
        style={styles.toggleLink}
        onClick={(e) => { e.preventDefault(); setIsSidebarOpen(!isSidebarOpen); }}
        onMouseEnter={(e) => (e.currentTarget.querySelector('svg').style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.querySelector('svg').style.transform = 'scale(1)')}
      >
        {isSidebarOpen ? <HiX size={20} color={isDarkMode ? '#ffffff' : '#000'} /> : <HiMenu size={20} />}
      </a>
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
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector('svg');
            if (icon) icon.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector('svg');
            if (icon) icon.style.transform = 'scale(1)';
          }}
        >
          {isDarkMode ? <HiSun size={20} style={styles.icon} /> : <HiMoon size={20} style={styles.icon} />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;