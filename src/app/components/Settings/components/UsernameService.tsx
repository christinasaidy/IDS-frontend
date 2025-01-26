"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Modal,
  Paper,
} from "@mui/material";
import { FaUser } from "react-icons/fa";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const UsernameService = ({ token }) => {
  const [formData, setFormData] = useState({
    currentUsername: "error fetching username",
    newUsername: "",
  });

  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
  }, [token]);

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "newUsername" && !validateUsername(value)) {
      newErrors.newUsername = "Username must be 3-20 characters long and can only contain letters, numbers, and underscores";
    } else {
      delete newErrors.newUsername;
    }

    setErrors(newErrors);
  };

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
    </StyledPaper>
  );
};

export default  UsernameService;
  ;