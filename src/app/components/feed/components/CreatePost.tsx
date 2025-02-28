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
import Typography from '@mui/material/Typography';
import MDEditor from '@uiw/react-md-editor'; 
import ReactMarkdown from 'react-markdown'; 
import Box from '@mui/material/Box';

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

  // Error states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [imagesError, setImagesError] = useState('');

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
    clearErrors();
  };

  const clearErrors = () => {
    setTitleError('');
    setDescriptionError('');
    setCategoryError('');
    setImagesError('');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImages(Array.from(event.target.files));
    }
  };

  const validateForm = () => {
    let isValid = true;
    clearErrors();

    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    }

    if (!category) {
      setCategoryError('Category is required');
      isValid = false;
    }

    if (images.length === 0) {
      setImagesError('At least one image is required');
      isValid = false;
    }

    return isValid;
  };

  const handlePost = async () => {
    if (!validateForm()) {
      return;
    }

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
          categoryName: categories.find((cat) => cat.id === category)?.name,
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
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.message || 'An error occurred while creating the post.');
    }
  };

  // Split tags into an array
  const tagsArray = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '');

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
              error={!!titleError}
              helperText={titleError}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Description</h3>
            {/* Markdown Editor */}
            <MDEditor
              value={description}
              onChange={(value) => setDescription(value || '')}
              height={200}
            />
            {/* Markdown Preview */}
            <div style={{ marginTop: '1rem' }}>
              <ReactMarkdown>{description}</ReactMarkdown>
            </div>
            {descriptionError && (
              <Typography color="error">{descriptionError}</Typography>
            )}
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
            {/* Display tags as chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {tagsArray.map((tag, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.875rem',
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Box>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Category</h3>
            <FormControl fullWidth>
              <Select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as number)}
                fullWidth
                error={!!categoryError}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {categoryError && <Typography color="error">{categoryError}</Typography>}
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
              error={!!imagesError}
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