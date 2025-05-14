import React, { useEffect, useState, useRef } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import LogoBlanc from '../../assets/images/logo/LogoNoir.png';
import Header from '../Layout/Header';
import Sidebar from '../Layout/SideBar';
import '../../assets/css/Report.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Report = () => {
  const [report, setReport] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExportButton, setShowExportButton] = useState(true);
  const [annotation, setAnnotation] = useState('');
  const [exportOptions, setExportOptions] = useState({
    metrics: true,
    charts: true,
    projectDetails: true,
    clusters: true
  });
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        // Récupérer le Kareport
        const reportResponse = await axios.get('https://backend-projectmanagement-5rbq.onrender.com/api/projects/reports/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!reportResponse.data) {
          throw new Error('No data received');
        }
        console.log('Report received:', reportResponse.data);
        setReport(reportResponse.data);

        // Récupérer les clusters
        const usersSkills = [
          ["react", "javascript", "css"],
          ["node.js", "sql", "express"],
          ["docker", "aws", "kubernetes"],
          ["react", "typescript"]
          // Ajouter plus pour tester : simuler beaucoup de lignes
          // ...Array(20).fill(["react", "javascript"])
        ];
        const clusterResponse = await axios.post('https://backend-projectmanagement-5rbq.onrender.com/api/projects/cluster-users', {
          users_skills: usersSkills,
          numClusters: 3
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Clusters received:', clusterResponse.data);

        // Mapper les clusters aux noms significatifs
        const clusterNames = {
          "0": "Frontend",
          "1": "Backend",
          "2": "DevOps"
        };
        const mappedClusters = {};
        Object.entries(clusterResponse.data.clusters).forEach(([clusterId, users]) => {
          const clusterName = clusterNames[clusterId] || `Cluster ${clusterId}`;
          mappedClusters[clusterName] = users.map(user => ({
            firstname: user.firstname || 'Unknown',
            lastname: user.lastname || '',
            skills: user.skills || []
          }));
        });
        setClusters(mappedClusters);

        setError(null);
      } catch (error) {
        console.error('Error loading data:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setError('Unable to load the report or clusters. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData().catch(err => console.error('Unhandled error:', err));
  }, []);

  const exportPDF = async () => {
    if (!report || !reportRef.current) {
      console.error('No report or container to export');
      return;
    }

    setShowExportButton(false);
    await new Promise(resolve => setTimeout(resolve, 100));

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableHeight = pageHeight - 2 * margin;
    let currentY = margin;

    try {
      // Sections à exporter
      const sections = [
        { element: reportRef.current.queryQuerySelector('header'), include: true },
        { element: reportRef.current.querySelector('.metrics'), include: exportOptions.metrics },
        { element: reportRef.current.querySelector('.charts'), include: exportOptions.charts },
        { element: reportRef.current.querySelector('.project-details'), include: exportOptions.projectDetails },
        { element: reportRef.current.querySelector('.clusters'), include: exportOptions.clusters },
        { element: reportRef.current.querySelector('.annotations'), include: exportOptions.projectDetails }
      ];

      // Masquer les éléments non sélectionnés et le textarea
      sections.forEach(({ element, include }) => {
        if (element && !include) element.style.display = 'none';
      });
      const textarea = reportRef.current.querySelector('.annotations textarea');
      if (textarea) textarea.style.display = 'none';

      // Ajouter chaque section au PDF
      for (const { element, include } of sections) {
        if (!element || !include) continue;

        // Capturer la section
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: element.scrollWidth
        });
        const imgData = canvas.toDataURL('image/png');

        // Calculer les dimensions
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        // Ajouter l'image section par section
        while (heightLeft > 0) {
          if (currentY + Math.min(heightLeft, usableHeight) > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }

          doc.addImage(
            imgData,
            'PNG',
            margin,
            currentY,
            imgWidth,
            Math.min(heightLeft, usableHeight),
            undefined,
            'FAST'
          );

          heightLeft -= usableHeight;
          currentY += Math.min(imgHeight, usableHeight);
          if (heightLeft > 0) {
            doc.addPage();
            currentY = margin;
          }
        }

        // Ajouter un espacement entre sections
        currentY += 5;
      }

      // Ajouter la signature sur la dernière page
      if (currentY + 15 > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFont('Times', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(133, 117, 236);
      doc.text('Signature', margin, pageHeight - margin - 5);
      doc.setLineWidth(0.5);
      doc.setDrawColor(133, 117, 236);
      doc.line(margin + 20, pageHeight - margin - 5, margin + 80, pageHeight - margin - 5);
      doc.setDrawColor(0);

      doc.save('Report Generated By Orkestra.pdf');
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setShowExportButton(true);
      sections.forEach(({ element }) => {
        if (element) element.style.display = '';
      });
      if (textarea) textarea.style.display = '';
    }
  };

  const exportCSV = () => {
    if (!report) {
      console.error('No report to export');
      return;
    }

    const csvData = [];

    csvData.push(['Section', 'Metric', 'Value']);
    csvData.push(['Projects', 'Total', report.data?.totalProjects || 0]);
    csvData.push(['Projects', 'Pending', report.data?.projectsByStatus?.Pending || 0]);
    csvData.push(['Projects', 'In Progress', report.data?.projectsByStatus?.['In Progress'] || 0]);
    csvData.push(['Projects', 'Completed', report.data?.projectsByStatus?.Completed || 0]);
    csvData.push(['Tasks', 'Total', report.data?.totalTasks || 0]);
    csvData.push(['Tasks', 'Completion', `${report.data?.completionRate || 0}%`]);
    csvData.push(['Tasks', 'Delayed', report.data?.delayedTasks || 0]);
    csvData.push(['Team', 'Active Members', report.data?.activeMembers || 0]);
    csvData.push(['Team', 'Avg. Workload', `${report.data?.avgWorkload || 0} tasks/member`]);
    csvData.push(['Timelines', 'Avg. Duration', `${report.data?.avgProjectDuration || 0} days`]);
    csvData.push(['Timelines', 'Avg. Time Remaining', `${report.data?.avgRemainingTime || 0} days`]);

    if (report.data?.longestProjects?.length) {
      csvData.push([]);
      csvData.push(['Longest Projects']);
      csvData.push(['Name', 'Duration']);
      report.data.longestProjects.forEach(p => {
        csvData.push([p.name || 'Unknown', `${p.duration.toFixed(1)} days`]);
      });
    }

    if (exportOptions.clusters && clusters) {
      csvData.push([]);
      csvData.push(['Team Clusters']);
      csvData.push(['Cluster', 'User', 'Skills']);
      Object.entries(clusters).forEach(([clusterName, users]) => {
        users.forEach(user => {
          csvData.push([clusterName, `${user.firstname} ${user.lastname}`, user.skills.join(', ')]);
        });
      });
    }

    if (report.data?.projectDetails?.length) {
      csvData.push([]);
      csvData.push(['Project Details']);
      csvData.push(['Name', 'Status', 'Duration (days)', 'Total Tasks', 'Completed Tasks']);
      report.data.projectDetails.forEach(p => {
        csvData.push([
          p.name || 'Unknown',
          p.status || 'N/A',
          p.duration || 'N/A',
          p.totalTasks || 0,
          p.completedTasks || 0
        ]);
      });
    }

    if (annotation) {
      csvData.push([]);
      csvData.push(['Annotation']);
      csvData.push([annotation]);
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Report_Orkestra_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleExportOptionChange = (e) => {
    const { name, checked } = e.target;
    setExportOptions(prev => ({ ...prev, [name]: checked }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!report) return <div>No report available</div>;

  const projectsChartData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      label: 'Projects',
      data: [
        report.data?.projectsByStatus?.Pending || 0,
        report.data?.projectsByStatus?.['In Progress'] || 0,
        report.data?.projectsByStatus?.Completed || 0
      ],
      backgroundColor: ['#FFA500', '#007BFF', '#28A745'],
      borderColor: ['#CC8400', '#0056B3', '#1E7E34'],
      borderWidth: 1
    }]
  };

  const tasksChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [
        report.data?.completionRate || 0,
        100 - (report.data?.completionRate || 0)
      ],
      backgroundColor: ['#28A745', '#DC3545'],
      borderColor: ['#1E7E34', '#B02A37'],
      borderWidth: 1
    }]
  };

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <div className="app-content">
        <main>
          <div className="report-container" ref={reportRef}>
            <header>
              <div className="header-info">
                <p>Generated by: {report.generatedBy || 'Unknown'}</p>
                <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
              <img src={LogoBlanc} alt="Orkestra Logo" className="logo" onError={() => console.error('Logo not loaded')} />
              <h1 className="text-center" style={{ fontWeight: 900, textShadow: '1px 1px 2px rgba(0,0,0,0.2)', color: '#8575ec' }}>
                Project Overview Report
              </h1>
              <br />
            </header>

            <section className="metrics">
              <div className="metric-card pending">
                <h3>Projects</h3>
                <p>Total: {report.data?.totalProjects || 0}</p>
                <p>Pending: {report.data?.projectsByStatus?.Pending || 0}</p>
                <p>In Progress: {report.data?.projectsByStatus?.['In Progress'] || 0}</p>
                <p>Completed: {report.data?.projectsByStatus?.Completed || 0}</p>
              </div>
              <div className="metric-card completed">
                <h3>Tasks</h3>
                <p>Total: {report.data?.totalTasks || 0}</p>
                <p>Completion: {report.data?.completionRate || 0}%</p>
                <p>Delayed: {report.data?.delayedTasks || 0}</p>
              </div>
              <div className="metric-card delayed">
                <h3>Team</h3>
                <p>Active Members: {report.data?.activeMembers || 0}</p>
                <p>Avg. Workload: {report.data?.avgWorkload || 0} tasks/member</p>
              </div>
              <div className="metric-card duration">
                <h3>Timelines</h3>
                <p>Avg. Duration: {report.data?.avgProjectDuration || 0} days</p>
                <p>Avg. Time Remaining: {report.data?.avgRemainingTime || 0} days</p>
              </div>
              <div className="metric-card workload">
                <h3>Longest Projects</h3>
                {report.data?.longestProjects?.length ? (
                  report.data.longestProjects.map((p, i) => (
                    <p key={i}>{p.name}: {p.duration.toFixed(1)} days</p>
                  ))
                ) : (
                  <p>No projects available</p>
                )}
              </div>
            </section>

            <section className="charts">
              <div className="chart-container project-chart">
                <h3>Projects by Status</h3>
                <Bar
                  id="projectsChart"
                  data={projectsChartData}
                  options={{ scales: { y: { beginAtZero: true } } }}
                />
              </div>
              <div className="chart-container task-chart">
                <h3>Task Distribution</h3>
                <Doughnut id="tasksChart" data={tasksChartData} />
              </div>
            </section>

            <section className="project-details">
              <h2>Project Details</h2>
              {report.data?.projectDetails?.length ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Duration (days)</th>
                      <th>Total Tasks</th>
                      <th>Completed Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.projectDetails.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name || 'Unknown'}</td>
                        <td>{p.status || 'N/A'}</td>
                        <td>{p.duration || 'N/A'}</td>
                        <td>{p.totalTasks || 0}</td>
                        <td>{p.completedTasks || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No project details available</p>
              )}
            </section>

            <section className="clusters">
              <h2>Team Clusters</h2>
              {clusters && Object.keys(clusters).length > 0 ? (
                <div className="row">
                  {Object.entries(clusters).map(([clusterName, users], index) => (
                    <div key={clusterName} className="col-12 col-md-4 mb-4">
                      <div className={`card cluster-card cluster-${clusterName.toLowerCase()}`}>
                        <div className="card-header">
                          <h3 className="card-title">{clusterName}</h3>
                        </div>
                        <div className="card-body">
                          {users.length > 0 ? (
                            <ul className="list-group list-group-flush">
                              {users.map(user => (
                                <li key={`${user.firstname}-${user.lastname}`} className="list-group-item">
                                  <strong>{user.firstname} {user.lastname}</strong>
                                  <p className="mb-0">Skills: {user.skills.join(', ')}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No users in this cluster</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No clusters available</p>
              )}
            </section>

            <section className="annotations">
              <h2>Annotations</h2>
              <textarea
                className="form-control"
                placeholder="Add comments to the report..."
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                rows="4"
              ></textarea>
              {annotation && (
                <div className="annotation-content">
                  <h3>Note :</h3>
                  <p>{annotation}</p>
                </div>
              )}
            </section>

            {showExportButton && (
              <div className="text-center">
                <div className="export-options">
                  <h3>Export Options</h3>
                  <div className="checkbox-container">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="metrics"
                        name="metrics"
                        checked={exportOptions.metrics}
                        onChange={handleExportOptionChange}
                      />
                      <label className="form-check-label" htmlFor="metrics">
                        Include Metrics
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="charts"
                        name="charts"
                        checked={exportOptions.charts}
                        onChange={handleExportOptionChange}
                      />
                      <label className="form-check-label" htmlFor="charts">
                        Include Charts
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="projectDetails"
                        name="projectDetails"
                        checked={exportOptions.projectDetails}
                        onChange={handleExportOptionChange}
                      />
                      <label className="form-check-label" htmlFor="projectDetails">
                        Include Project Details & Annotations
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="clusters"
                        name="clusters"
                        checked={exportOptions.clusters}
                        onChange={handleExportOptionChange}
                      />
                      <label className="form-check-label" htmlFor="clusters">
                        Include Team Clusters
                      </label>
                    </div>
                  </div>
                </div>
                <button onClick={exportPDF} className="btn btn-primary m-2">
                  Export to PDF
                </button>
                <button onClick={exportCSV} className="btn btn-secondary m-2">
                  Export to CSV
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Report;