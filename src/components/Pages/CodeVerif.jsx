import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assurez-vous d'avoir installé axios
import logo from '../../assets/images/logo/1.png'; // Logo image

const CodeVerification = () => {
  const [resetCode, setResetCode] = useState(['', '', '', '', '']); // State pour le code de réinitialisation à 5 chiffres
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const inputRefs = useRef([]); // Refs pour gérer le focus des inputs

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "defaultEmail@example.com"; // Récupérer l'email du paramètre d'état

  // digitValidate : Assurer que seuls les chiffres sont saisis
  const digitValidate = (value) => {
    return value.replace(/[^0-9]/g, ''); // Remplacer les caractères non numériques
  };

  // Gérer le changement dans les inputs
  const handleInputChange = (index, value) => {
    const validatedValue = digitValidate(value);
    if (validatedValue.length <= 1) { // Limiter à 1 caractère
      const newResetCode = [...resetCode];
      newResetCode[index] = validatedValue;
      setResetCode(newResetCode);

      // Déplacer le focus vers l'input suivant si un chiffre est saisi
      if (validatedValue && index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Gérer la touche Backspace pour déplacer le focus vers l'input précédent
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const resetCodeString = resetCode.join(''); // Joindre les chiffres du code

    // Valider la longueur du code
    if (resetCodeString.length !== 5) {
      setError('The reset code must be 5 digits.');
      return;
    }

    try {
      // Appel à l'API de vérification
      const response = await axios.post('http://localhost:4000/api/auth/verify-code', { email, resetCode: resetCodeString });

      if (response.status === 200) {
        setMessage('The reset code has been successfully verified.');
        setError('');
        
        // Redirection vers la page de réinitialisation du mot de passe
        navigate('/pswdreset', { state: { resetCode: resetCodeString, email } }); 
      }
    } catch (err) {
      setMessage('');
      if (err.response) {
        setError(err.response.data.message || 'Invalid code, please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  // Gérer la réinitialisation des champs
  const handleReset = () => {
    setResetCode(['', '', '', '', '']);
    inputRefs.current[0].focus(); // Focus sur le premier champ après réinitialisation
  };

  return (
    <div className="app-wrapper d-block">
      <Container fluid>
        <Row>
          <Col xs={12} className="p-0">
            <div className="login-form-container">
              {/* Logo */}
              <div className="mb-4">
                <a className="logo d-inline-block" href="/index">
                  <img alt="Logo" src={logo} width="250" />
                </a>
              </div>

              {/* Formulaire */}
              <div className="form_container">
                <Form className="app-form rounded-control" onSubmit={handleSubmit}>
                  <Row>
                    {/* Titre et Description */}
                    <Col xs={12}>
                      <div className="mb-5 text-center">
                        <h2 className="text-primary-dark">Email Code</h2>
                        <p>Enter the 5 digit code sent to your email : <strong>{email}</strong></p>
                      </div>
                    </Col>

                    {/* Champs pour le code OTP */}
                    <Col xs={12}>
                      <div className="verification-box d-flex justify-content-center gap-2">
                        {resetCode.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)} // Assignation des refs
                            className="form-control h-60 w-60 text-center"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)} // Gérer le backspace
                            type="text"
                          />
                        ))}
                      </div>
                    </Col>

                    {/* Messages */}
                    {message && (
                      <Col xs={12} className="text-center mt-3">
                        <p className="text-success">{message}</p>
                      </Col>
                    )}
                    {error && (
                      <Col xs={12} className="text-center mt-3">
                        <p className="text-danger">{error}</p>
                      </Col>
                    )}

                    

                    {/* Bouton de vérification */}
                    <Col xs={12}>
                      <div className="mb-3">
                        <button
                          className="btn btnSignIn w-100"
                          type="submit"
                        >
                          Verify
                        </button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CodeVerification;
