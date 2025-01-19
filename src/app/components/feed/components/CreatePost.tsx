import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';

const CreatePost: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setCategory('');
    setImages([]);
    setUploadedImageUrls([]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages(Array.from(event.target.files));
    }
  };

  const handlePost = async () => {
    try {
      // Step 1: Create the post
      const createPostResponse = await fetch('http://localhost:5128/Posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust token storage as needed
        },
        body: JSON.stringify({
          title,
          description,
          tags,
          categoryName: category,
        }),
      });
  
      if (!createPostResponse.ok) {
        const error = await createPostResponse.json();
        throw new Error(error.message || 'Failed to create post.');
      }
  
      const createdPost = await createPostResponse.json();
      const postId = createdPost.id;
  
      // Step 2: Upload images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append('imageFiles', image));
  
        const imageUploadResponse = await fetch(
          `http://localhost:5128/Posts/${postId}/images`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust token storage as needed
            },
            body: formData,
          }
        );
  
        // Handle the response for image upload
        if (imageUploadResponse.ok) {
          const contentType = imageUploadResponse.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const uploadedUrls = await imageUploadResponse.json(); // Parse JSON if available
            setUploadedImageUrls(uploadedUrls);
          } else {
            console.warn('No JSON response for image upload. Response might be empty.');
          }
        } else {
          const error = await imageUploadResponse.json();
          throw new Error(error.message || 'Failed to upload images.');
        }
      }
  
      alert('Post created successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || 'An error occurred while creating the post.');
    }
  };
  

  return (
    <>
      <Button
        variant="contained"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: 'black',
          color: 'white',
          '&:hover': {
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid black',
          },
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
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Upload Images"
            type="file"
            fullWidth
            variant="outlined"
            inputProps={{ multiple: true, accept: 'image/*' }}
            onChange={handleImageChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handlePost}>Post</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreatePost;
