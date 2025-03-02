import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/vendor/glightbox/glightbox.min.css';
import '../../assets/vendor/apexcharts/apexcharts.css';
import '../../assets/vendor/select/select2.min.css';
import Header from "../Layout/Header";
import SideBar from "../Layout/Sidebar";
import UserProfileForm from "../Pages/UserProfileForm";

const Profile = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('profile-tab-pane');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");  // Récupérer le token depuis le localStorage
      if (!token) {
        console.error("Token manquant");
        return;
      }

      try {
        const response = await axios.get("http://localhost:4000/api/profile", {
          headers: { Authorization: `Bearer ${token}` } // Ajouter le token dans les en-têtes
        });
        setPreview(response.data.profileImage);
      } catch (error) {
        console.error("Erreur lors du chargement de l'image :", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0])); // Prévisualiser l'image sélectionnée
  };

  // Gérer l'upload de l'image
  const handleUpload = async () => {
    if (!image) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    const token = localStorage.getItem("token");  // Récupérer le token
    if (!token) {
      console.error("Token manquant");
      alert("Vous devez être connecté.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:4000/api/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` // Ajouter le token dans les en-têtes
        },
      });

      if (response.data.imageUrl) {
        setPreview(response.data.imageUrl);
        alert("Image mise à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      alert("Échec du téléchargement de l'image.");
    }
  };
  // Gérer le changement d'onglet
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="app-wrapper">
      {/* Loader */}
      <Header />
      <SideBar />

      <div className="app-content">
        {/* Header Placeholder */}
        <header>
          <p>Header Placeholder</p>
        </header>
       
        {/* Main Section */}
        <main>
          <div className="container-fluid">
            {/* Breadcrumb */}
            <div className="row m-1">
              <div className="col-12">
                <h4 className="main-title">Settings</h4>
                <ul className="app-line-breadcrumbs mb-3">
                  <li>
                    <a href="#" className="f-s-14 f-w-500">
                      <i className="ph-duotone ph-stack f-s-16"></i> Apps
                    </a>
                  </li>
                  <li>
                    <a href="#" className="f-s-14 f-w-500">Profile</a>
                  </li>
                  <li className="active">
                    <a href="#" className="f-s-14 f-w-500">Settings</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Settings App */}
            <div className="row">
              {/* Sidebar Tabs */}
              <div className="col-lg-4 col-xxl-3">
                <div className="card">
                  <div className="card-header">
                    <h5>Settings</h5>
                  </div>
                  <div className="card-body">
                    <ul className="nav nav-tabs tab-light-primary" role="tablist">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'profile-tab-pane' ? 'active' : ''}`}
                          onClick={() => handleTabChange('profile-tab-pane')}
                        >
                          <i className="ph-bold ph-user-circle-gear pe-2"></i> Profile
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'security-tab-pane' ? 'active' : ''}`}
                          onClick={() => handleTabChange('security-tab-pane')}
                        >
                          <i className="ph-bold ph-shield-check pe-2"></i> Security
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'notification-tab-pane' ? 'active' : ''}`}
                          onClick={() => handleTabChange('notification-tab-pane')}
                        >
                          <i className="ph-bold ph-notification pe-2"></i> Notification
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className="nav-link">
                          <i className="ph-bold ph-trash pe-2"></i> Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Skills Card */}
                <div className="card">
                  <div className="card-header">
                    <h5>Skills</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h6 className="mb-1 text-dark">Skill 1</h6>
                      <div>
                        <div className="d-flex justify-content-between">
                          <p className="text-secondary">Photos 01</p>
                          <span className="text-primary">65%</span>
                        </div>
                        <div className="progress h-5">
                          <div
                            className="progress-bar bg-primary h-5"
                            role="progressbar"
                            style={{ width: '65%' }}
                            aria-valuenow="65"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="col-lg-8 col-xxl-9">
                <div className="tab-content">
                  {/* Profile Tab */}
                  {activeTab === 'profile-tab-pane' && (
                    <div className="tab-pane fade show active" id="profile-tab-pane">
                      <div className="card setting-profile-tab">
                        <div className="card-header">
                          <h5>Profile</h5>
                        </div>
                        <div className="card-body">
                          <div className="profile-tab profile-container">
                            <div className="image-details">
                              <div className="profile-pic">
                                <div className="avatar-upload">
                                  <div className="avatar-edit">
                                    <input
                                      type="file"
                                      id="imageUpload"
                                      accept=".png, .jpg, .jpeg"
                                      onChange={handleFileChange}
                                    />
                                    <label htmlFor="imageUpload">
                                      <i className="ti ti-photo-heart"></i>
                                    </label>
                                  </div>
                                  <div className="avatar-preview">
                                    {preview && (
                                      <img
                                        src={preview}
                                        alt="Profile"
                                        style={{ width: "120px", height: "120px", borderRadius: "50%" }}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className='text-center'>
                                <button onClick={handleUpload} className="btn btn-primary mt-4">
                                  Upload
                                </button>
                                </div>
                              </div>
                            </div>

                            <UserProfileForm />

                            {/* Projects Table */}
                            <div className="col-xl-12">
                              <div className="card-header">
                                <h5>Mes projets</h5>
                              </div>
                              <div className="card">
                                <div className="card-body p-0">
                                  <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                      <thead>
                                        <tr>
                                          <th scope="col">Id</th>
                                          <th scope="col">Name</th>
                                          <th scope="col">Position</th>
                                          <th scope="col">Office</th>
                                          <th scope="col">Status</th>
                                          <th scope="col">Salary</th>
                                          <th scope="col">Contact</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>1</td>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <div className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-primary me-2 simple-table-avtar">
                                                <img
                                                  src="../assets/images/avtar/1.png"
                                                  alt=""
                                                  className="img-fluid"
                                                />
                                              </div>
                                              <p className="mb-0 f-w-500">Tiger Nixon</p>
                                            </div>
                                          </td>
                                          <td className="f-w-500">Architect</td>
                                          <td className="text-secondary f-w-600">Edinburgh</td>
                                          <td><span className="badge text-light-primary">active</span></td>
                                          <td className="text-success f-w-500">$320,800</td>
                                          <td>+1 (025) 466-7506</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security-tab-pane' && (
                    <div className="tab-pane fade show active" id="security-tab-pane">
                      {/* ... (contenu existant de l'onglet Sécurité) ... */}
                    </div>
                  )}

                  {/* Notification Tab */}
                  {activeTab === 'notification-tab-pane' && (
                    <div className="tab-pane fade show active" id="notification-tab-pane">
                      {/* ... (contenu existant de l'onglet Notification) ... */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Tap on Top */}
        <div className="go-top">
          <span className="progress-value">
            <i className="ti ti-arrow-up"></i>
          </span>
        </div>

      </div>

      {/* Customizer Placeholder */}
      <div id="customizer"></div>
    </div>
  );
};

export default Profile;