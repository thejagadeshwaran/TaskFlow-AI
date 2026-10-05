import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Teams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // FETCH TEAMS
  // =========================
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/teams");
      console.log("TEAM RESPONSE:", response.data);

      if (response.data.success) {
        setTeams(response.data.teams || []);
      }
    } catch (err) {
      console.error("FETCH TEAMS ERROR:", err);
      setError(err.response?.data?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // =========================
  // CREATE TEAM
  // =========================
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Team name is required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/teams", {
        name: name.trim(),
        description: description.trim(),
      });

      console.log("CREATE TEAM RESPONSE:", response.data);

      if (response.data.success) {
        setMessage("Team created successfully! 🎉");
        setName("");
        setDescription("");
        fetchTeams();
      }
    } catch (err) {
      console.error("CREATE TEAM ERROR:", err);
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* =========================
          HEADER
      ========================= */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Teams</h1>
          <p style={styles.subtitle}>Manage your TaskFlow AI teams</p>
        </div>

        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* =========================
          CREATE TEAM CARD
      ========================= */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Create New Team</h2>

        <form onSubmit={handleCreateTeam}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Team Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
              rows="4"
              style={styles.textarea}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.createBtn,
              ...(loading ? styles.createBtnDisabled : {}),
            }}
          >
            {loading ? "Creating..." : "+ Create Team"}
          </button>
        </form>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>❌ {error}</div>}
      </div>

      {/* =========================
          TEAM LIST
      ========================= */}
      <div style={styles.card}>
        <div style={styles.listHeader}>
          <h2 style={styles.cardTitle}>My Teams</h2>
          <span style={styles.count}>{teams.length}</span>
        </div>

        {loading && teams.length === 0 ? (
          <p style={styles.loadingText}>Loading teams...</p>
        ) : teams.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No teams yet</h3>
            <p style={styles.emptyText}>
              Create your first team above to get started.
            </p>
          </div>
        ) : (
          <div style={styles.teamsGrid}>
            {teams.map((team) => (
              <div key={team._id} style={styles.teamCard}>
                <div style={styles.teamAvatar}>
                  {team.name?.charAt(0).toUpperCase() || "T"}
                </div>

                <div style={styles.teamContent}>
                  <h3 style={styles.teamName}>{team.name}</h3>
                  <p style={styles.teamDescription}>
                    {team.description || "No description"}
                  </p>
                  <span style={styles.teamId}>
                    ID: {team._id?.slice(-6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
    background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
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
    transition: "all 0.25s ease",
  },

  card: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "18px",
    padding: "28px 32px",
    marginBottom: "28px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
  },

  cardTitle: {
    margin: "0 0 22px 0",
    fontSize: "18px",
    fontWeight: "650",
    color: "#f1f5f9",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "100px",
  },

  createBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
  },

  createBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  success: {
    marginTop: "18px",
    padding: "13px 16px",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "12px",
    color: "#34d399",
    fontSize: "14px",
    fontWeight: "500",
  },

  error: {
    marginTop: "18px",
    padding: "13px 16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    color: "#f87171",
    fontSize: "14px",
    fontWeight: "500",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  count: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    fontSize: "13px",
    fontWeight: "700",
    padding: "5px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(59, 130, 246, 0.25)",
  },

  loadingText: {
    color: "#94a3b8",
    padding: "20px 0",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.7,
  },

  emptyTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    color: "#e2e8f0",
  },

  emptyText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "14px",
  },

  teamsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "18px",
    marginTop: "12px",
  },

  teamCard: {
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    gap: "16px",
    transition: "all 0.3s ease",
  },

  teamAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "white",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.35)",
  },

  teamContent: {
    flex: 1,
    minWidth: 0,
  },

  teamName: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "650",
    color: "#f8fafc",
  },

  teamDescription: {
    margin: "0 0 10px 0",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.4,
  },

  teamId: {
    fontSize: "11px",
    color: "#64748b",
    fontFamily: "monospace",
  },
};

export default Teams;