"use client";
import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Link,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import UsernameService from "./components/UsernameService";
import EmailService from "./components/EmailService";
import PasswordService from "./components/PasswordService";
import DeleteProfileService from "./components/DeleteProfileService";
const AccountSettings = () => {
  const token = localStorage.getItem("token");

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

      {/* Use the UsernameService component */}
      <UsernameService token={token} />

      {/* Use the EmailService component */}
      <EmailService token={token} />

      {/* Use the PasswordService component */}
      <PasswordService token={token} />

      {/* Use the DeleteProfileService component */}
      <DeleteProfileService token={token} />
    </Container>
  );
};

export default AccountSettings;