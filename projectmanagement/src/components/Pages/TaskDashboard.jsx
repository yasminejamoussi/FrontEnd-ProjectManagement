import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Header from '../Layout/Header.jsx'; // Importer Header pour cohérence

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchTasksAndPredictions = async () => {
      try {
        const tasksResponse = await axios.get('http://localhost:4000/api/tasks');
        setTasks(tasksResponse.data);

        const predictionPromises = tasksResponse.data.map(async (task) => {
          const predictionResponse = await axios.get(
            `http://localhost:4000/api/tasks/${task._id}/predict-delay`
          );
          return { taskId: task._id, ...predictionResponse.data };
        });
        const predictionResults = await Promise.all(predictionPromises);
        const predictionsMap = predictionResults.reduce((acc, pred) => ({
          ...acc,
          [pred.taskId]: pred,
        }), {});
        setPredictions(predictionsMap);
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches ou prédictions :', error);
      }
    };

    fetchTasksAndPredictions();
  }, []);

  const handleExtendDueDate = async (taskId) => {
    const prediction = predictions[taskId];
    if (!prediction) return;

    try {
      const response = await axios.post(`http://localhost:4000/api/tasks/${taskId}/adjust`, {
        newDueDate: prediction.suggestedDueDate,
      });
      setNotification(response.data.notification.message);
      setTimeout(() => setNotification(null), 5000);

      const tasksResponse = await axios.get('http://localhost:4000/api/tasks');
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Erreur lors de l’extension de la date :', error);
      setNotification('Erreur lors de l’ajustement');
    }
  };

  const handleAssignMember = async (taskId) => {
    try {
      const memberResponse = await axios.get(`http://localhost:4000/api/tasks/${taskId}/suggest-member`);
      const newMemberId = memberResponse.data._id;

      if (!newMemberId) {
        setNotification('Aucun membre disponible');
        return;
      }

      const response = await axios.post(`http://localhost:4000/api/tasks/${taskId}/adjust`, {
        newMemberId,
      });
      setNotification(response.data.notification.message);
      setTimeout(() => setNotification(null), 5000);

      const tasksResponse = await axios.get('http://localhost:4000/api/tasks');
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Erreur lors de l’assignation du membre :', error);
      setNotification('Erreur lors de l’ajustement');
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : 'N/A';
  };

  return (
    <div>
      <Header />
      <div className="container-fluid">
        <h2 className="offcanvas-title">Tableau de bord des tâches</h2>
        {notification && (
          <div className="notification-head-container p-3">
            <p className="text-success mb-0">{notification}</p>
          </div>
        )}
        <div className="row">
          {tasks.length === 0 ? (
            <p className="text-muted">Aucune tâche assignée.</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="col-md-6 mb-3">
                <div className="head-container notification-head-container p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <NavLink to={`/task-details/${task._id}`} className="f-s-15 text-secondary mb-0">
                        <span className="f-w-500 text-secondary">{task.title}</span>
                      </NavLink>
                      <p className="f-s-13 mb-0 text-secondary">
                        Projet : {task.project?.name || 'Inconnu'} | Échéance : {formatDate(task.dueDate)}
                      </p>
                      <p className="f-s-13 mb-0 text-secondary">Statut : {task.status}</p>
                      {predictions[task._id]?.isLate && (
                        <span className="badge bg-danger text-white">En retard</span>
                      )}
                      {predictions[task._id]?.atRisk && !predictions[task._id]?.isLate && (
                        <span className="badge bg-warning text-dark">À risque</span>
                      )}
                    </div>
                    {(predictions[task._id]?.atRisk || predictions[task._id]?.isLate) && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleExtendDueDate(task._id)}
                        >
                          Prolonger ({formatDate(predictions[task._id]?.suggestedDueDate)})
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAssignMember(task._id)}
                        >
                          Ajouter membre
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;