import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LogoNoir from '../../assets/images/logo/LogoNoir.png';

// Define the API base URL using the deployed backend URL
const API_BASE_URL = "https://backend-projectmanagement-ip1e.onrender.com";

const EmailSend = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });

      if (response.status === 200) {
        setMessage("A reset code has been sent to your email!");
        setError('');

        setTimeout(() => {
          navigate('/codeverif', { state: { email: email } });
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred while sending the reset code. Please check the console for details.');
      setMessage('');
      console.error('Error details:', err.response?.data || err.message);
    }
  };

  const handleReset = () => {
    setEmail('');
  };

  return (
    <div className="app-wrapper d-block">
      <div className="">
        <main className="w-100 p-0">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 p-0">
                <div className="login-form-container">
                  <div className="mb-4">
                    <img src={LogoNoir} alt="Logo Orkestra" width="250" />
                  </div>
                  <div className="form_container">
                    <form className="app-form rounded-control" onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-5 text-center">
                            <h2 className="text-primary-dark">Reset Password</h2>
                            <p>Please enter your email address below,<br />you will receive a code shortly</p>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="verification-box">
                            <div>
                              <input
                                className="form-control w-350 text-center"
                                id="one"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        {message && (
                          <div className="col-12 text-center mt-3">
                            <p className="text-success">{message}</p>
                          </div>
                        )}
                        {error && (
                          <div className="col-12 text-center mt-3">
                            <p className="text-danger">{error}</p>
                          </div>
                        )}
                        <div className="col-12">
                          <div className="mb-3">
                            <button
                              className="btn btnSignIn w-100"
                              type="submit"
                            >
                              Send
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
        </main>
      </div>
    </div>
  );
};

export default EmailSend;