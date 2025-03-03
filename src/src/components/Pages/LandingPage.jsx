import React, { useEffect } from 'react';
import { Navbar as BSNavbar, Nav, Button, Tab, Tabs } from 'react-bootstrap';
import Typed from 'typed.js';
import AOS from 'aos';

// Importation de toutes les images
import LogoBlanc from '../../assets/images/logo/LogoBlanc.png';
import VectorShaps from '../../assets/images/landing/vector-shaps.png';
import BannerImg from '../../assets/images/landing/banner-img.gif';
import BannerImg1 from '../../assets/images/landing/banner-img-1.gif';
import LogoNoir from '../../assets/images/logo/LogoNoir.png';
import ProjectDashboard from '../../assets/images/landing/project-dashboard.jpg';
import EcommerceDashboard from '../../assets/images/landing/ecommerce-dashboard.jpg';
import EmailImg from '../../assets/images/landing/email.jpg';
import TodoImg from '../../assets/images/landing/todo.jpg';
import FileManagerImg from '../../assets/images/landing/file-manager.jpg';
import BlogImg from '../../assets/images/landing/blog.jpg';
import AvtarImg from '../../assets/images/landing/avtar.jpg';
import AccordionsImg from '../../assets/images/landing/accordions.jpg';
import ProgressImg from '../../assets/images/landing/progress.jpg';
import NotificationImg from '../../assets/images/landing/notification.jpg';
import TourImg from '../../assets/images/landing/tour.jpg';
import SliderImg from '../../assets/images/landing/slider.jpg';
import RatingImg from '../../assets/images/landing/rating.jpg';
import CountDownImg from '../../assets/images/landing/count-down.jpg';
import FontAwesomeImg from '../../assets/images/landing/font-awesome.jpg';
import FlagImg from '../../assets/images/landing/flag.jpg';
import AnimatedImg from '../../assets/images/landing/animated.jpg';
import WeatherImg from '../../assets/images/landing/weather.jpg';
import DarkLayout from '../../assets/images/landing/dark-layout.png';
import DarkLayout1 from '../../assets/images/landing/dark-layout-1.png';
import { Link } from "react-router-dom";

