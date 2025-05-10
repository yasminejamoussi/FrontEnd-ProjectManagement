import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp.jsx";
import Header from "./components/Layout/Header.jsx";
import ApiPage from "./components/Pages/UserList.jsx";
import EmailSend from "./components/Pages/EmailSend.jsx";
import CodeVerification from "./components/Pages/CodeVerif.jsx";
import PasswordReset from "./components/Pages/PasswordReset.jsx";
import UpdateUser from "./components/Pages/UpdateUser.jsx";
import LandingPage from "./components/Pages/LandingPage.jsx";
import Profile from "./components/Pages/Profile.jsx";
import TwoFactorAuth from "./components/Auth/TwoFactorAuth.jsx";
import Sidebar from "./components/Layout/SideBar.jsx";
import RoleManagement from "./components/Pages/RoleManagement.jsx";
import ProjectsDashboard from "./components/Pages/ProjectsDashboard.jsx";
import ProjectDetails from "./components/Pages/ProjectDetails.jsx";
import KanbanBoard from "./components/Pages/KanbanBoard.jsx";
import Dashboardd from "./components/Pages/Dashboard2.jsx";
import Report from "./components/Pages/Report.jsx";
import TeamPage from "./components/Pages/TeamPage.jsx";
import TasksPage from "./components/Pages/TasksPage.jsx";
import ActivityLogs from "./components/Pages/ActivityLogs.jsx";
import NotificationsPage from "./components/Pages/NotificationsPage.jsx";
import { useEffect } from "react";

const AuthHandler = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle token storage when redirected to /dashboard
    if (location.pathname === '/dashboard') {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const email = params.get('email');
      const error = params.get('error');

      if (error) {
        console.error("Authentication error:", error);
        navigate('/signin', { state: { error: "Google authentication failed" } });
        return;
      }

      if (token && email) {
        const userInfo = { email, token };
        localStorage.setItem('user-info', JSON.stringify(userInfo));
        console.log("User logged in:", userInfo);
        navigate('/dashboard', { replace: true }); // Clear query params
      }
    }

    // Handle error display when redirected to /signin
    if (location.pathname === '/signin') {
      const params = new URLSearchParams(location.search);
      const error = params.get('error');
      if (error) {
        navigate('/signin', { state: { error: "Google authentication failed" }, replace: true });
      }
    }
  }, [location, navigate]);

  return children;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthHandler>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/header" element={<Header />} />
            <Route path="/users" element={<ApiPage />} />
            <Route path="/updatee-user/:id" element={<UpdateUser />} />
            <Route path="/emailsend" element={<EmailSend />} />
            <Route path="/codeverif" element={<CodeVerification />} />
            <Route path="/pswdreset" element={<PasswordReset />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify-2fa" element={<TwoFactorAuth />} />
            <Route path="/side" element={<Sidebar />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/projects" element={<ProjectsDashboard />} />
            <Route path="/project-details/:id" element={<ProjectDetails />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/kanban/:projectId?" element={<KanbanBoard />} />
            <Route path="/dashboard" element={<Dashboardd />} />
            <Route path="/report" element={<Report />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/tasksusers" element={<TasksPage />} />
            <Route path="/activitylogs" element={<ActivityLogs />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </AuthHandler>
      </Router>
    </HelmetProvider>
  );
}

export default App;