"use client";
import React, { useEffect, useState } from "react";
import { styled } from "@mui/system";
import { Avatar, Card, CardContent, Grid, Typography, Container, Box } from "@mui/material";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: "24px",
  textAlign: "center",
  marginBottom: "32px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: "120px",
  height: "120px",
  margin: "0 auto 16px",
  border: "4px solid #fff",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
}));

const PostCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)"
  }
}));

const UserProfile = () => {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the username from the API
    fetch('http://localhost:5128/Users/username', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token if required for authentication
      }
    })
      .then(response => response.json())
      .then(data => {
        setUsername(data.username);
      })
      .catch(err => {
        setError("Failed to fetch username.");
        console.error(err);
      });
  }, []);

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!username) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const userData = {
    username: username,
    bio: "Professional photographer and digital artist. Passionate about capturing moments and creating beautiful visual stories.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    posts: [
      {
        id: 1,
        title: "Summer Adventure",
        content: "Exploring hidden beaches and capturing the perfect sunset",
        timestamp: "2 hours ago",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
      },
      {
        id: 2,
        title: "Urban Photography",
        content: "Street photography in the heart of the city",
        timestamp: "1 day ago",
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000"
      },
      {
        id: 3,
        title: "Nature's Beauty",
        content: "Found this amazing spot during my morning hike",
        timestamp: "3 days ago",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <StyledCard>
        <ProfileAvatar
          alt={userData.username}
          src={userData.profileImage}
          imgProps={{
            onError: (e) => {
              e.target.src = "https://images.unsplash.com/photo-1511367461989-f85a21fda167";
            }
          }}
        />
        <Typography variant="h4" gutterBottom>
          {userData.username}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {userData.bio}
        </Typography>
      </StyledCard>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recent Posts
      </Typography>

      <Grid container spacing={3}>
        {userData.posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <PostCard>
              <Box
                sx={{
                  height: 200,
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1531482615713-2afd69097998";
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {post.timestamp}
                  </Typography>
                  <Box>
                    <FiEdit
                      style={{ cursor: "pointer", marginRight: "8px" }}
                      size={18}
                    />
                    <FiTrash2
                      style={{ cursor: "pointer", color: "#d32f2f" }}
                      size={18}
                    />
                  </Box>
                </Box>
              </CardContent>
            </PostCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default UserProfile;
