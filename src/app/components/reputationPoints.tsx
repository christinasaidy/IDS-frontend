import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";

interface UserActivity {
  postCount: number;
  commentCount: number;
  engagementCount: number;
}

const ReputationPoints: React.FC<{ userId: number }> = ({ userId }) => {
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [reputation, setReputation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user activity data from the backend
    const fetchUserActivity = async () => {
      try {
        const response = await fetch(
          `http://localhost:5128/Users/${userId}/activity`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user activity");
        }

        const activityData: UserActivity = await response.json();
        setActivity(activityData);
        calculateReputation(activityData);
      } catch (error) {
        console.error("Error fetching user activity:", error);
        setError("Failed to fetch reputation data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, [userId]);

  // Function to calculate reputation points
  const calculateReputation = (activity: UserActivity) => {
    const postWeight = 10; // 10 points per post
    const commentWeight = 5; // 5 points per comment
    const engagementWeight = 2; // 2 points per engagement

    const totalReputation =
      activity.postCount * postWeight +
      activity.commentCount * commentWeight +
      activity.engagementCount * engagementWeight;

    setReputation(totalReputation);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (!activity) {
    return (
      <Typography variant="body1" align="center">
        No activity data found.
      </Typography>
    );
  }

  return (
    <Card
      sx={{
        textAlign: "center",
        padding: "24px",
        marginBottom: "32px",
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Reputation Points
      </Typography>
      <Typography variant="h4" color="primary" gutterBottom>
        {reputation}
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Typography variant="body1">
            <strong>Posts:</strong> {activity.postCount}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">
            <strong>Comments:</strong> {activity.commentCount}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">
            <strong>Engagement:</strong> {activity.engagementCount}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ReputationPoints;