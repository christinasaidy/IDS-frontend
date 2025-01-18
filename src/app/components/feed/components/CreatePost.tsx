import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import { SxProps, Theme } from '@mui/system';

interface CreatePostProps {
  sx?: SxProps<Theme>;
}

const CreatePost: React.FC<CreatePostProps> = ({ sx }) => {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [categoryName, setCategoryName] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handlePost = async () => {
    const postData = {
      title,
      description,
      tags,
      categoryName,
    };
  
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://localhost:5128/Posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
  
      if (response.ok) {
        console.log('Post created successfully');
        handleClose();
        window.location.reload();
      } else {
        console.error('Error creating post:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
          zIndex: 1000,
          ...sx,
        }}
        onClick={handleClickOpen}
      >
        Create a Post
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create a New Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Tags"
            type="text"
            fullWidth
            variant="outlined"
            helperText="Separate tags with commas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePost} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreatePost;
