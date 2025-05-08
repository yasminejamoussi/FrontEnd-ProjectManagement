import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Layout/Header';
import Sidebar from '../Layout/SideBar';
import '../../assets/vendor/glightbox/glightbox.min.css';
import '../../assets/vendor/apexcharts/apexcharts.css';
import '../../assets/vendor/select/select2.min.css';
import '../../assets/css/style.css';
import '../../assets/css/responsive.css';

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4000';

  const [user, setUser] = useState({ firstname: '', lastname: '', phone: '', email: '', role: '' });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s-]{8,15}$/;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    // Vérifier que l'id est défini et semble valide
    if (!id || id === 'undefined') {
      console.error('ID utilisateur non défini ou invalide:', id);
      setError('ID utilisateur invalide.');
      setLoading(false);
      navigate('/users');
      return;
    }

    Promise.all([
      axios.get(`${apiBaseUrl}/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        throw err;
      }),
      axios.get(`${apiBaseUrl}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.error('Erreur lors de la récupération des rôles:', err);
        throw err;
      }),
    ])
      .then(([userResponse, rolesResponse]) => {
        setUser({
          ...userResponse.data,
          role: userResponse.data.role?.name || '',
        });
        setRoles(rolesResponse.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données:', error);
        setError(error.response?.data?.message || 'Impossible de charger les données.');
        setLoading(false);
      });
  }, [id, navigate, apiBaseUrl]);

  const validateForm = () => {
    const errors = {};

    if (!user.firstname.trim()) errors.firstname = 'Le prénom est requis.';
    if (!user.lastname.trim()) errors.lastname = 'Le nom est requis.';
    if (!user.phone.trim()) errors.phone = 'Le numéro de téléphone est requis.';
    else if (!phoneRegex.test(user.phone)) errors.phone = 'Le numéro de téléphone est invalide.';
    if (!user.email.trim()) errors.email = 'L\'email est requis.';
    else if (!emailRegex.test(user.email)) errors.email = 'L\'email est invalide.';
    if (!user.role) errors.role = 'Le rôle est requis.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiBaseUrl}/api/auth/users/${id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Utilisateur mis à jour avec succès !');
        navigate('/users');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      alert(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
                <h4 className="main-title">Setting</h4>
                <ul className="app-line-breadcrumbs mb-3"></ul>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-8 col-xxl-9">
                <div className="tab-content">
                  <div className="tab-pane fade active show" id="profile-tab-pane">
                    <div className="card setting-profile-tab">
                      <div className="card-header">
                        <h5>Profile</h5>
                      </div>
                      <div className="card-body">
                        <div className="profile-tab profile-container">
                          <div className="image-details">
                            <div className="profile-image"></div>
                            <div className="profile-pic">
                              <div className="avatar-upload">
                                <div className="avatar-edit">
                                  <input type="file" id="imageUpload" accept=".png, .jpg, .jpeg" />
                                  <label htmlFor="imageUpload">
                                    <i className="ti ti-photo-heart"></i>
                                  </label>
                                </div>
                                <div className="avatar-preview">
                                  <div id="imgPreview"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="person-details">
                            <h5 className="f-w-600">
                              {user.firstname} {user.lastname}
                              <img
                                width="20"
                                height="20"
                                src="../public/images/profile-app/01.png"
                                alt="instagram-check-mark"
                              />
                            </h5>
                            <p>{user.role || 'Rôle non défini'}</p>
                          </div>
                          <form className="app-form" onSubmit={handleSubmit}>
                            <h5 className="mb-2 text-dark f-w-600">User Info</h5>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">First</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="*****"
                                    name="firstname"
                                    value={user.firstname}
                                    onChange={handleChange}
                                  />
                                  {formErrors.firstname && (
                                    <small className="text-danger">{formErrors.firstname}</small>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Last</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="*****"
                                    name="lastname"
                                    value={user.lastname}
                                    onChange={handleChange}
                                  />
                                  {formErrors.lastname && (
                                    <small className="text-danger">{formErrors.lastname}</small>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Phone</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="+216*"
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleChange}
                                  />
                                  {formErrors.phone && (
                                    <small className="text-danger">{formErrors.phone}</small>
                                  )}
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="mb-3">
                                  <label className="form-label">Email address</label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    placeholder="MariaCEck@teleworm.us"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                  />
                                  {formErrors.email && (
                                    <small className="text-danger">{formErrors.email}</small>
                                  )}
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="mb-3">
                                  <label className="form-label">Role</label>
                                  <select
                                    className="form-control"
                                    name="role"
                                    value={user.role}
                                    onChange={handleChange}
                                  >
                                    <option value="">Sélectionner un rôle</option>
                                    {roles.map((role) => (
                                      <option key={role._id} value={role.name}>
                                        {role.name}
                                      </option>
                                    ))}
                                  </select>
                                  {formErrors.role && (
                                    <small className="text-danger">{formErrors.role}</small>
                                  )}
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="text-end">
                                  <button type="submit" className="btn btn-primary">
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateUser;