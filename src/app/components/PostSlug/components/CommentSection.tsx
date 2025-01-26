"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Avatar, TextField, Button, IconButton, Typography, Menu, MenuItem } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  userName: string;
  profilePictureUrl: string;
}

interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  user: User;
  createdAt: string;
}

interface CommentSectionProps {
  postId: number;
  token: string | null;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [signedInUserId, setSignedInUserId] = useState<number | null>(null); 

  const token = localStorage.getItem("token");

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
  }, [token]);

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Fetch comments from the API
  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5128/Comments/Post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      const response = await fetch("http://localhost:5128/Comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          content: newComment,
        }),
      });
      console.log("postId:", postId);
      console.log("newComment:", newComment);

      if (!response.ok) {
        const errorText = await response.text(); // Log the raw response text
        console.error("Error Response Text:", errorText);
        throw new Error("Failed to add comment");
      }

      const data = await response.json(); // Parse the response as JSON
      setComments([...comments, data]); // Add the new comment to the list
      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5128/Comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments(comments.filter((comment) => comment.id !== id)); // Remove the deleted comment
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Handle opening the options menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  // Handle closing the options menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  return (
    <div className="space-y-4">
      {/* Add the "Comments" heading */}
      <Typography variant="h6" fontWeight={600} sx={{ color: "text.primary", mb: 2 }}>
        Comments
      </Typography>

      {/* Display Comments */}
      {comments.length === 0 ? (
        <Typography variant="body1" align="center" color="textSecondary">
          No comments on this post.
        </Typography>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3">
            {/* User Avatar */}
            <Avatar
              src={`http://localhost:5128${comment.user.profilePictureUrl}`}
              alt={comment.user.userName}
              sx={{ width: 40, height: 40 }}
            >
              {!comment.user.profilePictureUrl && comment.user.userName.charAt(0).toUpperCase()}
            </Avatar>

            {/* Comment Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Typography variant="body1" fontWeight={600} sx={{ color: "black" }}>
                  {comment.user.userName}
                </Typography>
                {/* Options Menu (for the signed-in user's comments) */}
                {signedInUserId === comment.userId && (
                  <IconButton
                    aria-label="options"
                    onClick={(e) => handleMenuOpen(e, comment.id)}
                    size="small"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
              <Typography variant="body2" color="textPrimary">
                {comment.content}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </Typography>
            </div>
          </div>
        ))
      )}

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            boxShadow: 3,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedCommentId) handleDeleteComment(selectedCommentId);
            handleMenuClose();
          }}
          sx={{
            color: "error.main",
            fontSize: "0.875rem",
          }}
        >
          Delete Comment
        </MenuItem>
      </Menu>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mt-4">
        <div className="flex space-x-2">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                alignItems: "center",
                height: "40px",
                color: "text.secondary", // Light grey text
                "& fieldset": {
                  borderColor: "divider",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: "linear-gradient(45deg, #000000, #333333)",
              color: "text.white",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              "&:hover": {
                background: "linear-gradient(45deg, #333333, #000000)",
              },
            }}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;