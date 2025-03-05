import React, { useState, useEffect, useRef } from 'react';
import { NavLink ,Link} from 'react-router-dom';
import { Gear, Envelope, ChatCircleText, ShoppingBagOpen, SignOut } from '@phosphor-icons/react'; // Icônes nécessaires
import avatar6 from '../../assets/images/ai_avtar/6.jpg';
import womanAvatar from '../../assets/images/avtar/woman.jpg';
import checkIcon from '../../assets/images/profile-app/01.png';

const Header = () => {
  const [openPanel, setOpenPanel] = useState(null); // Utilise un seul état pour gérer tous les onglets
  const [darkMode, setDarkMode] = useState(false);

  // Références pour les offcanvas
  const searchRef = useRef(null);
  const appsRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Toggle mode sombre
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode); // Ajoute/enlève la classe pour le mode sombre
  };

  // Fonction pour ouvrir/fermer un onglet spécifique (ferme automatiquement les autres)
  const togglePanel = (panel) => {
    setOpenPanel((current) => (current === panel ? null : panel)); // Si le panneau est déjà ouvert, le fermer ; sinon, l’ouvrir
  };

  // Fonction pour fermer tous les offcanvas
  const closeOffcanvas = () => {
    setOpenPanel(null);
  };

  // Fonction pour fermer les offcanvas en cliquant à l’extérieur
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

    // Ajoute l’écouteur d’événements quand un offcanvas est ouvert
    if (openPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Nettoie l’écouteur d’événements quand les offcanvas sont fermés
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPanel]);

  // Fonction pour gérer le clic sur les boutons d’ouverture (évite les comportements par défaut)
  const handleOpenClick = (e, panel) => {
    e.preventDefault();
    togglePanel(panel);
  };

  return (
    <header className="header-main">
      <div className="container-fluid">
        <div className="row">
          {/* Partie gauche (supprimé le bouton toggle) */}
          <div className="col-6 col-sm-4 d-flex align-items-center header-left p-0">
            {/* Bouton toggle enlevé */}
          </div>

          {/* Partie droite */}
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
                  <i className="iconoir-search"></i>
                </a>
                <div
                  className={`offcanvas offcanvas-end header-searchbar-canvas ${openPanel === 'search' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={searchRef}
                  aria-hidden={openPanel !== 'search'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Recherche</h5>
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
                              placeholder="Rechercher..."
                              type="search"
                            />
                            <i className="ti ti-search text-dark"></i>
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

              {/* Applications */}
              <li className="header-apps">
                <a
                  className="d-block head-icon"
                  href="#"
                  onClick={(e) => handleOpenClick(e, 'apps')}
                  role="button"
                  aria-label="Ouvrir les applications"
                >
                  <i className="iconoir-key-command"></i>
                </a>
                <div
                  className={`offcanvas offcanvas-end header-apps-canvas ${openPanel === 'apps' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={appsRef}
                  aria-hidden={openPanel !== 'apps'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Raccourcis</h5>
                    <button
                      className="btn-close"
                      onClick={closeOffcanvas}
                      aria-label="Fermer les applications"
                    ></button>
                  </div>
                  <div className="offcanvas-body app-scroll">
                    <div className="row row-cols-3">
                      <div className="d-flex-center text-center mb-3">
                        <NavLink to="/product" target="_blank">
                          <span className="text-light-info h-45 w-45 d-flex-center b-r-15">
                            <ShoppingBagOpen size={30} className="ph-duotone" />
                          </span>
                          <p className="mb-0 f-w-500 text-info">E-shop</p>
                        </NavLink>
                      </div>
                      <div className="d-flex-center text-center mb-3">
                        <NavLink to="/email" target="_blank">
                          <span className="text-light-primary h-45 w-45 d-flex-center b-r-15 position-relative">
                            <Envelope size={30} className="ph-duotone" />
                          </span>
                          <p className="mb-0 f-w-500 text-primary">Email</p>
                        </NavLink>
                      </div>
                      <div className="d-flex-center text-center mb-3">
                        <NavLink to="/chat" target="_blank">
                          <span className="text-light-danger h-45 w-45 d-flex-center b-r-15 position-relative">
                            <ChatCircleText size={30} className="ph-duotone" />
                            <span className="position-absolute top-space-5 start-100 translate-middle badge rounded-pill bg-success badge-notification">
                              99+
                            </span>
                          </span>
                          <p className="mb-0 f-w-500 text-danger">Chat</p>
                        </NavLink>
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
                    <i className="iconoir-sun-light"></i>
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
                  <i className="iconoir-bell"></i>
                  <span className="position-absolute translate-middle p-1 bg-success border border-light rounded-circle animate__animated animate__fadeIn animate__infinite animate__slower"></span>
                </a>
                <div
                  className={`offcanvas offcanvas-end header-notification-canvas ${openPanel === 'notifications' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={notificationsRef}
                  aria-hidden={openPanel !== 'notifications'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Notifications</h5>
                    <button
                      className="btn-close"
                      onClick={closeOffcanvas}
                      aria-label="Fermer les notifications"
                    ></button>
                  </div>
                  <div className="offcanvas-body notification-offcanvas-body app-scroll p-0">
                    <div className="head-container notification-head-container">
                      <div className="notification-message head-box">
                        <div className="message-images">
                          <span className="bg-secondary h-35 w-35 d-flex-center b-r-10 position-relative">
                            <img
                              alt="avtar"
                              className="img-fluid b-r-10"
                              src={avatar6}
                            />
                          </span>
                        </div>
                        <div className="message-content-box flex-grow-1 ps-2">
                          <NavLink to="/read-email" className="f-s-15 text-secondary mb-0" target="_blank">
                            <span className="f-w-500 text-secondary">Gene Hart</span> veut modifier{' '}
                            <span className="f-w-500 text-secondary">Report.doc</span>
                          </NavLink>
                          <div>
                            <a className="d-inline-block f-w-500 text-success me-1" href="#">Approuver</a>
                            <a className="d-inline-block f-w-500 text-danger" href="#">Refuser</a>
                          </div>
                          <span className="badge text-light-primary mt-2">23 sept.</span>
                        </div>
                      </div>
                    </div>
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
                    alt="avtar"
                    className="b-r-50 h-35 w-35 bg-dark"
                    src={womanAvatar}
                  />
                </a>
                <div
                  className={`offcanvas offcanvas-end header-profile-canvas ${openPanel === 'profile' ? 'show' : ''}`}
                  tabIndex="-1"
                  ref={profileRef}
                  aria-hidden={openPanel !== 'profile'}
                >
                  <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Profile</h5>
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
                              alt=""
                              className="img-fluid b-r-10"
                              src={womanAvatar}
                            />
                          </span>
                        </div>
                        <div className="text-center mt-2">
                          <h6 className="mb-0">
                            Laura Monaldo{' '}
                            <img
                              alt="check"
                              className="w-20 h-20"
                              src={checkIcon}
                            />
                          </h6>
                          <p className="f-s-12 mb-0 text-secondary">lauradesign@gmail.com</p>
                        </div>
                      </li>
                      <li>
                        <Link className="f-w-500 d-flex align-items-center gap-2" to="/profile">
                          <i className="iconoir-user-love f-s-20"></i> Profile Details
                        </Link>
                      </li>
                      <li>
                        <NavLink className="f-w-500 d-flex align-items-center gap-2" to="/setting" target="_blank">
                          <i className="iconoir-settings f-s-20"></i> Settings
                        </NavLink>
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
    </header>
  );
};

export default Header;