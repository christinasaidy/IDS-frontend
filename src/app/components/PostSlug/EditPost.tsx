import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaSave, FaTimes } from "react-icons/fa";
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const PostEditModal = ({ postId, open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    tags: [],
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmClose, setConfirmClose] = useState(false); // State to manage confirmation dialog

  useEffect(() => {
    if (open && postId) {
      // Fetch post data
      const fetchPost = async () => {
        try {
          const response = await fetch(`http://localhost:5128/Posts/${postId}`);
          const data = await response.json();
          setFormData({
            title: data.title,
            category: data.category.name,
            description: data.description,
            tags: data.tags.split(","),
          });
        } catch (error) {
          setSnackbar({ open: true, message: "Error fetching post data.", severity: "error" });
        }
      };

      // Fetch categories
      const fetchCategories = async () => {
        try {
          const response = await fetch("http://localhost:5128/Categories");
          const data = await response.json();
          setCategories(data);
        } catch (error) {
          setSnackbar({ open: true, message: "Error fetching categories.", severity: "error" });
        }
      };

      fetchPost();
      fetchCategories();
    }
  }, [open, postId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("token"); // Retrieve the JWT token from localStorage
        const response = await fetch(`http://localhost:5128/Posts/${postId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            tags: formData.tags.join(","),
            categoryName: formData.category,
          }),
        });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: "Post updated successfully!",
            severity: "success",
          });
          onClose(); // Close the modal after successful submission
          window.location.reload(); // Reload the screen
        } else {
          throw new Error("Error updating post");
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error updating post. Please try again.",
          severity: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.description || formData.category || formData.tags.length > 0) {
      // Show confirmation dialog if there are unsaved changes
      setConfirmClose(true);
    } else {
      onClose(); // Close the modal if no changes
    }
  };

  const handleConfirmClose = (confirmed) => {
    setConfirmClose(false);
    if (confirmed) {
      onClose(); // Close the modal if user confirms
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData({ ...formData, tags });
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography sx={{ fontSize: "30px" }}>Edit Post</Typography>
        </DialogTitle>
        <DialogContent>
          <StyledForm onSubmit={handleSubmit}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Enter Post Title"
              sx={{ mt: 2 }}
            />

            <FormControl fullWidth error={!!errors.category} sx={{ mt: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography color="error" variant="caption">
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <div style={{ marginBottom: '1rem' }}>
              <h3>Description</h3>
              {/* Markdown Editor */}
              <MDEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value || '' })}
                height={200}
              />
              {/* Markdown Preview */}
              <div style={{ marginTop: '1rem' }}>
                <ReactMarkdown>{formData.description}</ReactMarkdown>
              </div>
            </div>

            <TextField
              label="Tags"
              fullWidth
              value={formData.tags.join(", ")}
              onChange={handleTagsChange}
              error={!!errors.tags}
              helperText={errors.tags || "Enter tags separated by commas"}
              placeholder="e.g., tag1, tag2, tag3"
              sx={{ mt: 2 }}
            />

            {/* Display tags as a list */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {formData.tags.map((tag, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "0.875rem",
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                startIcon={<FaTimes />}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <FaSave />}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </StyledForm>
        </DialogContent>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmClose}
        onClose={() => handleConfirmClose(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Close</DialogTitle>
        <DialogContent>
          <Typography>You have unsaved changes. Are you sure you want to leave?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmClose(false)} color="primary">
            No
          </Button>
          <Button onClick={() => handleConfirmClose(true)} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostEditModal;