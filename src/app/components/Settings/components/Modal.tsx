"use client";

import React from "react";
import {
  Modal,
  Paper,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  width: "90%",
  borderRadius: theme.shape.borderRadius,
  textAlign: "center",
}));

const CustomModal = ({
  open,
  onClose,
  title,
  message,
  isError = false,
  confirmAction,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  showCloseButton = true
}) => {
  return (
    <StyledModal open={open} onClose={onClose}>
      <ModalContent>
        <Typography
          variant="h6"
          component="h2"
          color={isError ? "error" : "primary"}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography paragraph>{message}</Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          {confirmAction && (
            <Button variant="contained" onClick={confirmAction} color="primary">
              {confirmButtonText}
            </Button>
          )}
          {showCloseButton && (
            <Button
              onClick={onClose}
              variant="contained"
              color={isError ? "error" : "default"}
            >
              {cancelButtonText}
            </Button>
          )}
        </Box>
      </ModalContent>
    </StyledModal>
  );
};

export default CustomModal;
