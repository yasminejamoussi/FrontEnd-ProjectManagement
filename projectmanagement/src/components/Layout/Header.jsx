import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Gear, Envelope, ChatCircleText, ShoppingBagOpen, SignOut } from '@phosphor-icons/react';
import axios from 'axios';
import womanAvatar from '../../assets/images/avtar/user.jpg';
import checkIcon from '../../assets/images/profile-app/01.png';

const Header = () => {
  const [openPanel, setOpenPanel] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [suggestedUser, setSuggestedUser] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [language, setLanguage] = useState('en');
  const searchRef = useRef(null);
  const appsRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4000';

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiBaseUrl}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Utilisateurs reçus :', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur fetchUsers :', error);
    }
  };

  const suggestUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiBaseUrl}/api/tasks/user-task-counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userTaskCounts = response.data.userTaskAnalysis;
      console.log('Comptes de tâches des utilisateurs :', userTaskCounts);

      const availableUsers = userTaskCounts.filter(user => user.workloadStatus !== 'Overloaded');

      if (availableUsers.length === 0) {
        console.warn('Aucun utilisateur disponible pour la réassignation.');
        setSuggestedUser(null);
        setNewAssignee('');
        return;
      }

      const suggested = availableUsers.reduce((prev, curr) =>
        prev.workloadScore < curr.workloadScore ? prev : curr
      );

      console.log('Utilisateur suggéré :', suggested);
      setSuggestedUser(suggested);
      setNewAssignee(suggested.userId);
    } catch (error) {
      console.error('Erreur suggestUser :', error);
      setSuggestedUser(null);
      setNewAssignee('');
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('Récupération des notifications...');
      if (!userProfile || !userProfile.role || !userProfile._id) {
        console.warn('Profil utilisateur ou rôle non chargé');
        return;
      }

      const token = localStorage.getItem('token');
      const { role, _id: userId } = userProfile;
      console.log('Rôle utilisateur :', role.name, 'ID utilisateur :', userId);

      // Récupérer les projets
      let projects = [];
      if (role.name === 'Admin') {
        const projectsResponse = await axios.get(`${apiBaseUrl}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        projects = projectsResponse.data;
        console.log('Projets reçus (Admin) :', projects.length);
      } else if (['Project Manager', 'Team Leader', 'Team Member'].includes(role.name)) {
        const projectsResponse = await axios.get(`${apiBaseUrl}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            projectManager: userId,
            teamMembers: userId
          }
        });
        console.log('Requête projets envoyée avec params :', { projectManager: userId, teamMembers: userId });
        projects = projectsResponse.data;
        console.log('Projets reçus (Utilisateur) :', projects.length, projects.map(p => ({
          name: p.name,
          projectManager: p.projectManager,
          teamMembers: p.teamMembers
        })));
      }

      // Prédire les retards des projets
      const projectDelayPromises = projects.map(async (project) => {
        try {
          const delayResponse = await axios.get(`${apiBaseUrl}/api/projects/${project._id}/predict-delay`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`Projet ${project.name} prédiction :`, delayResponse.data);
          return {
            type: 'project',
            projectId: project._id,
            projectName: project.name,
            riskOfDelay: delayResponse.data.riskOfDelay,
            delayDays: delayResponse.data.delayDays,
            status: project.status,
            endDate: project.endDate,
          };
        } catch (error) {
          console.error(`Erreur prédiction projet ${project._id} :`, error.message);
          return null;
        }
      });

      // Récupérer les tâches
      let tasks = [];
      if (role.name === 'Admin') {
        const tasksResponse = await axios.get(`${apiBaseUrl}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        tasks = tasksResponse.data;
        console.log('Tâches reçues (Admin) :', tasks.length);
      } else if (role.name === 'Project Manager') {
        const projectIds = projects
          .filter(project => {
            let isManager = false;
            if (project.projectManager) {
              isManager = typeof project.projectManager === 'object' && project.projectManager?._id
                ? project.projectManager._id.toString() === userId
                : project.projectManager.toString() === userId;
            }
            console.log(`Projet ${project.name} - projectManager:`, project.projectManager, 'teamMembers:', project.teamMembers, 'isManager:', isManager);
            return isManager;
          })
          .map(project => project._id);
        console.log('IDs des projets gérés :', projectIds);
        if (projectIds.length > 0) {
          const tasksResponse = await axios.get(`${apiBaseUrl}/api/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { projectId: projectIds }
          });
          console.log('Requête tâches envoyée avec params :', { projectId: projectIds });
          tasks = tasksResponse.data;
          console.log('Tâches reçues (Project Manager) :', tasks.length, tasks.map(t => t.title));
        } else {
          console.log('Aucun projet géré trouvé pour ce Project Manager.');
          const allProjectIds = projects.map(project => project._id);
          if (allProjectIds.length > 0) {
            console.log('Fallback: Récupération des tâches pour tous les projets retournés :', allProjectIds);
            const tasksResponse = await axios.get(`${apiBaseUrl}/api/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { projectId: allProjectIds }
            });
            tasks = tasksResponse.data;
            console.log('Tâches reçues (Fallback) :', tasks.length, tasks.map(t => t.title));
          }
        }
      } else if (['Team Leader', 'Team Member'].includes(role.name)) {
        const tasksResponse = await axios.get(`${apiBaseUrl}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { assignedTo: userId }
        });
        console.log('Requête tâches envoyée avec params :', { assignedTo: userId });
        tasks = tasksResponse.data;
        console.log('Tâches reçues (Utilisateur) :', tasks.length, tasks.map(t => t.title));
      }

      // Prédire les retards des tâches
      const taskDelayPromises = tasks.map(async (task) => {
        try {
          const delayResponse = await axios.get(`${apiBaseUrl}/api/tasks/${task._id}/predict-delay`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`Tâche ${task.title} prédiction :`, delayResponse.data);
          return {
            type: 'task',
            taskId: task._id,
            taskTitle: task.title,
            projectName: task.project?.name || 'Inconnu',
            riskOfDelay: delayResponse.data.riskOfDelay,
            delayDays: delayResponse.data.delayDays,
            status: task.status,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo || [],
          };
        } catch (error) {
          console.error(`Erreur prédiction tâche ${task._id} :`, error.message);
          return null;
        }
      });

      const projectDelays = (await Promise.all(projectDelayPromises)).filter(p => p !== null);
      const taskDelays = (await Promise.all(taskDelayPromises)).filter(t => t !== null);

      const allNotifications = [
        ...projectDelays.filter(p => p.riskOfDelay === 'Oui'),
        ...taskDelays.filter(t => t.riskOfDelay === 'Oui'),
      ];
      console.log('Notifications finales :', allNotifications);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Erreur globale fetchNotifications :', error.message);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Missing token");
        return;
      }

      try {
        const response = await axios.get(`${apiBaseUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile in Header:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchNotifications();
      fetchUsers();
    }
  }, [userProfile]);

  const togglePanel = (panel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const closeOffcanvas = () => {
    setOpenPanel(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && !searchRef.current.contains(event.target) &&
        appsRef.current && !appsRef.current.contains(event.target) &&
        notificationsRef.current && !notificationsRef.current.contains(event.target) &&
        profileRef.current && !profileRef.current.contains(event.target)
      ) {
        closeOffcanvas();
      }
    };

    if (openPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPanel]);

  const handleOpenClick = (e, panel) => {
    e.preventDefault();
    togglePanel(panel);
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : 'N/A';
  };

  const handleTaskClick = (notif) => {
    if (notif.type === 'task') {
      setSelectedTask(notif);
      setNewDueDate(notif.dueDate ? new Date(notif.dueDate).toISOString().split('T')[0] : '');
      suggestUser();
      setShowModal(true);
      closeOffcanvas();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setNewDueDate('');
    setNewAssignee('');
    setSuggestedUser(null);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedTask = {};
      if (newDueDate) updatedTask.dueDate = new Date(newDueDate);
      if (newAssignee) {
        const existingAssignees = selectedTask.assignedTo.map(assignee =>
          typeof assignee === 'object' ? assignee._id : assignee
        );
        updatedTask.assignedTo = [...new Set([...existingAssignees, newAssignee])];
      }

      console.log('Mise à jour de la tâche avec :', updatedTask);
      await axios.put(`${apiBaseUrl}/api/tasks/${selectedTask.taskId}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task updated successfully !');
      closeModal();
      fetchNotifications();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche :', error);
      alert('Error updating task .');
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    console.log('Langue changée en :', lang);
  };

  const translations = {
    en: {
      searchPlaceholder: 'Search...',
      appsTitle: 'Shortcuts',
      notificationsTitle: 'Notifications ({count})',
      profileTitle: 'Profile',
      updateTaskTitle: 'Update Task',
      dueDateLabel: 'Due Date',
      assignedToLabel: 'Assigned To',
      selectMember: 'Select a member',
      suggestedByAI: '(Suggested By AI)',
      aiSuggestion: 'AI thinks {name} could help! (Assigned tasks: {count})',
      cancelButton: 'Cancel',
      updateButton: 'Update',
      noAlerts: 'No alerts at the moment.',
    },
    fr: {
      searchPlaceholder: 'Rechercher...',
      appsTitle: 'Raccourcis',
      notificationsTitle: 'Notifications ({count})',
      profileTitle: 'Profil',
      updateTaskTitle: 'Mettre à jour la tâche',
      dueDateLabel: 'Date d\'échéance',
      assignedToLabel: 'Assigné à',
      selectMember: 'Sélectionner un membre',
      suggestedByAI: '(Suggéré par IA)',
      aiSuggestion: 'L\'IA pense que {name} pourrait aider ! (Tâches assignées : {count})',
      cancelButton: 'Annuler',
      updateButton: 'Mettre à jour',
      noAlerts: 'Aucune alerte pour le moment.',
    },
    es: {
      searchPlaceholder: 'Buscar...',
      appsTitle: 'Accesos directos',
      notificationsTitle: 'Notificaciones ({count})',
      profileTitle: 'Perfil',
      updateTaskTitle: 'Actualizar tarea',
      dueDateLabel: 'Fecha de vencimiento',
      assignedToLabel: 'Asignado a',
      selectMember: 'Seleccionar miembro',
      suggestedByAI: '(Sugerido por IA)',
      aiSuggestion: '¡La IA piensa que {name} podría ayudar! (Tareas asignadas: {count})',
      cancelButton: 'Cancelar',
      updateButton: 'Actualizar',
      noAlerts: 'No hay alertas por el momento.',
    },
    ar: {
      searchPlaceholder: 'بحث...',
      appsTitle: 'اختصارات',
      notificationsTitle: 'الإشعارات ({count})',
      profileTitle: 'الملف الشخصي',
      updateTaskTitle: 'تحديث المهمة',
      dueDateLabel: 'تاريخ الاستحقاق',
      assignedToLabel: 'المسؤول',
      selectMember: 'اختر عضوًا',
      suggestedByAI: '(مقترح بواسطة الذكاء الاصطناعي)',
      aiSuggestion: 'يعتقد الذكاء الاصطناعي أن {name} يمكن أن يساعد! (المهام المعينة: {count})',
      cancelButton: 'إلغاء',
      updateButton: 'تحديث',
      noAlerts: 'لا توجد تنبيهات في الوقت الحالي.',
    },
  };

  const t = translations[language];

  return (
    <header className="header-main">
      <div className="container-fluid">
        <div className="row">
          <div className="col-6 col-sm-4 d-flex align-items-center header-left p-0"></div>
          <div className="col-6 col-sm-8 d-flex align-items-center justify-content-end header-right p-0">
            <ul className="d-flex align-items-center list-unstyled">
              {/* Barre de recherche */}
              <li className="header-searchbar">
                <a
                  className="d-block head-icon"
                  href="#"
                  onClick={(e) => handleOpenClick(e, 'search')}
                  role="button"
                  aria-label="Ouvrir la recherche"
                >
                  <i className="iconoir-search" style={{ color: '#494949' }}></i>
                </a>
                <div
                  className={`offcanvas offcanvas-end header-searchbar-canvas ${openPanel === 'search' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={searchRef}
                  aria-hidden={openPanel !== 'search'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Search </h5>
                    <button
                      className="btn-close"
                      onClick={closeOffcanvas}
                      aria-label="Fermer la recherche"
                    ></button>
                  </div>
                  <div className="offcanvas-body">
                    <div className="header-searchbar-header p-3">
                      <div className="d-flex justify-content-between mb-3 align-items-center">
                        <form action="#" className="app-form app-icon-form w-100">
                          <div className="position-relative">
                            <input
                              className="form-control search-filter"
                              placeholder={t.searchPlaceholder}
                              type="search"
                            />
                            <i className="ti ti-search text-dark" style={{ color: 'black' }}></i>
                          </div>
                        </form>
                        <div className="app-dropdown flex-shrink-0">
                          <a
                            className="h-35 w-35 d-flex-center b-r-15 overflow-hidden bg-light-secondary search-list-avtar ms-2"
                            href="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <Gear size={20} className="ph-duotone" />
                          </a>
                          <ul className="dropdown-menu mb-3">
                            <li className="dropdown-item mt-2">
                              <a href="#">Paramètres de recherche</a>
                            </li>
                            <li className="dropdown-item d-flex align-items-center justify-content-between">
                              <a href="#">Filtrage sécurisé</a>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input form-check-primary"
                                  type="checkbox"
                                  defaultChecked
                                />
                              </div>
                            </li>
                            <li className="dropdown-item d-flex align-items-center justify-content-between">
                              <a href="#">Suggestions de recherche</a>
                              <div className="form-check form-switch">
                                <input className="form-check-input form-check-primary" type="checkbox" />
                              </div>
                            </li>
                            <li className="dropdown-item d-flex align-items-center justify-content-between">
                              <h6 className="mb-0 text-secondary f-s-14">Historique</h6>
                              <i className="ti ti-message-circle me-3 text-success"></i>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <p className="mb-0 text-secondary f-s-15 mt-2">Recherches récentes :</p>
                    </div>
                    <ul className="search-list list-unstyled p-3">
                      <li className="search-list-item d-flex align-items-center mb-3">
                        <div className="h-35 w-35 d-flex-center b-r-15 overflow-hidden bg-light-primary search-list-avtar me-2">
                          <Gear size={20} className="ph-duotone" />
                        </div>
                        <div className="search-list-content">
                          <NavLink to="/api" target="_blank">
                            <h6 className="mb-0 text-dark">Gestion des utilisateurs</h6>
                          </NavLink>
                          <p className="f-s-13 mb-0 text-secondary">#RA789</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>

              {/* Traduction (remplace Applications) */}
              <li className="header-apps">
                <a
                  className="d-block head-icon"
                  href="#"
                  onClick={(e) => handleOpenClick(e, 'translation')}
                  role="button"
                  aria-label="Ouvrir les options de traduction"
                >
                  <i className="iconoir-key-command" style={{ color: '#7b14bb' }}></i>
                </a>
                <div
                  className={`offcanvas offcanvas-end header-apps-canvas ${openPanel === 'translation' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={appsRef}
                  aria-hidden={openPanel !== 'translation'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Language Settings</h5>
                    <button
                      className="btn-close"
                      onClick={closeOffcanvas}
                      aria-label="Fermer les options de traduction"
                    ></button>
                  </div>
                  <div className="offcanvas-body app-scroll">
                    <div className="row row-cols-2">
                      <div className="col mb-3">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => changeLanguage('en')}
                        >
                          English
                        </button>
                      </div>
                      <div className="col mb-3">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => changeLanguage('fr')}
                        >
                          Français
                        </button>
                      </div>
                      <div className="col mb-3">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => changeLanguage('es')}
                        >
                          Español
                        </button>
                      </div>
                      <div className="col mb-3">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => changeLanguage('ar')}
                        >
                          العربية
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Mode sombre/clair */}
              <li className="header-dark">
                <div
                  className="head-icon"
                  onClick={toggleDarkMode}
                  aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
                >
                  {darkMode ? (
                    <i className="iconoir-half-moon"></i>
                  ) : (
                    <i className="iconoir-sun-light" style={{ color: '#ffbb00' }}></i>
                  )}
                </div>
              </li>

              {/* Notifications */}
              <li className="header-notification">
                <a
                  className="d-block head-icon position-relative"
                  href="#"
                  onClick={(e) => handleOpenClick(e, 'notifications')}
                  role="button"
                  aria-label="Ouvrir les notifications"
                >
                  <i className="iconoir-bell" style={{ color: 'cd0f0f' }}></i>
                  {notifications.length > 0 && (
                    <span className="position-absolute translate-middle p-1 bg-success border border-light rounded-circle animate__animated animate__fadeIn animate__infinite animate__slower"></span>
                  )}
                </a>
                <div
                  className={`offcanvas offcanvas-end header-notification-canvas ${openPanel === 'notifications' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={notificationsRef}
                  aria-hidden={openPanel !== 'notifications'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">{t.notificationsTitle.replace('{count}', notifications.length)}</h5>
                    <button
                      className="btn-close"
                      onClick={closeOffcanvas}
                      aria-label="Fermer les notifications"
                    ></button>
                  </div>
                  <div className="offcanvas-body notification-offcanvas-body app-scroll p-0">
                    {notifications.length === 0 ? (
                      <div className="head-container notification-head-container p-3">
                        <p className="text-muted">{t.noAlerts}</p>
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div
                          key={notif.projectId || notif.taskId}
                          className="head-container notification-head-container"
                          onClick={() => notif.type === 'task' && handleTaskClick(notif)}
                          style={notif.type === 'task' ? { cursor: 'pointer' } : {}}
                        >
                          <div className="notification-message head-box">
                            <div className="message-images">
                              <span className="bg-secondary h-35 w-35 d-flex-center b-r-10 position-relative">
                                <i className="ti ti-alert-triangle text-warning"></i>
                              </span>
                            </div>
                            <div className="message-content-box flex-grow-1 ps-2">
                              {notif.type === 'project' ? (
                                <>
                                  <NavLink to={`/project-details/${notif.projectId}`} className="f-s-15 text-secondary mb-0">
                                    The Project : <span className="f-w-500 text-secondary">{notif.projectName}</span> risks a {' '}
                                    <span className="badge bg-danger text-white">{notif.delayDays} day delay</span>
                                  </NavLink>
                                  <p className="f-s-13 mb-0 text-secondary">
                                    Status : {notif.status} | Deadline : {formatDate(notif.endDate)}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="f-s-15 text-secondary mb-0">
                                    The Task : <span className="f-w-500 text-secondary">{notif.taskTitle}</span> risks a{' '}
                                    <span className="badge bg-danger text-white">{notif.delayDays} day delay</span>
                                  </div>
                                  <p className="f-s-13 mb-0 text-secondary">
                                    Project : {notif.projectName} | Deadline : {formatDate(notif.dueDate)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </li>

              {/* Profil */}
              <li className="header-profile">
                <a
                  className="d-block head-icon"
                  href="#"
                  onClick={(e) => handleOpenClick(e, 'profile')}
                  role="button"
                  aria-label="Ouvrir le profil"
                >
                  <img
                    alt="avatar"
                    className="b-r-50 h-35 w-35 bg-dark"
                    src={userProfile?.profileImage || womanAvatar}
                  />
                </a>
                <div
                  className={`offcanvas offcanvas-end header-profile-canvas ${openPanel === 'profile' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={profileRef}
                  aria-hidden={openPanel !== 'profile'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">{t.profileTitle}</h5>
                    <button
                      className="btn-close"
                      onClick={closeOffcanvas}
                      aria-label="Fermer le profil"
                    ></button>
                  </div>
                  <div className="offcanvas-body app-scroll">
                    <ul className="list-unstyled">
                      <li className="d-flex gap-3 mb-3">
                        <div className="d-flex-center">
                          <span className="h-45 w-45 d-flex-center b-r-10 position-relative">
                            <img
                              alt="avatar"
                              className="img-fluid b-r-10"
                              src={userProfile?.profileImage || womanAvatar}
                            />
                          </span>
                        </div>
                        <div className="text-center mt-2">
                          <h6 className="mb-0">
                            {userProfile?.firstname && userProfile?.lastname
                              ? `${userProfile.firstname} ${userProfile.lastname}`
                              : "Unknown Name"} <img alt="verified" className="w-20 h-20" src={checkIcon} />
                          </h6>
                          <p className="f-s-12 mb-0 text-secondary">
                            {userProfile?.email || "Unknown Email"}
                          </p>
                        </div>
                      </li>
                      <li>
                        <Link className="f-w-500 d-flex align-items-center gap-2" to="/profile">
                          <i className="iconoir-user-love f-s-20"></i> Profile Details
                        </Link>
                      </li>
                      <li>
                        <NavLink
                          className="mb-0 btn btn-light-danger btn-sm d-flex align-items-center justify-content-center gap-2"
                          to="/signin"
                          onClick={closeOffcanvas}
                        >
                          <SignOut size={20} className="ph-duotone" /> Logout
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal pour modifier la tâche */}
      {showModal && selectedTask && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t.updateTaskTitle}</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>
              <form onSubmit={handleUpdateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">{t.dueDateLabel}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t.assignedToLabel}</label>
                    <select
                      className="form-control"
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                    >
                      <option value="">{t.selectMember}</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstname} {user.lastname}{' '}
                          {suggestedUser && suggestedUser.userId === user._id && t.suggestedByAI}
                        </option>
                      ))}
                    </select>
                    {suggestedUser && (
                      <p className="text-muted mt-1">
                        {t.aiSuggestion.replace('{name}', suggestedUser.firstname).replace('{count}', suggestedUser.taskCount)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    {t.cancelButton}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {t.updateButton}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;