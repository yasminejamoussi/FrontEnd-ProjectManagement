import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Clock, CircleDashed, Cloud, FileX, Circle, Ticket, ArrowUp, X } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Sidebar from "../Layout/SideBar";
import Header from '../Layout/Header'; // Adjust path
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom'; 
// Import Images
import Avatar2 from '../../assets/images/avtar/2.png';
import Avatar3 from '../../assets/images/avtar/3.png';
import Avatar4 from '../../assets/images/avtar/4.png';
import Avatar5 from '../../assets/images/avtar/5.png';
import Avatar6 from '../../assets/images/avtar/6.png';
import Avatar7 from '../../assets/images/avtar/7.png';
import Avatar8 from '../../assets/images/avtar/8.png';
import CelebrationGif from '../../assets/images/dashboard/ecommerce-dashboard/celebration.gif';
import WelcomeImage from '../../assets/images/modals/welcome-1.png';

const Dashboardd = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();

  const generateReport = () => {
    navigate('/report');
  };

  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="loader-wrapper">
          <div className="loader_16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid mt-4">
            <div className="row mb-4">
              {/* Project Status Table */}
              <div className="col-lg-8 col-xl-7 order-1-md mb-4 mb-lg-0">
                <div className="p-3">
                  <h5 className="section-title">Project Status</h5>
                </div>
                <div className="card shadow-sm mb-0">
                  <div className="card-body py-3 px-0 overflow-hidden">
                    <div className="table-responsive app-scroll">
                      <table className="table align-middle project-status-table mb-0">
                        <thead>
                          <tr>
                            <th scope="col">Project</th>
                            <th scope="col">Status</th>
                            <th scope="col">TeamLead</th>
                            <th scope="col">Priority</th>
                            <th scope="col">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><h6 className="mb-0 text-success-dark text-nowrap">Web Redesign</h6></td>
                            <td><span className="badge text-light-warning bg-light-warning f-s-9 f-w-700">In Progress</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Athena Stewart">
                                <img alt="avatar" className="img-fluid" src={Avatar2} />
                              </a>
                            </td>
                            <td className="text-success-dark f-w-600">High</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Design phase completed</span></td>
                          </tr>
                          <tr>
                            <td><h6 className="mb-0 text-warning-dark text-nowrap">Mobile App</h6></td>
                            <td><span className="badge text-light-success bg-light-success f-s-9 f-w-700">Completed</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Jane Smith">
                                <img alt="avatar" className="img-fluid" src={Avatar3} />
                              </a>
                            </td>
                            <td className="text-secondary-dark f-w-600">Medium</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Project deployed successfully</span></td>
                          </tr>
                          <tr>
                            <td><h6 className="mb-0 text-danger-dark text-nowrap">Campaign</h6></td>
                            <td><span className="badge text-light-secondary bg-light-secondary f-s-9 f-w-700">Not Started</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Mark Lee">
                                <img alt="avatar" className="img-fluid" src={Avatar4} />
                              </a>
                            </td>
                            <td className="text-danger-dark f-w-600">Low</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Campaign to begin in December</span></td>
                          </tr>
                          <tr>
                            <td><h6 className="mb-0 text-primary-dark text-nowrap">E-Commerce</h6></td>
                            <td><span className="badge text-light-warning bg-light-warning f-s-9 f-w-700">In Progress</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Alice Johnson">
                                <img alt="avatar" className="img-fluid" src={Avatar5} />
                              </a>
                            </td>
                            <td className="text-success-dark f-w-600">High</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Initial setup</span></td>
                          </tr>
                          <tr>
                            <td><h6 className="mb-0 text-success-dark text-nowrap">Social Media</h6></td>
                            <td><span className="badge text-light-success bg-light-success f-s-9 f-w-700">Completed</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Bob Brown">
                                <img alt="avatar" className="img-fluid" src={Avatar6} />
                              </a>
                            </td>
                            <td className="text-danger-dark f-w-600">Low</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Campaign launched successfully</span></td>
                          </tr>
                          <tr>
                            <td><h6 className="mb-0 text-info-dark text-nowrap">SEO Optimization</h6></td>
                            <td><span className="badge text-light-warning bg-light-warning f-s-9 f-w-700">In Progress</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Emma Davis">
                                <img alt="avatar" className="img-fluid" src={Avatar7} />
                              </a>
                            </td>
                            <td className="text-secondary-dark f-w-600">Medium</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Keyword analysis ongoing</span></td>
                          </tr>
                          <tr>
                            <td><h6 className="mb-0 text-primary-dark text-nowrap">UI/UX Revamp</h6></td>
                            <td><span className="badge text-light-info bg-light-info f-s-9 f-w-700">Scheduled</span></td>
                            <td className="f-w-600 text-dark">
                              <a className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-secondary m-auto" title="Liam Wilson">
                                <img alt="avatar" className="img-fluid" src={Avatar8} />
                              </a>
                            </td>
                            <td className="text-danger-dark f-w-600">Low</td>
                            <td><span className="text-dark f-s-14 f-w-500 text-nowrap"><CircleDashed className="me-2 f-s-6" /> Resources allocated</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="table-footer d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0 f-s-15 f-w-500 txt-ellipsis-1">Showing 7 to 20 of 20 entries</p>
                  <ul className="pagination app-pagination justify-content-end">
                    <li className="page-item"><a className="page-link b-r-left" href="#">Previous</a></li>
                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                    <li className="page-item active"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item"><a className="page-link b-r-right" href="#">Next</a></li>
                  </ul>
                </div>
                      {/* RAPPORT */}
                      <div className='text-center'>
                  <button className='btn btn-primary' onClick={generateReport}>Generate a report</button>
                </div>
              </div>

              {/* Today Tasks (Vertical List) */}
              <div className="col-lg-4 col-xl-5">
                <div className="p-3">
                  <h5 className="section-title">Today Tasks</h5>
                </div>
                <div className="card shadow-sm">
                  <div className="card-body task-list-container">
                    <div className="task-list">
                      <div className="card task-card bg-danger-300 mb-3">
                        <div className="card-body">
                          <h6 className="text-danger-dark txt-ellipsis-1">Finalize Project Proposal</h6>
                          <ul className="avatar-group justify-content-start my-3">
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-primary">
                              <img alt="avatar" className="img-fluid" src={Avatar4} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-success" title="Lennon Briggs">
                              <img alt="avatar" className="img-fluid" src={Avatar5} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-danger" title="Maya Horton">
                              <img alt="avatar" className="img-fluid" src={Avatar6} />
                            </li>
                          </ul>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="progress w-100" role="progressbar" aria-valuenow="68" aria-valuemin="0" aria-valuemax="100">
                              <div className="progress-bar bg-danger-dark progress-bar-striped progress-bar-animated" style={{ width: '68%' }}></div>
                            </div>
                            <span className="badge bg-white-400 text-secondary-dark ms-2">+ 68%</span>
                          </div>
                        </div>
                      </div>
                      <div className="card task-card bg-warning-300 mb-3">
                        <div className="card-body">
                          <h6 className="text-warning-dark txt-ellipsis-1">Design Homepage Layout</h6>
                          <ul className="avatar-group justify-content-start my-3">
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-primary">
                              <img alt="avatar" className="img-fluid" src={Avatar4} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-info" title="Sophia Turner">
                              <img alt="avatar" className="img-fluid" src={Avatar5} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-warning" title="Lucas Green">
                              <img alt="avatar" className="img-fluid" src={Avatar6} />
                            </li>
                          </ul>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="progress w-100" role="progressbar" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100">
                              <div className="progress-bar bg-warning-dark progress-bar-striped progress-bar-animated" style={{ width: '35%' }}></div>
                            </div>
                            <span className="badge bg-white-400 text-secondary-dark ms-2">+ 35%</span>
                          </div>
                        </div>
                      </div>
                      <div className="card task-card bg-info-300 mb-3">
                        <div className="card-body">
                          <h6 className="text-info-dark txt-ellipsis-1">Develop API Integration</h6>
                          <ul className="avatar-group justify-content-start my-3">
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-info">
                              <img alt="avatar" className="img-fluid" src={Avatar4} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-info" title="Michael Johnson">
                              <img alt="avatar" className="img-fluid" src={Avatar5} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-warning" title="Emily Brown">
                              <img alt="avatar" className="img-fluid" src={Avatar6} />
                            </li>
                          </ul>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="progress w-100" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">
                              <div className="progress-bar bg-info-dark progress-bar-striped progress-bar-animated" style={{ width: '60%' }}></div>
                            </div>
                            <span className="badge bg-white-400 text-secondary-dark ms-2">+ 60%</span>
                          </div>
                        </div>
                      </div>
                      <div className="card task-card bg-success-300 mb-3">
                        <div className="card-body">
                          <h6 className="text-success-dark txt-ellipsis-1">Test User Feedback</h6>
                          <ul className="avatar-group justify-content-start my-3">
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-primary">
                              <img alt="avatar" className="img-fluid" src={Avatar4} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-info" title="Alice Smith">
                              <img alt="avatar" className="img-fluid" src={Avatar5} />
                            </li>
                            <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden bg-success" title="John Doe">
                              <img alt="avatar" className="img-fluid" src={Avatar6} />
                            </li>
                          </ul>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="progress w-100" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100">
                              <div className="progress-bar bg-success-dark progress-bar-striped progress-bar-animated" style={{ width: '80%' }}></div>
                            </div>
                            <span className="badge bg-white-400 text-secondary-dark ms-2">+ 80%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-series Timeline and Simple Pie Chart */}
            <div className="row mb-4">
              {/* Multi-series Timeline */}
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="section-title">Multi-series Timeline</h5>
                  </div>
                  <div className="card-body">
                    <Chart
                      options={{
                        chart: {
                          type: 'rangeBar',
                          toolbar: { show: false },
                        },
                        plotOptions: {
                          bar: {
                            horizontal: true,
                            barHeight: '50%',
                            rangeBarGroupRows: true,
                          },
                        },
                        xaxis: {
                          type: 'datetime',
                          min: new Date('2024-02-27').getTime(),
                          max: new Date('2024-03-20').getTime(),
                          labels: {
                            format: 'dd MMM',
                          },
                        },
                        yaxis: {
                          labels: {
                            style: {
                              fontSize: '14px',
                              fontWeight: 600,
                            },
                          },
                        },
                        fill: {
                          type: 'solid',
                          opacity: [0.6, 1],
                        },
                        colors: ['#6f42c1', '#343a40'],
                        legend: {
                          position: 'top',
                          horizontalAlign: 'right',
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 12,
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: (val) => {
                            const diff = (val[1] - val[0]) / (1000 * 60 * 60 * 24);
                            return `${diff} days`;
                          },
                          style: {
                            colors: ['#fff'],
                            fontSize: '12px',
                          },
                        },
                        tooltip: {
                          enabled: false,
                        },
                      }}
                      series={[
                        {
                          name: 'Bob',
                          data: [
                            { x: 'Design', y: [new Date('2024-03-03').getTime(), new Date('2024-03-06').getTime()] },
                            { x: 'Code', y: [new Date('2024-03-07').getTime(), new Date('2024-03-10').getTime()] },
                            { x: 'Test', y: [new Date('2024-03-11').getTime(), new Date('2024-03-16').getTime()] },
                          ],
                        },
                        {
                          name: 'Joe',
                          data: [
                            { x: 'Design', y: [new Date('2024-03-01').getTime(), new Date('2024-03-04').getTime()] },
                            { x: 'Code', y: [new Date('2024-03-05').getTime(), new Date('2024-03-08').getTime()] },
                            { x: 'Test', y: [new Date('2024-03-09').getTime(), new Date('2024-03-18').getTime()] },
                          ],
                        },
                      ]}
                      type="rangeBar"
                      height={200}
                    />
                  </div>
                </div>
              </div>

              {/* Simple Pie Chart */}
              <div className="col-lg-4">
                <div className="card shadow-sm equal-card">
                  <div className="card-header">
                    <h5 className="section-title">Simple Pie Chart</h5>
                  </div>
                  <div className="card-body">
                    <Chart
                      options={{
                        chart: {
                          type: 'pie',
                        },
                        labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
                        colors: ['#6f42c1', '#343a40', '#28a745', '#dc3545', '#ffc107'],
                        legend: {
                          position: 'bottom',
                          fontSize: '14px',
                          fontWeight: 600,
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 12,
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: (val) => `${val.toFixed(1)}%`,
                        },
                        responsive: [
                          {
                            breakpoint: 480,
                            options: {
                              chart: {
                                width: 200,
                              },
                              legend: {
                                position: 'bottom',
                              },
                            },
                          },
                        ],
                      }}
                      series={[24.9, 31.1, 7.3, 24.3, 12.4]}
                      type="pie"
                      height={200}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Cards, Total Hours, and Orders Details */}
            <div className="row mb-4">
              {/* Ticket Cards and Total Hours */}
              <div className="col-lg-8">
                <div className="row">
                  {/* Left Column: All Tickets and Completed Tickets */}
                  <div className="col-sm-6">
                    {/* All Tickets */}
                    <div className="card ticket-card shadow-sm bg-light-primary mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <Ticket className="f-s-20 text-primary" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">All Tickets</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-primary-dark f-s-28 f-w-700">185</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="Sabrina Torres">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="John Doe">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar5} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar6} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar7} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar8} />
                            </li>
                            <li className="bg-white text-dark h-25 w-25 d-flex-center b-r-50 f-s-12">5+</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Completed Tickets */}
                    <div className="card ticket-card shadow-sm bg-light-success mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <Cloud className="f-s-20 text-success" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">Completed Tickets</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-success-dark f-s-28 f-w-700">185</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar6} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar7} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar8} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar5} />
                            </li>
                            <li className="bg-white text-dark h-25 w-25 d-flex-center b-r-50 f-s-12">5+</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pending Tickets, Cancelled Tickets, and Total Hours */}
                  <div className="col-sm-6">
                    {/* Pending Tickets */}
                    <div className="card ticket-card shadow-sm bg-light-info mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <Clock className="f-s-20 text-info" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">Pending Tickets</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-info-dark f-s-28 f-w-700">185</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar5} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar6} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar7} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar8} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                            <li className="bg-white text-dark h-25 w-25 d-flex-center b-r-50 f-s-12">5+</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Cancelled Tickets */}
                    <div className="card ticket-card shadow-sm bg-light-warning mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <FileX className="f-s-20 text-warning" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">Cancelled Tickets</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-warning-dark f-s-28 f-w-700">185</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar7} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar8} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar5} />
                            </li>
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-danger b-2-light position-relative" title="User">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-danger border border-light rounded-circle"></span>
                              <img alt="" className="img-fluid b-r-50 overflow-hidden" src={Avatar6} />
                            </li>
                            <li className="bg-white text-dark h-25 w-25 d-flex-center b-r-50 f-s-12">5+</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Total Hours */}
                    <div className="card shadow-sm project-total-card mb-4">
                      <div className="card-body">
                        <div className="d-flex position-relative">
                          <h5 className="section-title txt-ellipsis-1">Total Hours</h5>
                        </div>
                        <div>
                          <div className="d-flex justify-content-center">
                            <h2 className="text-info-dark hour-display">00H</h2>
                          </div>
                          <div className="progress-labels mg-t-40">
                            <span className="text-info">Productive</span>
                            <span className="text-info">Middle</span>
                            <span className="text-info">Idle</span>
                          </div>
                          <div className="custom-progress-container info-progress">
                            <div className="progress-bar productive" style={{ width: '50%' }}></div>
                            <div className="progress-bar middle" style={{ width: '30%' }}></div>
                            <div className="progress-bar idle" style={{ width: '20%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Details */}
              <div className="col-lg-4">
                <div className="card shadow-sm order-detail-card">
                  <div className="pt-3">
                    <h5 className="section-title pa-s-20">Orders Details</h5>
                  </div>
                  <div className="card-body">
                    <ul className="order-content-list">
                      <li className="bg-success-300">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-success-dark f-w-600 mb-0">📦#P98056745</h6>
                          <span className="badge text-light-success bg-light-success me-2">Delivered</span>
                        </div>
                        <div>
                          <p className="text-success mb-0 txt-ellipsis-2">Your order was delivered on October 10, 2024.</p>
                        </div>
                      </li>
                      <li className="bg-info-300">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-info-dark f-w-600 mb-0">📦#5Q145586781</h6>
                          <span className="badge text-light-info bg-light-info me-2">Shipped</span>
                        </div>
                        <div>
                          <p className="text-info mb-0 txt-ellipsis-2">Your order has been shipped and will be delivered by...</p>
                        </div>
                      </li>
                      <li className="bg-danger-300">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-danger-dark f-w-600 mb-0">📦#8405L6715</h6>
                          <span className="badge text-light-danger bg-light-danger me-2">Cancelled</span>
                        </div>
                        <div>
                          <p className="text-danger mb-0 txt-ellipsis-2">Your order was cancelled. Date Ordered: October 14...</p>
                        </div>
                      </li>
                      <li className="bg-success-300">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-success-dark f-w-600 mb-0">📦#H5A367890</h6>
                          <span className="badge text-light-success bg-light-success me-2">Delivered</span>
                        </div>
                        <div>
                          <p className="text-success mb-0 txt-ellipsis-2">Your order was delivered on November 30, 2024.</p>
                        </div>
                      </li>
                      <li className="bg-info-300">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-info-dark f-w-600 mb-0">📦#78JY45672</h6>
                          <span className="badge text-light-info bg-light-info me-2">Shipped</span>
                        </div>
                        <div>
                          <p className="text-info mb-0 txt-ellipsis-2">Your order has been shipped and will be delivered by...</p>
                        </div>
                      </li>
                      <li className="bg-danger-300">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="text-danger-dark f-w-600 mb-0">📦#45QRT9823</h6>
                          <span className="badge text-light-danger bg-light-danger me-2">Cancelled</span>
                        </div>
                        <div>
                          <p className="text-danger mb-0 txt-ellipsis-2">Your order was cancelled. Date Ordered: November 28...</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="container-fluid">
                  <div className="row m-1">
                    <div className="col-12">
                      <h4 className="main-title">Calendar</h4>
                    </div>
                  </div>
                  <div className="row m-1 calendar app-fullcalender">
                    <div className="col-12">
                      <div className="card shadow-sm">
                        <div className="card-body" id="mydraggable">
                          <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={[
                              { title: 'kkck', date: '2025-04-07' },
                              { title: 'Event 2', date: '2025-04-15' },
                            ]}
                            headerToolbar={{
                              left: 'prev,next',
                              center: 'title',
                              right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek'
                            }}
                            height="auto"
                            eventBackgroundColor="#6f42c1"
                            eventBorderColor="#6f42c1"
                          />
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

      <div className="go-top">
        <span className="progress-value">
          <ArrowUp />
        </span>
      </div>

      <div className="modal fade" id="welcomeCard" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content welcome-card">
            <div className="modal-body p-0">
              <div className="text-center position-relative welcome-card-content z-1 p-3">
                <div className="text-end position-relative z-1">
                  <X className="fs-5 text-dark f-w-600" data-bs-dismiss="modal" />
                </div>
                <h2 className="f-w-700 text-primary-dark mb-0">
                  <span>Welcome!</span>
                  <img alt="gif" className="w-45 d-inline align-baseline" src={CelebrationGif} />
                </h2>
                <div className="modal-img-box">
                  <img alt="img" className="img-fluid" src={WelcomeImage} />
                </div>
                <div className="modal-btn mb-4">
                  <button className="btn btn-primary text-white btn-sm rounded" data-bs-dismiss="modal" type="button">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboardd;