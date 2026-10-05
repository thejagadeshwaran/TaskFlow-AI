import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";

import socket, {
  connectSocket
} from "../services/socket";

import "./Activity.css";


function Activity() {

  const { projectId } = useParams();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // FETCH ACTIVITIES
  // ==========================================

  useEffect(() => {

    const fetchActivities = async () => {

      try {

        setLoading(true);
        setError("");


        console.log(
          "Activity Project ID:",
          projectId
        );


        if (!projectId) {

          setError(
            "Project ID not found"
          );

          return;

        }


        const response = await api.get(
          `/activities/${projectId}`
        );


        console.log(
          "Activity Response:",
          response.data
        );


        setActivities(
          response.data.activities || []
        );


      } catch (err) {

        console.error(
          "Activity API Error:",
          err
        );


        setError(
          err.response?.data?.message ||
          "Failed to load activities"
        );


      } finally {

        setLoading(false);

      }

    };


    fetchActivities();

  }, [projectId]);


  // ==========================================
  // REAL-TIME ACTIVITY
  // ==========================================

  useEffect(() => {

    if (!projectId) {
      return;
    }


    // Connect Socket.IO
    connectSocket();


    console.log(
      "🔌 Activity Socket connecting..."
    );


    // ==========================================
    // JOIN PROJECT ROOM
    // ==========================================

    socket.emit(
      "join_project",
      projectId
    );


    // ==========================================
    // NEW ACTIVITY
    // ==========================================

    const handleActivityCreated = (
      newActivity
    ) => {

      console.log(
        "📋 Real-time activity received:",
        newActivity
      );


      // Make sure activity belongs
      // to current project

      const activityProjectId =
        typeof newActivity.project === "object"
          ? newActivity.project?._id
          : newActivity.project;


      if (
        activityProjectId &&
        activityProjectId !== projectId
      ) {

        return;

      }


      // Add activity to beginning
      // Prevent duplicates

      setActivities((previousActivities) => {

        const alreadyExists =
          previousActivities.some(
            (activity) =>
              activity._id ===
              newActivity._id
          );


        if (alreadyExists) {

          return previousActivities;

        }


        return [
          newActivity,
          ...previousActivities
        ];

      });

    };


    // ==========================================
    // SOCKET LISTENER
    // ==========================================

    socket.on(
      "activity_created",
      handleActivityCreated
    );


    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {

      socket.off(
        "activity_created",
        handleActivityCreated
      );


      socket.emit(
        "leave_project",
        projectId
      );

    };

  }, [projectId]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="activity-page">

        <h1>
          Activity
        </h1>

        <p>
          Loading activities...
        </p>

      </div>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="activity-page">

        <h1>
          Activity
        </h1>

        <p className="activity-error">
          {error}
        </p>

      </div>

    );

  }


  // ==========================================
  // ACTIVITY PAGE
  // ==========================================

  return (

    <div className="activity-page">


      {/* HEADER */}

      <div className="activity-header">

        <div>

          <h1>
            Activity
          </h1>

          <p>
            Recent project activity
          </p>

        </div>

      </div>


      {/* EMPTY */}

      {activities.length === 0 ? (

        <div className="empty-activity">

          <div className="empty-icon">
            📋
          </div>

          <h3>
            No activity yet
          </h3>

          <p>
            Project and task activity
            will appear here.
          </p>

        </div>

      ) : (


        /* ACTIVITY LIST */

        <div className="activity-list">

          {activities.map(
            (activity) => (

              <div
                className="activity-item"
                key={activity._id}
              >


                {/* ICON */}

                <div className="activity-icon">

                  {getActivityIcon(
                    activity.action
                  )}

                </div>


                {/* CONTENT */}

                <div className="activity-content">

                  <div className="activity-description">

                    {activity.description}

                  </div>


                  <div className="activity-meta">

                    <span>
                      {activity.user?.name ||
                        "Unknown User"}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {formatDate(
                        activity.createdAt
                      )}
                    </span>

                  </div>

                </div>


              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}


// ==========================================
// ACTIVITY ICON
// ==========================================

function getActivityIcon(action) {

  switch (action) {

    case "created":
      return "➕";

    case "updated":
      return "✏️";

    case "deleted":
      return "🗑️";

    case "commented":
      return "💬";

    default:
      return "📌";

  }

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

  if (!date) {
    return "";
  }


  return new Date(
    date
  ).toLocaleString();

}


export default Activity;