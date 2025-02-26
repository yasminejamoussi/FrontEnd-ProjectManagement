import React, { useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // For Bootstrap styling
import '../../assets/vendor/glightbox/glightbox.min.css'; // Assuming these are in your project
import '../../assets/vendor/apexcharts/apexcharts.css';
import '../../assets/vendor/select/select2.min.css';
import Header from "../Layout/Header";
import SideBar from "../Layout/SideBar";
import UserProfileForm from "../Pages/UserProfileForm"; // Assure-toi que le chemin est correct

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile-tab-pane');
 

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
          {/* Header content would go here */}
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
                      <div className="card security-card-content">
                        <div className="card-body">
                          <div className="account-security">
                            <div className="row align-items-center">
                              <div className="col-sm-8">
                                <h5 className="text-primary f-w-600">Account Security</h5>
                                <p className="account-discription text-secondary f-s-16 mt-2 mb-0">
                                  Your account is valuable to hackers. To make 2-step verification very secure, use your phone's built-in security key.
                                </p>
                              </div>
                              <div className="col-sm-4 account-security-img">
                                <img src="../assets/images/setting-app/account.png" alt="" className="w-180" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-body">
                          <div className="row security-box-card align-items-center">
                            <div className="col-md-3 position-relative">
                              <span><img src="../assets/images/setting-app/google.png" alt="" className="w-35 h-35 anti-code" /></span>
                              <p className="security-box-title text-dark f-w-500 f-s-16 ms-5 security-code">Authentication</p>
                            </div>
                            <div className="col-md-6 security-discription">
                              <p className="text-secondary f-s-16">
                                It encompasses various methods to ensure that the person requesting access is indeed who they claim to be.
                              </p>
                              <span className="badge text-light-secondary p-2">
                                <i className="ph-fill ph-check-circle me-1 text-success"></i>secondary
                              </span>
                            </div>
                            <div className="col-md-3 text-end">
                              <button type="button" className="btn btn-outline-success">Turn off</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card security-card-content">
                        <div className="card-body">
                          <div className="account-security mb-2">
                            <div className="row align-items-center">
                              <div className="col-sm-9">
                                <h5 className="text-primary f-w-600">Change Password</h5>
                                <p className="account-discription text-secondary f-s-16 mt-3">
                                  To change your password, please fill in the fields below. Your password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.
                                </p>
                              </div>
                              <div className="col-sm-3 account-security-img">
                                <img src="../assets/images/setting-app/password.png" alt="" className="w-150" />
                              </div>
                            </div>
                          </div>

                          <div className="app-form">
                            <div className="row">
                              <div className="col-sm-12">
                                <label htmlFor="password" className="form-label">Current Password</label>
                                <div className="input-group input-group-password mb-3">
                                  <span className="input-group-text b-r-left"><i className="ph-bold ph-lock f-s-20"></i></span>
                                  <input type="password" id="password" className="form-control" placeholder="********" />
                                  <span className="input-group-text b-r-right"><i className="ph ph-eye-slash f-s-20 eyes-icon" id="showPassword"></i></span>
                                </div>
                              </div>
                              <div className="col-sm-12">
                                <label htmlFor="password1" className="form-label">New Password</label>
                                <div className="input-group input-group-password mb-3">
                                  <span className="input-group-text b-r-left"><i className="ph-bold ph-lock f-s-20"></i></span>
                                  <input type="password" id="password1" className="form-control" placeholder="********" />
                                  <span className="input-group-text b-r-right"><i className="ph ph-eye-slash f-s-20 eyes-icon1" id="showPassword1"></i></span>
                                </div>
                              </div>
                              <div className="col-sm-12">
                                <label htmlFor="password2" className="form-label">Confirm Password</label>
                                <div className="input-group input-group-password mb-3">
                                  <span className="input-group-text b-r-left"><i className="ph-bold ph-lock f-s-20"></i></span>
                                  <input type="password" id="password2" className="form-control" placeholder="********" />
                                  <span className="input-group-text b-r-right"><i className="ph ph-eye-slash f-s-20 eyes-icon2" id="showPassword2"></i></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Tab */}
                  {activeTab === 'notification-tab-pane' && (
                    <div className="tab-pane fade show active" id="notification-tab-pane">
                      <div className="card">
                        <div className="card-header">
                          <h5>Notification</h5>
                        </div>
                        <div className="card-body">
                          <div className="notification-content">
                            <div className="row">
                              <div className="col-lg-6">
                                <div className="notification-email">
                                  <h6>By Email</h6>
                                  <div className="select-item">
                                    <input className="form-check-input form-check-primary w-25 h-25" type="checkbox" id="checkbox-email" />
                                    <label className="form-check-label" htmlFor="checkbox-email">
                                      <span className="d-flex align-items-center">
                                        <span className="ms-3 privacy-content">
                                          <span className="mb-0 text-dark txt-ellipsis-1 f-s-16 f-w-500">Comments</span>
                                          <span className="text-secondary mb-0">notified posts on comment</span>
                                        </span>
                                      </span>
                                    </label>
                                  </div>
                                  <div className="select-item">
                                    <input className="form-check-input form-check-primary w-25 h-25" type="checkbox" id="checkbox-email1" />
                                    <label className="form-check-label" htmlFor="checkbox-email1">
                                      <span className="d-flex align-items-center">
                                        <span className="ms-3 privacy-content">
                                          <span className="mb-0 text-dark txt-ellipsis-1 f-s-16 f-w-500">Candidates</span>
                                          <span className="text-secondary mb-0">notified candidate applies</span>
                                        </span>
                                      </span>
                                    </label>
                                  </div>
                                  <div className="select-item">
                                    <input className="form-check-input form-check-primary w-25 h-25" type="checkbox" id="checkbox-email2" />
                                    <label className="form-check-label" htmlFor="checkbox-email2">
                                      <span className="d-flex align-items-center">
                                        <span className="ms-3 privacy-content">
                                          <span className="mb-0 text-dark txt-ellipsis-1 f-s-16 f-w-500">Offers</span>
                                          <span className="text-secondary mb-0">notified accepts or rejects</span>
                                        </span>
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-6 mt-lg-0 mt-3">
                                <div className="notification-push">
                                  <h6 className="mb-0">Push Notification</h6>
                                  <p className="mb-0">These are delivered via SMS to your mobile phone.</p>
                                  <div className="d-flex align-items-center gap-1 mt-3">
                                    <input className="form-check-input form-check-primary f-s-18 mb-1 m-1" type="radio" name="flexRadioDefault" id="radio_default1" />
                                    <label className="form-check-label" htmlFor="radio_default1">
                                      <span className="mb-0 f-s-16 f-w-500">Everything</span>
                                    </label>
                                  </div>
                                  <div className="d-flex align-items-center gap-1 mt-3">
                                    <input className="form-check-input form-check-primary f-s-18 mb-1 m-1" type="radio" name="flexRadioDefault" id="radio_default2" />
                                    <label className="form-check-label" htmlFor="radio_default2">
                                      <span className="mb-0 f-s-16 f-w-500">Same as email</span>
                                    </label>
                                  </div>
                                  <div className="d-flex align-items-center gap-1 mt-3">
                                    <input className="form-check-input form-check-primary f-s-18 mb-1 m-1" type="radio" name="flexRadioDefault" id="radio_default3" />
                                    <label className="form-check-label" htmlFor="radio_default3">
                                      <span className="mb-0 f-s-16 f-w-500">No push notification</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="app-divider-v"></div>

                            <div className="col-12">
                              <ul className="notified-contet share-menu-list">
                                <li>
                                  <div className="share-menu-item mb-4">
                                    <span className="share-menu-img text-outline-primary h-45 w-45 d-flex-center b-r-10">
                                      <i className="ph-bold ph-device-mobile-speaker f-s-30"></i>
                                    </span>
                                    <div className="share-menu-content">
                                      <h6 className="mb-0 txt-ellipsis-1">Mobile push notification</h6>
                                      <p className="mb-0 txt-ellipsis-1 text-secondary">Receive all notifications via your mobile app</p>
                                    </div>
                                    <div className="form-check form-switch d-flex mt-1">
                                      <input className="form-check-input form-check-primary ms-3 fs-3 me-3" type="checkbox" id="basic-switch-6" defaultChecked />
                                      <label className="form-check-label pt-2" htmlFor="basic-switch-6"></label>
                                    </div>
                                  </div>
                                </li>
                                <li>
                                  <div className="share-menu-item mb-4">
                                    <span className="share-menu-img text-outline-success h-45 w-45 d-flex-center b-r-10">
                                      <i className="ph-bold ph-desktop f-s-30"></i>
                                    </span>
                                    <div className="share-menu-content">
                                      <h6 className="mb-0 txt-ellipsis-1">Desktop push notification</h6>
                                      <p className="mb-0 txt-ellipsis-1 text-secondary">Receive all notifications via your desktop app</p>
                                    </div>
                                    <div className="form-check form-switch d-flex mt-1">
                                      <input className="form-check-input form-check-primary ms-3 fs-3 me-3" type="checkbox" id="basic-switch-4" defaultChecked />
                                      <label className="form-check-label pt-2" htmlFor="basic-switch-4"></label>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
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

        {/* Footer Placeholder */}
        <footer>
          <p>Footer Placeholder</p>
        </footer>
      </div>

      {/* Customizer Placeholder */}
      <div id="customizer"></div>
    </div>
  );
};


const loadScripts = () => {
  const scripts = [
    '../assets/vendor/sweetalert/sweetalert.js',
    '../assets/vendor/select/select2.min.js',
    '../assets/vendor/glightbox/glightbox.min.js',
    '../assets/vendor/apexcharts/apexcharts.min.js',
    '../assets/js/setting.js',
  ];
  scripts.forEach((src) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  });
};


export default Profile;