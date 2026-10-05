import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import "./App.css";

// ==========================================
// PAGES
// ==========================================

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Teams from "./pages/Teams.jsx";
import Tasks from "./pages/Tasks.jsx";
import KanbanBoard from "./pages/KanbanBoard.jsx";
import Comments from "./pages/Comments.jsx";
import Analytics from "./pages/Analytics.jsx";
import Activity from "./pages/Activity.jsx";
import Notifications from "./pages/Notifications.jsx";

// 🤖 AI Assistant
import AIAssistant from "./pages/AIAssistant.jsx";

// 👤 Profile
import Profile from "./pages/Profile.jsx";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==========================================
            🔐 LOGIN
        ========================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==========================================
            📝 REGISTER / CREATE USER
        ========================================== */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==========================================
            🏠 DASHBOARD
        ========================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ==========================================
            👥 TEAMS
        ========================================== */}

        <Route
          path="/teams"
          element={<Teams />}
        />


        {/* ==========================================
            ✅ TASKS
        ========================================== */}

        {/* Normal Tasks page */}

        <Route
          path="/tasks"
          element={<Tasks />}
        />


        {/* My Tasks shortcut */}

        <Route
          path="/my-tasks"
          element={<Tasks />}
        />


        {/* ==========================================
            📌 KANBAN BOARD
        ========================================== */}

        <Route
          path="/kanban"
          element={<KanbanBoard />}
        />


        {/* ==========================================
            💬 COMMENTS
        ========================================== */}

        <Route
          path="/comments"
          element={<Comments />}
        />


        {/* ==========================================
            📊 ANALYTICS
        ========================================== */}

        <Route
          path="/analytics"
          element={<Analytics />}
        />


        {/* ==========================================
            📝 ACTIVITY
        ========================================== */}

        <Route
          path="/activity/:projectId"
          element={<Activity />}
        />


        {/* ==========================================
            🔔 NOTIFICATIONS
        ========================================== */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* ==========================================
            🤖 AI ASSISTANT
        ========================================== */}

        <Route
          path="/ai-assistant"
          element={<AIAssistant />}
        />


        {/* ==========================================
            👤 PROFILE
        ========================================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* ==========================================
            🏠 DEFAULT ROUTE
        ========================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* ==========================================
            ❌ 404
        ========================================== */}

        <Route
          path="*"
          element={

            <div className="not-found">

              <h1>
                404
              </h1>

              <p>
                Page not found
              </p>

              <a href="/login">
                Back to Login
              </a>

            </div>

          }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;