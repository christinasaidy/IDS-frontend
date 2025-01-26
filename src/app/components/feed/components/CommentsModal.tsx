import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, TextField, Button, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

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

interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  postId: number;
  token: string | null;
  userId: number | null;
  postPosition: { top: number; left: number; width: number; height: number };
  AuthorId: number;
  UserName: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ open, onClose, postId, token, userId, postPosition, AuthorId, UserName }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      const fetchComments = async () => {
        try {
          const response = await fetch(`http://localhost:5128/Comments/Post/${postId}`);
          const data = await response.json();
          setComments(data);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };

      fetchComments();
    }
  }, [open, postId]);

  const handleAddCommentAndNotification = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch('http://localhost:5128/Comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          content: newComment,
        }),
      });

      const data = await response.json();
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }

        // Post the Comment notification
        const notificationResponse = await fetch('http://localhost:5128/Notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationType: 'Comment',
            message: `${UserName} Commented on your post`,
            isRead: false,
            postId: postId,
            receiverId: AuthorId,
          }),
        });
        console.log("notificationResponse: ", notificationResponse);
        if (notificationResponse.ok) {
          const notificationData = await notificationResponse.json();
          console.log('comment notification posted successfully:', notificationData);
        } else {
          throw new Error('Failed to post comment notification');
        }
  
  
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await fetch(`http://localhost:5128/Comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(comments.filter((comment) => comment.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'fixed',
          top: postPosition.top - 50,
          left: postPosition.left,
          width: postPosition.width,
          height: postPosition.height,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'black',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Comments Title */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Comments
        </Typography>

        {/* Comments List */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            mb: 2,
          }}
        >
          {comments.length === 0 ? (
            <Typography
              variant="body1"
              align="center"
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              No comments on this post.
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {/* User Avatar */}
                <Avatar
                  src={`http://localhost:5128${comment.user.profilePictureUrl}`}
                  alt={comment.user.userName}
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: 'primary.main',
                  }}
                >
                  {!comment.user.profilePictureUrl && comment.user.userName.charAt(0).toUpperCase()}
                </Avatar>

                {/* Comment Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {comment.user.userName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    {comment.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {/* Options Menu (for the logged-in user's comments) */}
                {userId === comment.userId && (
                  <IconButton
                    aria-label="options"
                    onClick={(e) => handleMenuOpen(e, comment.id)}
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': {
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
              color: 'error.main',
              fontSize: '0.875rem',
            }}
          >
            Delete Comment
          </MenuItem>
        </Menu>

        {/* Add Comment Section */}
        <Box sx={{ mt: 'auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                alignItems: 'center', // Center the input text vertically
                height: '40px', // Set a fixed height for the input bar
                color: 'text.primary',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              background: 'linear-gradient(45deg, #000000, #333333)', // Gradient black
              color: 'common.white',
              textTransform: 'none', // Prevent uppercase transformation
              fontSize: '1rem', // Set font size
              fontWeight: 500, // Set font weight
              '&:hover': {
                background: 'linear-gradient(45deg, #333333, #000000)', // Darker gradient on hover
              },
            }}
            onClick={handleAddCommentAndNotification}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CommentsModal;