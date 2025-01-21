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
  userId: number | null; // Add userId prop for the logged-in user
  postPosition: { top: number; left: number; width: number; height: number };
}

const CommentsModal: React.FC<CommentsModalProps> = ({ open, onClose, postId, token, userId, postPosition }) => {
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

  const handleAddComment = async () => {
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

        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
          {comments.length === 0 ? (
            <Typography
              variant="body1"
              align="center"
              sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              No comments on this post.
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={`http://localhost:5128${comment.user.profilePictureUrl}`}
                  alt={comment.user.userName}
                  sx={{ width: 30, height: 30 }}
                >
                  {!comment.user.profilePictureUrl && comment.user.userName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {comment.user.userName}
                  </Typography>
                  <Typography variant="body2">{comment.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {userId === comment.userId && (
                  <IconButton
                    aria-label="options"
                    onClick={(e) => handleMenuOpen(e, comment.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>
            ))
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
        onClick={() => {
    if (selectedCommentId) handleDeleteComment(selectedCommentId);
    handleMenuClose();
  }}  sx={{ color: 'red' }} >
            Delete Comment
        </MenuItem>
        </Menu>

        <Box sx={{ mt: 'auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                alignItems: 'flex-start',
              },
            }}
          />
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 1 }} onClick={handleAddComment}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CommentsModal;