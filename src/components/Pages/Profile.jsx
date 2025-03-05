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
  const [userData, setUserData] = useState(null); // Nouvel état pour stocker les données utilisateur

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token manquant");
        return;
      }

      try {
        const response = await axios.get("http://localhost:4000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPreview(response.data.profileImage);
        setUserData(response.data); // Stocker toutes les données utilisateur
        console.log("User data from API in Profile:", response.data); // Débogage
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur :", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    const token = localStorage.getItem("token");
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
          Authorization: `Bearer ${token}`,
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <SideBar />
      <div className="app-content">
        <header>
          <p>Header Placeholder</p>
        </header>
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
                <h4 className="main-title">Settings</h4>
                <ul className="app-line-breadcrumbs mb-3">
                  <li><a href="#" className="f-s-14 f-w-500"><i className="ph-duotone ph-stack f-s-16"></i> Apps</a></li>
                  <li><a href="#" className="f-s-14 f-w-500">Profile</a></li>
                  <li className="active"><a href="#" className="f-s-14 f-w-500">Settings</a></li>
                </ul>
              </div>
            </div>

            <div className="row">
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

              <div className="col-lg-8 col-xxl-9">
                <div className="tab-content">
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
                                <div className="text-center">
                                  <button onClick={handleUpload} className="btn btn-primary mt-4">
                                    Upload
                                  </button>
                                </div>
                              </div>
                            </div>

                            <UserProfileForm />

                            {/* Tableau des Projets Gérés */}
                            <div className="col-xl-12">
                              <div className="card-header">
                                <h5>My projects</h5>
                              </div>
                              <div className="card">
                                <div className="card-body p-0">
                                  <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                      <thead>
                                        <tr>
                                          <th scope="col">Name</th>
                                          <th scope="col">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userData && userData.managedProjects && userData.managedProjects.length > 0 ? (
                                          userData.managedProjects.map((project) => (
                                            <tr key={project._id}>
                                              <td>{project.name}</td>
                                              <td>
                                                <span className={`badge text-light-${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'primary' : 'warning'}`}>
                                                  {project.status}
                                                </span>
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="2">No projects assigned yet</td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Tableau des Tâches Assignées */}
                            <div className="col-xl-12 mt-4">
                              <div className="card-header">
                                <h5>My assigned tasks</h5>
                              </div>
                              <div className="card">
                                <div className="card-body p-0">
                                  <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                      <thead>
                                        <tr>
                                          <th scope="col">Title</th>
                                          <th scope="col">Status</th>
                                          <th scope="col">Priority</th>
                                          <th scope="col">Project</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userData && userData.assignedTasks && userData.assignedTasks.length > 0 ? (
                                          userData.assignedTasks.map((task) => (
                                            <tr key={task._id}>
                                              <td>{task.title}</td>
                                              <td>
                                                <span className={`badge text-light-${task.status === 'Done' ? 'success' : task.status === 'In Progress' ? 'primary' : 'secondary'}`}>
                                                  {task.status}
                                                </span>
                                              </td>
                                              <td>{task.priority}</td>
                                              <td>{task.project?.name || "Non spécifié"}</td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="4">No tasks assigned yet.</td>
                                          </tr>
                                        )}
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

                  {/* Autres onglets inchangés */}
                  {activeTab === 'security-tab-pane' && (
                    <div className="tab-pane fade show active" id="security-tab-pane">
                      {/* Contenu existant */}
                    </div>
                  )}
                  {activeTab === 'notification-tab-pane' && (
                    <div className="tab-pane fade show active" id="notification-tab-pane">
                      {/* Contenu existant */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="go-top">
          <span className="progress-value">
            <i className="ti ti-arrow-up"></i>
          </span>
        </div>
      </div>

      <div id="customizer"></div>
    </div>
  );
};

export default Profile;