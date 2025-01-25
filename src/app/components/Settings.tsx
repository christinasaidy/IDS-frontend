"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Modal,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  LinearProgress,
  Link
} from "@mui/material";
import { styled } from "@mui/system";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaTrash, FaMoon, FaSun } from "react-icons/fa";
import { ArrowBack } from "@mui/icons-material";

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

const AccountSettings = () => {
  const token = localStorage.getItem('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [formData, setFormData] = useState({
    currentUsername: "error fetching username", // default username in case user is not signed in
    newUsername: "",
    currentEmail: "error fetching email", // default email in case user is not signed in
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    deleteConfirmPassword: "",
  });

  useEffect(() => {
    const fetchCurrentUsername = async () => {
      try {
        const response = await fetch("http://localhost:5128/Users/username", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch username.");
        }

        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          currentUsername: data.username,
        }));
      } catch (error) {
        console.error("Error fetching current username:", error);
      }
    };

    fetchCurrentUsername();
  }, []);

  const [errors, setErrors] = useState({});

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "newUsername":
        if (!validateUsername(value)) {
          newErrors.newUsername = "Username must be 3-20 characters long and can only contain letters, numbers, and underscores";
        } else {
          delete newErrors.newUsername;
        }
        break;
      case "newEmail":
        if (!validateEmail(value)) {
          newErrors.newEmail = "Please enter a valid email address";
        } else {
          delete newErrors.newEmail;
        }
        break;
      case "newPassword":
      case "confirmPassword":
        if (!validatePassword(value)) {
          newErrors[name] = "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character";
        } else if (name === "confirmPassword" && value !== formData.newPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleChangeUsername = async () => {
    const { newUsername } = formData;

    if (!newUsername) {
      setModalMessage("Please enter a new username.");
      setErrorModalOpen(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:5128/Users/update-username", {
        method: "PATCH",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify(newUsername.trim()),
      });
      console.log("response", response);
      if (response.ok) {
        setModalMessage("Username updated successfully!");
        setSuccessModalOpen(true);
      } else if (response.status === 404) {
        setModalMessage("Username is already taken please try another one.");
        setErrorModalOpen(true);
      } 
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  return (
    <Container sx={{ py: 4 }} className="bg-white">

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/pages/feed">
          <IconButton color="primary" sx={{ color: "black" }}>
            <ArrowBack />
          </IconButton>
        </Link>
      </Box>

      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom className="text-black">
          Account Settings
        </Typography>
      </Box>

      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          <FaUser /> Username
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Username"
              value={formData.currentUsername}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="New Username"
              name="newUsername"
              value={formData.newUsername}
              onChange={handleChange}
              error={!!errors.newUsername}
              helperText={errors.newUsername}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={!!errors.newUsername || !formData.newUsername}
          onClick={handleChangeUsername}
        >
          Change Username
        </Button>
      </StyledPaper>

      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          <FaEnvelope /> Email
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Email"
              value={formData.currentEmail}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="New Email"
              name="newEmail"
              value={formData.newEmail}
              onChange={handleChange}
              error={!!errors.newEmail}
              helperText={errors.newEmail}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => setShowEmailModal(true)}
          disabled={!!errors.newEmail}
        >
          Update Email
        </Button>
      </StyledPaper>

      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom>
          <FaLock /> Password
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />
            <LinearProgress
              variant="determinate"
              value={calculatePasswordStrength(formData.newPassword)}
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={!!errors.newPassword || !!errors.confirmPassword}
        >
          Change Password
        </Button>
      </StyledPaper>

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

      <StyledModal open={showEmailModal} onClose={() => setShowEmailModal(false)}>
        <ModalContent>
          <Typography variant="h6" gutterBottom>
            Confirm Email Change
          </Typography>
          <Typography paragraph>
            Are you sure you want to change your email to {formData.newEmail}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary">
              Confirm
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>

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
            name="deleteConfirmPassword"
            value={formData.deleteConfirmPassword}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              disabled={!formData.deleteConfirmPassword}
            >
              Delete Permanently
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>

      <Modal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography id="success-modal-title" variant="h6" component="h2" color="primary">
            Success!
          </Typography>
          <Typography id="success-modal-description" sx={{ mt: 2 }} color="black">
            {modalMessage}
          </Typography>
          <Button
            onClick={() => {
              setSuccessModalOpen(false);
              window.location.reload();
            }}
            sx={{ mt: 2 }}
            variant="contained"
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Modal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          <Typography id="error-modal-title" variant="h6" component="h2" color="error">
            Error
          </Typography>
          <Typography id="error-modal-description" sx={{ mt: 2 }} color="black">
            {modalMessage}
          </Typography>
          <Button onClick={() => setErrorModalOpen(false)} sx={{ mt: 2 }} variant="contained" color="error">
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default AccountSettings;