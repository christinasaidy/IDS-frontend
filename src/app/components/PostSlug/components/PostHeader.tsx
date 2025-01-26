"use client";

import { useEffect, useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link";
import { Box, IconButton, Menu, MenuItem, Typography, CircularProgress } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import PostEditModal from "../EditPost"; 

interface PostHeaderProps {
  author: {
    id: number;
    userName: string;
  };
  createdAt: string;
  onEdit: () => void; // Callback for edit action
  onDelete: () => void; // Callback for delete action
  postId: number; // Add postId to the interface
}

const PostHeader = ({ author, createdAt, onEdit, onDelete, postId }: PostHeaderProps) => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [signedInUserId, setSignedInUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for modal visibility

  // Fetch the signed-in user's ID from the token
  useEffect(() => {
    const token = localStorage.getItem("token");

    const getUserIdFromToken = (): number | null => {
      if (token) {
        try {
          const decodedToken: { UserId: string } = jwtDecode(token);
          console.log("Decoded Token:", decodedToken); // Debugging line
          return parseInt(decodedToken.UserId, 10); // Convert UserId to a number
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      return null;
    };

    const userId = getUserIdFromToken();
    setSignedInUserId(userId);
  }, []);

  // Fetch the user's profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authentication token not found");
          return;
        }

        const response = await fetch(
          `http://localhost:5128/Users/profile-picture/${author.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const profilePictureUrl =
            data.profilePictureUrl ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";
          const fullProfilePictureUrl = profilePictureUrl.startsWith("http")
            ? profilePictureUrl
            : `http://localhost:5128/${profilePictureUrl}`;
          setProfilePicture(fullProfilePictureUrl);
        } else if (response.status === 401) {
          console.error("Unauthorized: Please log in");
        } else {
          console.error("Failed to fetch profile picture:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [author.id]);

  // Handle dropdown menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle dropdown menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle edit action
  const handleEdit = () => {
    handleMenuClose();
    setIsEditModalOpen(true); // Open the modal
  };

  // Handle delete action
  const handleDelete = async () => {
    handleMenuClose();
    setIsDeleting(true); // Show loading spinner

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token not found");
        setIsDeleting(false); // Hide loading spinner
        return;
      }

      const response = await fetch(`http://localhost:5128/Posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response: ", response)
      if (response.ok) {
        console.log("Post deleted successfully");
        onDelete(); // Invoke callback to refresh UI or handle post-deletion actions

        // Delay redirection for 2 seconds
        setTimeout(() => {
          window.location.href = "/pages/feed"; // Redirect to /pages/feed
        }, 2000);
      } else {
        console.error("Failed to delete post:", response.statusText);
        setIsDeleting(false); // Hide loading spinner
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setIsDeleting(false); // Hide loading spinner
    }
  };

  return (
    <div>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/pages/feed">
          <IconButton color="primary" sx={{ color: "black" }}>
            <ArrowBack />
          </IconButton>
        </Link>
      </Box>

      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <img
            src={
              profilePicture ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
            }
            alt={author.userName}
            className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";
            }}
          />
          <div>
            <h2 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
              {author.userName}
            </h2>
            <p className="text-sm text-gray-500">
              {format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {/* Three dots button and dropdown menu */}
        {signedInUserId === author.id && (
          <div>
            <IconButton
              onClick={handleMenuOpen}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaEllipsisH />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>Edit Post</MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: "red" }}>
                Delete Post
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      <PostEditModal
        postId={postId} // Pass the postId to the modal
        open={isEditModalOpen} // Control modal visibility
        onClose={() => setIsEditModalOpen(false)} // Close the modal
      />

      {/* Loading Spinner */}
      {isDeleting && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </div>
  );
};

export default PostHeader;