import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  // You can later fetch real user data from localStorage or API
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "John Doe",
    email: "john@example.com",
    role: "Project Manager",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div>
          <h1>👤 Profile</h1>
          <p>Manage your TaskFlow AI account</p>
        </div>

        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <span className="profile-role">{user.role || "Member"}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="profile-divider"></div>

        {/* Info Grid */}
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user.name}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user.email}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Role</span>
            <span className="detail-value">{user.role || "Member"}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Account Status</span>
            <span className="detail-value status-active">● Active</span>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="edit-btn" onClick={() => alert("Edit Profile coming soon!")}>
            ✏️ Edit Profile
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;