import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Analytics() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // 1. Load Projects
  // ==========================================
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await api.get("/projects");
        const projectList =
          response.data?.projects || response.data?.data || [];

        setProjects(projectList);

        if (projectList.length > 0) {
          const firstProjectId = projectList[0]._id || projectList[0].id;
          setProjectId(firstProjectId);
        } else {
          setError("No projects found. Please create a project first.");
        }
      } catch (err) {
        console.error("❌ Projects error:", err);
        setError(err.response?.data?.message || "Failed to load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // ==========================================
  // 2. Load Analytics
  // ==========================================
  useEffect(() => {
    if (!projectId) return;

    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        setAnalytics(null);
        setError("");

        const response = await api.get(`/analytics/project/${projectId}`);
        setAnalytics(response.data?.analytics);
      } catch (err) {
        console.error("❌ Analytics error:", err);
        setError(
          err.response?.data?.message || "Failed to load project analytics."
        );
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  // ==========================================
  // Loading Projects
  // ==========================================
  if (loadingProjects) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>📊 Project Analytics</h1>
        <p style={styles.loadingText}>Loading projects...</p>
      </div>
    );
  }

  // ==========================================
  // Error (no projects)
  // ==========================================
  if (error && projects.length === 0) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>📊 Project Analytics</h1>
        <div style={styles.errorBox}>
          <strong>Analytics Error:</strong>
          <p style={{ margin: "8px 0 0" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Project Analytics</h1>
          <p style={styles.subtitle}>
            Track your project task progress and productivity.
          </p>
        </div>

        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Project Selector */}
      <div style={styles.selectorContainer}>
        <label style={styles.label}>Select Project</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={styles.select}
        >
          {projects.map((project) => (
            <option
              key={project._id || project.id}
              value={project._id || project.id}
            >
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Analytics */}
      {loadingAnalytics && (
        <div style={styles.loadingText}>Loading analytics...</div>
      )}

      {/* Error */}
      {error && projects.length > 0 && (
        <div style={styles.errorBox}>
          <strong>Analytics Error:</strong>
          <p style={{ margin: "8px 0 0" }}>{error}</p>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && !loadingAnalytics && (
        <div style={styles.grid}>
          <div style={{ ...styles.card, ...styles.cardBlue }}>
            <h2 style={styles.cardValue}>{analytics.totalTasks ?? 0}</h2>
            <p style={styles.cardLabel}>Total Tasks</p>
          </div>

          <div style={{ ...styles.card, ...styles.cardGreen }}>
            <h2 style={styles.cardValue}>{analytics.completedTasks ?? 0}</h2>
            <p style={styles.cardLabel}>Completed</p>
          </div>

          <div style={{ ...styles.card, ...styles.cardYellow }}>
            <h2 style={styles.cardValue}>{analytics.inProgressTasks ?? 0}</h2>
            <p style={styles.cardLabel}>In Progress</p>
          </div>

          <div style={{ ...styles.card, ...styles.cardPurple }}>
            <h2 style={styles.cardValue}>{analytics.pendingTasks ?? 0}</h2>
            <p style={styles.cardLabel}>Pending</p>
          </div>

          <div style={{ ...styles.card, ...styles.cardRed }}>
            <h2 style={styles.cardValue}>{analytics.overdueTasks ?? 0}</h2>
            <p style={styles.cardLabel}>Overdue</p>
          </div>

          <div style={{ ...styles.card, ...styles.cardCyan }}>
            <h2 style={styles.cardValue}>
              {analytics.completionPercentage ?? 0}%
            </h2>
            <p style={styles.cardLabel}>Completion Rate</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 40px 60px",
    background:
      "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    color: "#f1f5f9",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "36px",
    gap: "20px",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "28px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #f8fafc, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  subtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "15px",
  },

  backBtn: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    color: "#e2e8f0",
    padding: "10px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },

  selectorContainer: {
    marginBottom: "32px",
    maxWidth: "420px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8",
    marginBottom: "8px",
  },

  select: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    outline: "none",
  },

  loadingText: {
    color: "#94a3b8",
    padding: "20px 0",
    fontSize: "15px",
  },

  errorBox: {
    padding: "16px 20px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    color: "#f87171",
    marginBottom: "24px",
    maxWidth: "600px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "16px",
    padding: "28px 24px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },

  cardValue: {
    margin: "0 0 10px 0",
    fontSize: "36px",
    fontWeight: "700",
    letterSpacing: "-1px",
    color: "#f8fafc",
  },

  cardLabel: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // Accent colors for cards
  cardBlue: {
    borderLeft: "4px solid #3b82f6",
  },
  cardGreen: {
    borderLeft: "4px solid #10b981",
  },
  cardYellow: {
    borderLeft: "4px solid #f59e0b",
  },
  cardPurple: {
    borderLeft: "4px solid #8b5cf6",
  },
  cardRed: {
    borderLeft: "4px solid #ef4444",
  },
  cardCyan: {
    borderLeft: "4px solid #06b6d4",
  },
};

export default Analytics;