import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./assets/vendor/devicon/devicon.min.css";
import "./assets/vendor/aos/aos.css";
import "./assets/vendor/slick/slick.css";
import "./assets/vendor/slick/slick-theme.css";
import "./assets/vendor/fontawesome/css/all.css";
import "./assets/vendor/animation/animate.min.css";
import "./assets/vendor/ionio-icon/css/iconoir.css";
import "./assets/vendor/tabler-icons/tabler-icons.css";
import "./assets/vendor/flag-icons-master/flag-icon.css";
import "./assets/vendor/bootstrap/bootstrap.min.css"; // Bootstrap en premier
import "./assets/vendor/prism/prism.min.css";
import "./assets/vendor/simplebar/simplebar.css";
import "./assets/css/style.css"; // Style.css après
import "./assets/css/responsive.css"; // Responsive.css en dernier



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)