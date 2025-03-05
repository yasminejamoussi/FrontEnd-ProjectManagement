import React, { useState } from 'react';
import { Link, useNavigate,useLocation } from 'react-router-dom'; // Import useNavigate from react-router-dom
import axios from 'axios'; // Ensure axios is installed

const EmailSend = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/api/auth/forgot-password', { email });
     
      if (response.status === 200) {
        setMessage("A reset code has been sent to your email!");
        setError('');

        // Redirect to the verification page after success
        setTimeout(() => {
          navigate('/codeverif', { state: { email: email } }); // Redirect to the VerificationCode page
        }, 2000); // Optional: Delay the redirect for 2 seconds
      }
    } catch (err) {
      setError('An error occurred while sending the reset code.');
      setMessage('');
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
