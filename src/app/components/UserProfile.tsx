"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Card, CardContent, Grid, Typography, Container, Box, IconButton, Button, CardMedia, TextField } from "@mui/material";
import { ThumbUp, ThumbDown, Comment, Edit } from "@mui/icons-material";

// Post and Author interfaces (matching the structure from the first code)
interface Author {
  id: number;
  userName: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  tags: string;
  upvotes: number;
  downvotes: number;
  author: Author;
  category: { id: number; name: string };
  img: string;
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          alt={post.title}
          image={post.img || 'https://picsum.photos/800/450?random=1'}
          sx={{
            height: 200,
            objectFit: 'cover',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="caption" color="primary" component="div">
            {post.category.name}
          </Typography>
          <Typography gutterBottom variant="h6" component="div">
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {post.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton sx={{ color: 'green' }}>
                  <ThumbUp />
                </IconButton>
                <Typography sx={{ color: 'black', fontWeight: 600 }}>{post.upvotes}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton sx={{ color: 'red' }}>
                  <ThumbDown />
                </IconButton>
                <Typography sx={{ color: 'red', fontWeight: 600 }}>{post.downvotes}</Typography>
              </Box>
            </Box>
            <Button startIcon={<Comment />} variant="outlined" color="primary">
              Comment
            </Button>
          </Box>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
          <img
            src={post.author.avatar || 'https://picsum.photos/800/450?random=1'}
            alt="Author Avatar"
            style={{ width: 30, height: 30, borderRadius: '50%' }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ marginLeft: 1 }}>
            {post.author.userName}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
};

const UserProfile = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("Unedited Bio"); // Default bio set to "Unedited Bio"
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]); // State to hold posts
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the username from the API
    fetch("http://localhost:5128/Users/username", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token if required for authentication
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUsername(data.username);
      })
      .catch((err) => {
        setError("Failed to fetch username.");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (username) {
      // Fetch posts from the API for the signed-in user
      fetch("http://localhost:5128/Users/posts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authentication
        },
      })
        .then((response) => {
          if (response.status === 404) {
            setPosts([]); // No posts found, set posts to an empty array
          } else if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch posts.");
          }
        })
        .then((data) => {
          if (data) {
            setPosts(data); // Set fetched posts in the state
          }
        })
        .catch((err) => {
          setError("Failed to fetch posts.");
          console.error(err);
        });
    }
  }, [username]);

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value);
  };

  const toggleEditMode = () => {
    setIsEditingBio((prev) => !prev);
  };

  const handleBioSave = () => {
    setIsEditingBio(false);
    // You can add a PUT request to save the bio to the server if needed.
    console.log("Bio saved:", bio); // For now, just log the bio
  };

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!username) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Section with Editable Bio */}
      <Card sx={{ textAlign: "center", padding: "24px", marginBottom: "32px", boxShadow: 3 }}>
        <Avatar
          alt={username}
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
          sx={{ width: 120, height: 120, margin: "0 auto 16px", border: "4px solid #fff" }}
        />
        <Typography variant="h4" gutterBottom>
          {username}
        </Typography>
        
        {/* Editable Bio Section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          {isEditingBio ? (
            <TextField
              value={bio}
              onChange={handleBioChange}
              variant="outlined"
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {bio}
            </Typography>
          )}
          <IconButton onClick={toggleEditMode} color="primary">
            <Edit />
          </IconButton>
        </Box>

        {isEditingBio && (
          <Button variant="contained" color="primary" onClick={handleBioSave} sx={{ mt: 2 }}>
            Save Bio
          </Button>
        )}
      </Card>

      {/* Posts Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recent Posts
      </Typography>

      {/* Check if posts are available */}
      {posts.length === 0 ? (
        <Typography variant="h6" color="primary">
          You don't have any posts :(
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UserProfile;
