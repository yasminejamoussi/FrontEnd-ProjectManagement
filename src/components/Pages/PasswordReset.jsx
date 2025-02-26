import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios'; // Pour les appels API

const PasswordReset = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null); // Pour gérer les erreurs
  const [success, setSuccess] = useState(false); // Pour le message de succès
  const navigate = useNavigate(); // Pour la navigation après réinitialisation

  // Récupérer le code de réinitialisation et l'email depuis l'état de la navigation
  const location = useLocation();
// Récupérer le code de réinitialisation  
  const { resetCode, email } = location.state || {};  // Récupérer l'email (valeur par défaut si non défini)

  useEffect(() => {
    if (!resetCode) {
      setError("Invalid or missing reset code.");
    }
  }, [resetCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      // Remplacer par votre point de terminaison API réel
      const response = await axios.post('http://localhost:4000/api/auth/reset-password', {
        email: email, // L'email dynamique de l'utilisateur
        resetCode: resetCode, // Le code de réinitialisation passé depuis la page précédente
        newPassword: formData.newPassword
      });

      if (response.status === 200) {
        setSuccess(true);
        // Rediriger vers la page de connexion après la réinitialisation réussie
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError("Error resetting password. Please try again.");
      console.error("Reset password error:", err);
    }
  };

  return (
    <div className="app-wrapper d-block">
      <main className="w-100 p-0">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 p-0">
              <div className="login-form-container">
                <div className="mb-4">
                  <Link to="/" className="logo d-inline-block">
                    <img
                      alt="Logo"
                      src="/images/logo/1.png"
                      width="250"
                    />
                  </Link>
                </div>
                <div className="form_container">
                  <form className="app-form rounded-control" onSubmit={handleSubmit}>
                    <div className="mb-3 text-center">
                      <h3 className="text-primary-dark">Reset Your Password</h3>
                      <p className="f-s-12 text-secondary">
                        Please enter your new password in the section below
                      </p>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">Password reset successful! Redirecting...</div>}
                    <div className="mb-3">
                      <label className="form-label">New password</label>
                      <input
                        className="form-control"
                        placeholder="Enter Your Password"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        className="form-control"
                        placeholder="Confirm Your Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <button
                        className="btn btnSignIn w-100"
                        type="submit"
                      >
                        Reset Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PasswordReset;
