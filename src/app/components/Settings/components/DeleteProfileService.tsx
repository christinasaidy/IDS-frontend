"use client";
import React, { useState } from "react";
import {
  Typography,
  Button,
  Modal,
  Paper,
  Alert,
  TextField,
  Box,
} from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: "90%",
}));

const DeleteProfileService = ({ token }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      alert("Please enter your password to confirm.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5128/Users/delete", {
        method: "DELETE",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify({
          password: deleteConfirmPassword,
        }),
      });

      if (response.ok) {
        alert("Account deleted successfully!");
        window.location.href = "/"; // Redirect to home page after deletion
      } else {
        alert(`Failed to delete account, please check your password`);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred. Please make sure you are entering the coorect password.");
    }
  };

  return (
    <>
      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom color="error">
          <FaTrash /> Delete Account
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Warning: This action is permanent and cannot be undone. All your data will be lost.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </Button>
      </StyledPaper>

      <StyledModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalContent>
          <Typography variant="h6" gutterBottom color="error">
            Delete Account
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. Please enter your password to confirm.
          </Alert>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={deleteConfirmPassword}
            onChange={(e) => setDeleteConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              disabled={!deleteConfirmPassword}
              onClick={handleDeleteAccount}
            >
              Delete Permanently
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>
    </>
  );
};

export default DeleteProfileService;