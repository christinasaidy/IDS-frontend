"use client";
import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { styled } from "@mui/system";
import CustomModal from "./Modal";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const PasswordService = ({ token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState("");

  // Separate states for each modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
      case "newPassword":
      case "confirmPassword":
        if (!validatePassword(value)) {
          newErrors[name] =
            "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character";
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

  const handleChangePassword = async () => {
    if (errors.newPassword || errors.confirmPassword) {
      setModalMessage("Please fix validation errors before submitting.");
      setShowErrorModal(true); // Show error modal
      return;
    }

    try {
      const response = await fetch("http://localhost:5128/Users/update-password", {
        method: "PATCH",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (response.ok) {
        setModalMessage("Password updated successfully!");
        setShowSuccessModal(true); // Show success modal
      } else {
        const errorMessage = await response.text();
        setModalMessage(`Failed to update password: ${errorMessage}`);
        setShowErrorModal(true); // Show error modal
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setModalMessage("An error occurred. Please try again later.");
      setShowErrorModal(true); // Show error modal
    }
  };

  return (
    <>
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
          onClick={() => setShowConfirmModal(true)}
          disabled={!!errors.newPassword || !!errors.confirmPassword || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
        >
          Change Password
        </Button>
      </StyledPaper>

      {/* Confirmation Modal */}
      <CustomModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Password Change"
        message="Are you sure you want to change your password?"
        confirmAction={() => {
          setShowConfirmModal(false);
          handleChangePassword();
        }}
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
      />

      {/* Success Modal */}
      <CustomModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={modalMessage}
        isError={false}
        confirmAction={() => window.location.reload()}
        showCloseButton={false}
      />

      {/* Error Modal */}
      <CustomModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={modalMessage}
        isError={true}
        confirmAction={() => setShowErrorModal(false)}
        cancelButtonText="Close"
      />
    </>
  );
};

export default PasswordService;