function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
    const typed = new Typed('#highlight-typed', {
      strings: ['Projects', 'Teams', 'Workflow'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
    });
    return () => typed.destroy();
    
  }, []);

  return (
    <div className="bg-white landing-page">
      <div className="app-wrapper flex-column">
        {/* Cursor */}
        <div className="circle-cursor"></div>

        <div className="landing-wrapper">
          {/* Navbar */}
          <BSNavbar expand="lg" className="sticky-top landing-nav_main px-3 position-fixed w-100" style={{ backgroundColor: "#202335" }}>
            <div className="container-fluid">
              <BSNavbar.Brand href="index.php">
                <img alt="logo" src={LogoBlanc} width="150" />
              </BSNavbar.Brand>
              <BSNavbar.Toggle aria-controls="landing_nav" />
              <BSNavbar.Collapse id="landing_nav">
                <Nav className="m-auto">
                  <Nav.Link href="" active>Home</Nav.Link>
                  <Nav.Link href="#AboutUs">About Us</Nav.Link>
                  <Nav.Link href="#services">Features</Nav.Link>
                  <Nav.Link href="mailto:Contact@orkestra.tn" target="_blank">Contact</Nav.Link>
                </Nav>
                <Link to="/signin">
                <Button variant="danger" className="rounded" >
                  Sign In
                </Button></Link>
                <Link to="/signup">
                <Button variant="primary" className="ms-2 rounded">
                  Sign Up
                </Button></Link>
              </BSNavbar.Collapse>
            </div>
          </BSNavbar>

          {/* Hero Section */}
          <section className="landing-section p-0">
            <div className="container-fluid">
              <div className="row landing-content">
                <div className="col-lg-6 offset-lg-3 position-relative">
                  <div className="landing-heading text-center">
                    <h1>
                      Power Up Your <br /> <span id="highlight-typed"></span> With Orkestra <br/>
                    </h1>
                    <img
                      alt="shape"
                      className="img-fluid landing-vector-shape"
                      src={VectorShaps}
                    />
                    <p>Orkestra is the best AI based <br />project management platform!</p>
                    <div className="mg-t-60">
                      <a
                        className="btn btn-danger py-3 px-4 b-r-50 btn-lg ms-2"
                        href="https://phpstack-1384472-5121645.cloudwaysapps.com/document/php/Orkestra/index.html"
                        target="_blank"
                        role="button"
                      >
                        Try it now
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="landing-img">
                    <div className="img-box">
                      <div>
                        <img alt="img" className="box-img-1" src={BannerImg} />
                      </div>
                      <div>
                        <img alt="img" className="box-img-4" src={BannerImg1} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* About Us Section */}
        <section className="card-section" id="AboutUs">
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="landing-title">
                  <h1>
                    About <span className="highlight-title">Us</span>
                  </h1>
                  <p>
                    At Orkestra, we harness the power of artificial intelligence to make project management smarter, more
                    efficient, and seamlessly accessible to everyone.
                  </p>
                  <p>
                    Our mission is to help engineers, project managers, and teams organize, track, and successfully complete
                    their projects without getting lost in complex processes.
                  </p>
                </div>
                <ul className="card-details-list">
                  <li>AI-based task prioritization</li>
                  <li>AI-based project delay prediction</li>
                  <li>Predictive Analytics for Task Completion</li>
                  <li>Task assignment recommendation</li>
                </ul>
              </div>
              <div className="col-lg-5 col-sm-6 d-flex align-items-center justify-content-center">
                <img src={LogoNoir} alt="Logo Orkestra" width="400" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="services" className="dark-section py-5">
          <div className="container">
            <h1 className="text-center mb-2" style={{ color: '#f00ac8' }}>Our Features</h1>
            <p className="text-center text-light mb-4">Empowering you with the best tools for project success.</p>
            <div className="row text-center">
              <div className="col-md-4 mb-4 d-flex">
                <div className="service-box p-4 border rounded shadow-sm w-100 h-100">
                  <i className="fas fa-user-shield fa-3x"></i>
                  <h3 className="highlight-title mt-3">User Authentication</h3>
                  <p>Secure login and role-based access ensure that only authorized users can view or modify project details.</p>
                </div>
              </div>
              <div className="col-md-4 mb-4 d-flex">
                <div className="service-box p-4 border rounded shadow-sm w-100 h-100">
                  <i className="fas fa-folder-open fa-3x"></i>
                  <h3 className="highlight-title mt-3">Project Management</h3>
                  <p>Easily create, track, and manage projects, keeping everything on schedule with real-time updates.</p>
                </div>
              </div>
              <div className="col-md-4 mb-4 d-flex">
                <div className="service-box p-4 border rounded shadow-sm w-100 h-100">
                  <i className="fas fa-list-check fa-3x"></i>
                  <h3 className="highlight-title mt-3">Task Management</h3>
                  <p>Create, assign, and prioritize tasks efficiently to boost productivity and meet deadlines.</p>
                </div>
              </div>
              <div className="col-md-6 mb-4 d-flex">
                <div className="service-box p-4 border rounded shadow-sm w-100 h-100">
                  <i className="fas fa-bell fa-3x"></i>
                  <h3 className="highlight-title mt-3">Dashboard & Smart Notifications</h3>
                  <p>Get a clear project overview with a customizable dashboard and stay informed with smart alerts.</p>
                </div>
              </div>
              <div className="col-md-6 mb-4 d-flex">
                <div className="service-box p-4 border rounded shadow-sm w-100 h-100">
                  <i className="fas fa-history fa-3x"></i>
                  <h3 className="highlight-title mt-3">Activity Log & History</h3>
                  <p>Track all project activities, decisions, and updates for transparency and accountability.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="demos-section" id="Demo" style={{ backgroundColor: 'rgb(252, 247, 247)' }}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-xl-6 offset-xl-3">
                <div className="landing-title text-md-center">
                  <h3>
                    Orkestra <span className="highlight-title">revolutionizes</span> project management
                  </h3>
                  <p>Take a glimpse at our platform through a showcase of key features designed specifically to optimize your workflow.</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-8 offset-xl-2">
                <div className="demos-tab-section">
                  <Tabs defaultActiveKey="dashboard" id="v-bg" className="nav-tabs app-tabs-dark">
                    <Tab eventKey="dashboard" title={<span><i className="ti ti-home pe-2 ps-1"></i> Projects</span>}>
                      <div className="tab-pane fade show active" id="dashboard-tab-pane" role="tabpanel" tabIndex="0">
                        <div className="row justify-content-center">
                          <div className="col-sm-6 col-lg-3">
                            <div className="card demo-card">
                              <div className="card-body">
                                <img alt="demo-img" className="img-fluid b-r-8" src={ProjectDashboard} />
                                <div className="demo-box">
                                  <h6 className="m-0 f-w-500 f-s-18">Project</h6>
                                  <a className="btn btn-light-success icon-btn b-r-22" href="index.php" target="_blank" role="button">
                                    <i className="ti ti-chevrons-right"></i>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-3">
                            <div className="card demo-card">
                              <div className="card-body">
                                <img alt="demo-img" className="img-fluid b-r-8" src={EcommerceDashboard} />
                                <div className="demo-box">
                                  <h6 className="m-0 f-w-500 f-s-18">Ecommerce</h6>
                                  <a className="btn btn-light-primary icon-btn b-r-22" href="ecommerce_dashboard.php" target="_blank" role="button">
                                    <i className="ti ti-chevrons-right"></i>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey="apps" title={<span><i className="ti ti-server pe-2 ps-1"></i> Tasks</span>}>
                      <div className="row">
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={EmailImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Email</h6>
                                <a className="btn btn-light-danger icon-btn b-r-22" href="email.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={TodoImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Todo</h6>
                                <a className="btn btn-light-success icon-btn b-r-22" href="to_do.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={FileManagerImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">File manager</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="filemanager.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={BlogImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Blog</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="blog.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey="ui" title={<span><i className="ti ti-first-aid-kit pe-2 ps-1"></i> Dashboard</span>}>
                      <div className="row">
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={AvtarImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Avatar</h6>
                                <a className="btn btn-light-danger icon-btn b-r-22" href="avtar.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={AccordionsImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Accordions</h6>
                                <a className="btn btn-light-warning icon-btn b-r-22" href="accordions.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={ProgressImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Progress</h6>
                                <a className="btn btn-light-success icon-btn b-r-22" href="progress.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={NotificationImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Notifications</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="notifications.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey="advance-ui" title={<span><i className="ti ti-briefcase pe-2 ps-1"></i> Activity Logs</span>}>
                      <div className="row">
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={TourImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Tour</h6>
                                <a className="btn btn-light-danger icon-btn b-r-22" href="tour.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={SliderImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Slider</h6>
                                <a className="btn btn-light-warning icon-btn b-r-22" href="slick.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={RatingImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Rating</h6>
                                <a className="btn btn-light-success icon-btn b-r-22" href="ratings.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={CountDownImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Count Down</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="count_down.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey="icons" title={<span><i className="ti ti-icons pe-2 ps-2"></i> More</span>}>
                      <div className="row">
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={FontAwesomeImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Fontawesome Icons</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="fontawesome.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={FlagImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Flag Icons</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="flag_icons.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={AnimatedImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Animated Icons</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="animated_icon.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                          <div className="card demo-card">
                            <div className="card-body">
                              <img alt="demo-img" className="img-fluid b-r-8" src={WeatherImg} />
                              <div className="demo-box">
                                <h6 className="m-0 f-w-500 f-s-18">Weather Icons</h6>
                                <a className="btn btn-light-primary icon-btn b-r-22" href="weather_icon.php" target="_blank" role="button">
                                  <i className="ti ti-chevrons-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dark Layout Section (Static) */}
        <section className="dark-section">
          <div className="container">
            <div className="row">
              <div className="col-xl-6 offset-xl-3">
                <div className="landing-title text-md-center">
                  <h2>
                    Discover Our <span className="highlight-title">Dark Layout</span>
                  </h2>
                  <p className="text-light">
                    Embrace the elegance of the dark layout, where simplicity meets sophistication. Navigate effortlessly through your admin tasks with style.
                  </p>
                </div>
              </div>
              <div className="col-12">
                <div className="slider-container">
                  <div className="slider-container-box">
                    <div className="slider-slideLeft">
                      <img alt="" className="img-fluid" src={DarkLayout} />
                    </div>
                  </div>
                  <div className="slider-container-box slider-left">
                    <div className="slider-slideRight">
                      <img alt="" className="img-fluid" src={DarkLayout1} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 text-center">
                <Button variant="primary" size="lg" className="mt-5" id="darkDemoBtn">
                  Check Now <i className="ti ti-chevrons-right ms-2"></i>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Wrapper Section */}
        <section className="box-wrapper-section p-0">
          <div className="container-fluid box-wrapper">
            <ul className="box-wrapper-list">
              <li>Prioritization of Tasks with AI Assistance</li>
              <li>Analytics Dashboard for Project Insights</li>
              <li>Predictive Analytics for Risk & Deadline Management</li>
              <li>Advanced Role-Based Access and Permissions</li>
              <li>Task Dependencies and Milestone Tracking</li>
              <li>Real-Time Project Status Updates</li>
              <li>Task and Resource Allocation</li>
              <li>Comprehensive Activity Log</li>
              <li>Integration with 3rd Party Tools</li>
              <li>Team Performance Metrics</li>
              <li>Secure Cloud Storage for Documents</li>
              <li>Prioritization of Tasks with AI Assistance</li>
              <li>Analytics Dashboard for Project Insights</li>
              <li>Predictive Analytics for Risk & Deadline Management</li>
              <li>Advanced Role-Based Access and Permissions</li>
              <li>Task Dependencies and Milestone Tracking</li>
              <li>Real-Time Project Status Updates</li>
              <li>Task and Resource Allocation</li>
              <li>Comprehensive Activity Log</li>
              <li>Integration with 3rd Party Tools</li>
              <li>Team Performance Metrics</li>
              <li>Secure Cloud Storage for Documents</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <section className="landing-footer">
          <div className="container">
            <div className="d-flex align-items-between flex-wrap">
              <div className="col-md-3 text-white">
                <h3 className="text-white">
                  The best <span className="highlight-title">AI powered</span> Project Management platform!
                </h3>
              </div>
              <div className="col-md-3 text-white">
                <h3 className="text-white">
                  Our <span className="highlight-title">Features</span>
                </h3>
                <ul className="list-unstyled">
                  <li><i className="fas fa-user-check"></i> User Authentication</li>
                  <li><i className="fas fa-project-diagram"></i> Project Management</li>
                  <li><i className="fas fa-tasks"></i> Task Management</li>
                  <li><i className="fas fa-bell"></i> Dashboard & Smart Notifications</li>
                  <li><i className="fas fa-history"></i> Activity Log & History</li>
                </ul>
              </div>
              <div className="col-md-3">
                <h3 className="text-white">
                  Contact <span className="highlight-title">us</span>
                </h3>
                <ul className="list-unstyled">
                  <li><i className="fas fa-phone-alt"></i> <a className="text-white" href="tel:+21629197240">+216 29 197 240</a></li>
                  <li><i className="fas fa-envelope"></i> <a className="text-white" href="mailto:contact@orkestra.tn">contact@orkestra.tn</a></li>
                  <li><i className="fab fa-facebook"></i> <a className="text-white" href="https://facebook.com/orkestra" target="_blank">Facebook</a></li>
                  <li><i className="fab fa-instagram"></i> <a className="text-white" href="https://instagram.com/orkestra" target="_blank">Instagram</a></li>
                  <li><i className="fab fa-twitter"></i> <a className="text-white" href="https://twitter.com/orkestra" target="_blank">Twitter</a></li>
                </ul>
              </div>
              <div className="col-md-3 d-flex align-items-center justify-content-center">
                <img alt="logo" src={LogoBlanc} width="300" />
              </div>
            </div>
          </div>
        </section>

        {/* Tap on Top */}
        <div className="go-top">
          <span className="progress-value">
            <i className="ti ti-arrow-up"></i>
          </span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;