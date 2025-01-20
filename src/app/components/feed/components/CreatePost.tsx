import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

interface Category {
  id: number;
  name: string;
}

const CreatePost: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<number | ''>(''); 
  const [images, setImages] = useState<File[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5128/Categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags,
          categoryName: categories.find((cat) => cat.id === category)?.name, // Send category name instead of id
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
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          }
        );

        if (imageUploadResponse.ok) {
          const uploadedUrls = await imageUploadResponse.text();
          console.log('Uploaded images:', uploadedUrls);
        } else {
          const error = await imageUploadResponse.text();
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
        <DialogContent sx={{ maxHeight: '400px', overflow: 'auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Title</h3>
            <TextField
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Description</h3>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              rows={6} // Increased height for the description input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputProps={{
                style: {
                  minHeight: '150px', // Make sure the description field has a minimum height
                },
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Tags</h3>
            <TextField
              fullWidth
              variant="outlined"
              helperText="Separate tags with commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Category</h3>
            <FormControl fullWidth>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as number)}
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Upload Images</h3>
            <TextField
              fullWidth
              variant="outlined"
              type="file"
              inputProps={{ multiple: true, accept: 'image/*' }}
              onChange={handleImageChange}
            />
          </div>
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
