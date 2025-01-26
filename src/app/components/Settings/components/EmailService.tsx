"use client";
import React, { useState, useEffect } from "react"; // Add useEffect
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Paper,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaEnvelope } from "react-icons/fa";

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

const EmailService = ({ token }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("error fetching email"); // Add currentEmail state
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  // Fetch current email on component mount
  useEffect(() => {
    const fetchCurrentEmail = async () => {
      try {
        const response = await fetch("http://localhost:5128/Users/email", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch email.");
        }

        const data = await response.json();
        setCurrentEmail(data.email); // Update currentEmail state
      } catch (error) {
        console.error("Error fetching current email:", error);
      }
    };
    fetchCurrentEmail();
  }, [token]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setNewEmail(value);
    validateField(value);
  };

  const validateField = (value) => {
    const newErrors = { ...errors };

    if (!validateEmail(value)) {
      newErrors.newEmail = "Please enter a valid email address";
    } else {
      delete newErrors.newEmail;
    }

    setErrors(newErrors);
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      setModalMessage("Please enter a new Email.");
      setErrorModalOpen(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:5128/Users/update-email", {
        method: "PATCH",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify(newEmail.trim()),
      });

      if (response.ok) {
        setModalMessage("Email updated successfully!");
        setSuccessModalOpen(true);
        setCurrentEmail(newEmail); // Update currentEmail state
        onEmailChange(newEmail); // Notify parent component
      } else if (response.status === 404) {
        setModalMessage("Email is already taken please try another one.");
        setErrorModalOpen(true);
      }
    } catch (error) {
      console.error("Error updating Email:", error);
    }
  };

  return (
    <>
      <Paper elevation={2} sx={{ padding: 2, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FaEnvelope /> Email
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Email"
              value={currentEmail}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="New Email"
              name="newEmail"
              value={newEmail}
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
      </Paper>

      <StyledModal open={showEmailModal} onClose={() => setShowEmailModal(false)}>
        <ModalContent>
          <Typography variant="h6" gutterBottom>
            Confirm Email Change
          </Typography>
          <Typography paragraph>
            Are you sure you want to change your email to {newEmail}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleChangeEmail}>
              Confirm
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
    </>
  );
};

export default EmailService;