"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Avatar,
  Card,
  Grid,
  Typography,
  Container,
  Box,
  IconButton,
  Button,
  TextField,
  Link,
  Menu,
  MenuItem,
} from "@mui/material";
import { Edit, ArrowBack, MoreVert } from "@mui/icons-material";
import PostCard from "./feed/components/PostCard";
import ReputationPoints from "./reputationPoints"; 
import { jwtDecode } from 'jwt-decode';

// Define interfaces for Post and Author
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

const UserProfile = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("Unedited Bio");
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditingProfilePic, setIsEditingProfilePic] = useState(false);
  const [signedInUserId, setSignedInUserId] = useState<number | null>(null); // State for signed-in user ID

  const token = localStorage.getItem('token');

  // Fetch the signed-in user's ID from the token
  useEffect(() => {
    const getUserIdFromToken = (): number | null => {
      if (token) {
        try {
          const decodedToken: { UserId: string } = jwtDecode(token);
          console.log('Decoded Token:', decodedToken); // Debugging line
          return parseInt(decodedToken.UserId, 10); // Convert UserId to a number
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      return null;
    };

    const userId = getUserIdFromToken();
    setSignedInUserId(userId);
    console.log('Signed-in User ID:', userId); // Debugging line
  }, [token]);

  // Fetch user data on component mount
  useEffect(() => {
    // Fetch username
    fetch("http://localhost:5128/Users/username", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data: { username: string }) => setUsername(data.username))
      .catch((err) => {
        setError("Failed to fetch username.");
        console.error(err);
      });

    // Fetch profile picture
    fetch("http://localhost:5128/Users/profile-picture", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data: { profilePictureUrl: string }) => {
        const backendBaseUrl = "http://localhost:5128";
        const fullProfilePictureUrl = `${backendBaseUrl}${data.profilePictureUrl}`;
        setProfilePicture(fullProfilePictureUrl);
      })
      .catch((err) => {
        setError("Failed to fetch profile picture.");
        console.error(err);
      });

    // Fetch posts
    fetch("http://localhost:5128/Users/posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          // If no posts are found (404), return an empty array
          if (response.status === 404) {
            return [];
          }
          throw new Error("Failed to fetch posts.");
        }
        return response.json();
      })
      .then((data: Post[]) => setPosts(data))
      .catch((err) => {
        setError("Failed to fetch posts.");
        console.error(err);
      });

    // Fetch bio
    fetch("http://localhost:5128/Users/bio", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data: { bio: string }) => setBio(data.bio || "Unedited Bio"))
      .catch((err) => {
        setError("Failed to fetch bio.");
        console.error(err);
      });
  }, []);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Display a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePicture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving the profile picture
  const handleSaveProfilePicture = async () => {
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5128/Users/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture.");
      }

      const data: { profilePictureUrl: string } = await response.json();
      const backendBaseUrl = "http://localhost:5128";
      const fullProfilePictureUrl = `${backendBaseUrl}${data.profilePictureUrl}?${new Date().getTime()}`;
      setProfilePicture(fullProfilePictureUrl);
      setSelectedFile(null); // Clear the selected file after saving
      setIsEditingProfilePic(false); // Exit edit mode after saving
    } catch (err) {
      setError("Failed to upload profile picture.");
      console.error(err);
    }
  };

  // Handle bio editing
  const handleBioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value);
  };

  const toggleEditMode = () => {
    setIsEditingBio((prev) => !prev);
  };

  const handleBioSave = () => {
    fetch("http://localhost:5128/Users/addbio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(bio),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update bio.");
        }
        return response.text();
      })
      .then((message: string) => {
        console.log(message);
        setIsEditingBio(false); // Exit edit mode after saving
      })
      .catch((err) => {
        setError("Failed to save bio.");
        console.error(err);
      });
  };

  // Handle opening the menu for profile picture options
  const handleProfilePicMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the menu
  const handleProfilePicMenuClose = () => {
    setAnchorEl(null);
  };

  // Toggle profile picture editing mode
  const toggleProfilePicEditMode = () => {
    setIsEditingProfilePic((prev) => !prev);
    handleProfilePicMenuClose(); // Close the menu after toggling
  };

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!username) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        backgroundColor: "background.default",
        minHeight: "100vh", // Ensure the container takes up the full viewport height
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/pages/feed">
          <IconButton color="primary" sx={{ color: "black" }}>
            <ArrowBack />
          </IconButton>
        </Link>
      </Box>

      {/* Profile Section */}
      <Card
        sx={{
          textAlign: "center",
          padding: "24px",
          marginBottom: "32px",
          boxShadow: 3,
        }}
      >
        {/* Profile Picture */}
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            alt={username}
            src={profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330"}
            sx={{ width: 120, height: 120, margin: "0 auto 16px", border: "4px solid #fff" }}
          />
          <IconButton
            sx={{ position: "absolute", top: 0, right: -30 }}
            onClick={handleProfilePicMenuOpen}
          >
            <MoreVert />
          </IconButton>
        </Box>
        <Typography variant="h4" gutterBottom>
          {username}
        </Typography>

        {/* Profile Picture Edit Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfilePicMenuClose}
        >
          <MenuItem onClick={toggleProfilePicEditMode}>
            {isEditingProfilePic ? "Cancel Editing" : "Edit Profile Picture"}
          </MenuItem>
        </Menu>

        {/* Editable Bio Section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 3 }}>
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
          <IconButton onClick={toggleEditMode} color="primary" sx={{ bottom: 12, color: "black" }}>
            <Edit />
          </IconButton>
        </Box>

        {isEditingBio && (
          <Button variant="contained" color="primary" onClick={handleBioSave} sx={{ mt: 2, backgroundColor: "black" }}>
            Save Bio
          </Button>
        )}

        {/* Profile Picture Upload and Save Buttons */}
        {isEditingProfilePic && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            <Button variant="contained" component="label" sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}>
              Upload
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveProfilePicture}
              disabled={!selectedFile}
              sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <ReputationPoints userId={signedInUserId} />

      {/* Posts Section */}
      <Typography variant="h3" gutterBottom sx={{ mb: 3, color: "black" }}>
        My Posts
      </Typography>
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