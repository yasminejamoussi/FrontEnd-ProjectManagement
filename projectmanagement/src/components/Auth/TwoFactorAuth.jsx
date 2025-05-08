import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LogoNoir from '../../assets/images/logo/LogoNoir.png';

const TwoFactorAuth = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        if (!email) {
          throw new Error("Aucun email trouvé dans le stockage local !");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token manquant !");
        }
        

       
        const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
        const response = await fetch(`${apiBaseUrl}/api/auth/generate-2fa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        });

        console.log("📌 Réponse API QR Code:", response.data);

        if (!response.data.qrCode) {
          throw new Error("Erreur lors de la récupération du QR Code");
        }

        setQrCode(response.data.qrCode);
      } catch (error) {
        console.error("❌ Erreur lors de la génération du QR Code :", error);
        setError(error.message);
      }
    };

    fetchQRCode();
  }, [email]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (!email) {
        throw new Error("Aucun email trouvé pour la vérification du 2FA !");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant !");
      }

      // Activer le 2FA
   
      const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
      const enableResponse = await fetch(`${apiBaseUrl}/api/auth/enable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, token: verificationCode }),
      });

      console.log("📌 Réponse API Enable 2FA:", enableResponse.data);

      if (!enableResponse.data.message) {
        throw new Error("Échec de l'activation du 2FA");
      }

      // Vérifier le 2FA et récupérer le token
      const verifyResponse = await fetch(`${apiBaseUrl}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, token: verificationCode }),
      });

      console.log("📌 Réponse API Vérification 2FA:", verifyResponse.data);

      if (!verifyResponse.data.token) {
        throw new Error("Vérification du code 2FA échouée : aucun token reçu");
      }

      alert("✅ 2FA successfully verified !");
      localStorage.setItem("token", verifyResponse.data.token);
      localStorage.removeItem("qrCode"); // Nettoyer le QR code
      localStorage.removeItem("email"); // Nettoyer l'email
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Erreur lors de la vérification 2FA :", error);
      setError(error.message);
    }
  };

  return (
    <div className="sign-in-bg">
      <div className="app-wrapper d-block">
        <div className="main-container">
          <div className="container">
            <div className="row sign-in-content-bg">
              <div className="col-lg-6 image-contentbox d-none d-lg-block">
                <div className="form-container">
                  <div className="signup-content mt-4">
                    <span>
                      <img src={LogoNoir} alt="Orkestra Logo" width="400" />
                    </span>
                  </div>
                  <div className="signup-bg-img">
                    <img alt="2FA" className="img-fluid" src="/images/login/01.png" />
                  </div>
                </div>
              </div>

              <div className="col-lg-6 form-contentbox">
                <div className="form-container">
                  <form className="app-form rounded-control" onSubmit={handleVerifyCode}>
                    <div className="row">
                      <div className="col-12 text-center text-lg-start mb-5">
                        <h2 className="text-primary-dark f-w-600">Enter Your 2FA Code</h2>
                        <p>Scan the QR code with your Google Authenticator app.</p>
                      </div>

                      {error && <div className="alert alert-danger">{error}</div>}

                      <div className="col-12 mb-3">
                        {qrCode ? (
                          <img src={qrCode} alt="QR Code" className="img-fluid" />
                        ) : (
                          <p>Chargement du QR Code...</p>
                        )}
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label" htmlFor="verificationCode">Verification Code</label>
                        <input
                          className="form-control"
                          id="verificationCode"
                          placeholder="Enter the code"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <button className="btn btn-light-primary w-100" type="submit">Verify Code</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;