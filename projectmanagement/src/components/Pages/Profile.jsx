import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/vendor/glightbox/glightbox.min.css';
import '../../assets/vendor/apexcharts/apexcharts.css';
import '../../assets/vendor/select/select2.min.css';
import { useNavigate } from 'react-router-dom';
import Header from "../Layout/Header";
import SideBar from "../Layout/Sidebar";
import UserProfileForm from "../Pages/UserProfileForm";

const Profile = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('profile-tab-pane');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [cv, setCv] = useState(null);
  const [cvPreview, setCvPreview] = useState("");
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [error2FA, setError2FA] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token missing");
      setNotification({ message: "You must be logged in.", type: "error" });
      return;
    }

    try {
      const response = await axios.get("http://localhost:4000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreview(response.data.profileImage);
      setCvPreview(response.data.cv || "");
      setUserData(response.data);
      setIsTwoFactorEnabled(response.data.isTwoFactorEnabled || false);
      console.log("User data from API in Profile:", response.data);
      console.log("Current skills:", response.data.skills);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setNotification({ message: "Failed to fetch user data.", type: "error" });
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleCvChange = (e) => {
    setCv(e.target.files[0]);
    setCvPreview(e.target.files[0].name);
  };

  const handleUpload = async () => {
    if (!image) {
      setNotification({ message: "Please select an image.", type: "error" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token missing");
      setNotification({ message: "You must be logged in.", type: "error" });
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

      setPreview(response.data.imageUrl);
      setNotification({ message: "Image uploaded successfully!", type: "success" });
    } catch (error) {
      console.error("Error uploading image:", error);
      setNotification({ message: "Failed to upload image.", type: "error" });
    }
  };

  const handleCvUpload = async () => {
    if (!cv) {
      setNotification({ message: "Please select a CV.", type: "error" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token missing");
      setNotification({ message: "You must be logged in.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("cv", cv);

    try {
      const response = await axios.post("http://localhost:4000/api/profile/upload-cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Backend response after CV upload:", response.data);
      setCvPreview(response.data.cvUrl);
      setNotification({ message: response.data.message, type: "success" });
      await fetchUserProfile();
    } catch (error) {
      console.error("Error uploading CV:", error);
      setNotification({ message: "Failed to upload CV.", type: "error" });
    }
  };

  const handleToggle2FA = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userData?.email) {
      setNotification({ message: "You must be logged in with a valid email.", type: "error" });
      return;
    }

    setLoading2FA(true);
    setError2FA(null);

    try {
      if (!isTwoFactorEnabled) {
        // Enable 2FA: Generate QR code
        const response = await axios.post(
          "http://localhost:4000/api/auth/generate-2fa",
          { email: userData.email },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.qrCode) {
          // Store QR code and email, then navigate to verification page
          localStorage.setItem("qrCode", response.data.qrCode);
          localStorage.setItem("email", userData.email);
          navigate("/verify-2fa");
        } else {
          throw new Error("Failed to generate QR code.");
        }
      } else {
        // Disable 2FA
        const response = await axios.post(
          "http://localhost:4000/api/auth/disable-2fa",
          { email: userData.email },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.message) {
          setIsTwoFactorEnabled(false);
          setUserData({ ...userData, isTwoFactorEnabled: false });
          setNotification({ message: "2FA disabled successfully!", type: "success" });
          await fetchUserProfile(); // Refresh user data
        }
      }
    } catch (error) {
      console.error("Error managing 2FA:", error);
      setError2FA(error.response?.data?.message || "Error managing 2FA.");
    } finally {
      setLoading2FA(false);
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
                    
                    </ul>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h5>Skills</h5>
                  </div>
                  <div className="card-body">
                    {userData && userData.skills && userData.skills.length > 0 ? (
                      userData.skills.map((skill, index) => (
                        <div key={index} className="mb-4">
                          <h6 className="mb-1 text-dark">{skill}</h6>
                          <div>
                            <div className="d-flex justify-content-between">
                              <p className="text-secondary">Skill</p>
                              <span className="text-primary">100%</span>
                            </div>
                            <div className="progress h-5">
                              <div
                                className="progress-bar bg-primary h-5"
                                role="progressbar"
                                style={{ width: '100%' }}
                                aria-valuenow="100"
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No skills recorded.</p>
                    )}
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
                                    Upload Image
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Section Upload CV */}
                            <div className="cv-upload mt-4">
                              <h6>Upload CV</h6>
                              <div className="avatar-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div className="avatar-edit" style={{ position: "relative", marginBottom: "10px" }}>
                                  <input
                                    type="file"
                                    id="cvUpload"
                                    accept=".pdf,.docx"
                                    onChange={handleCvChange}
                                    style={{ display: "none" }}
                                  />
                                  <label
                                    htmlFor="cvUpload"
                                    style={{
                                      cursor: "pointer",
                                      padding: "10px 20px",
                                      backgroundColor: "#f0f0f0",
                                      borderRadius: "5px",
                                      border: "1px solid #ddd",
                                      display: "inline-block",
                                      letterSpacing: "normal",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <i className="ti ti-file-upload me-2"></i>Choose a CV
                                  </label>
                                </div>
                                <div className="text-center">
                                  <button onClick={handleCvUpload} className="btn btn-primary mt-2">
                                    Upload CV
                                  </button>
                                </div>
                              </div>
                              {notification.message && (
                                <div
                                  className={`alert alert-${notification.type === "success" ? "success" : "danger"} mt-3`}
                                  role="alert"
                                >
                                  {notification.message}
                                </div>
                              )}
                            </div>

                            {/* Section User Info */}
                            <div className="user-info-section mt-4">
                              <UserProfileForm />
                            </div>

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
                                              <td>{task.project?.name || "Not specified"}</td>
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

                  {activeTab === 'security-tab-pane' && (
                    <div className="tab-pane fade show active" id="security-tab-pane">
                      <div className="card">
                        <div className="card-header">
                          <h5>Security Settings</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Two-Factor Authentication (2FA)</label>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="twoFactorSwitch"
                                checked={isTwoFactorEnabled}
                                onChange={handleToggle2FA}
                                disabled={loading2FA}
                              />
                              <label className="form-check-label" htmlFor="twoFactorSwitch">
                                {isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                              </label>
                            </div>
                            {loading2FA && <p>Loading...</p>}
                            {error2FA && <div className="alert alert-danger mt-2">{error2FA}</div>}
                            <p className="text-muted mt-2">
                              {isTwoFactorEnabled
                                ? 'Two-Factor Authentication is enabled. You will need to enter a code from your authenticator app when signing in.'
                                : 'Enable Two-Factor Authentication to add an extra layer of security to your account.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notification-tab-pane' && (
                    <div className="tab-pane fade show active" id="notification-tab-pane">
                      <div className="card">
                        <div className="card-header">
                          <h5>Notification Settings</h5>
                        </div>
                        <div className="card-body">
                          <p>Configure your notification preferences here.</p>
                        </div>
                      </div>
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