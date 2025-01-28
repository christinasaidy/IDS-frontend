import React, { useState } from "react";
import { Box, Container, Grid, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import { styled } from "@mui/system";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { LogoIcon } from '../../CustomIcons';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  padding: "60px 0 20px",
  borderTop: "1px solid #EAEAEA",
  boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.05)"
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  marginRight: "10px",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.1)"
  }
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  cursor: "pointer",
  marginBottom: "8px",
  "&:hover": {
    color: "#1976d2"
  }
}));

const NewsletterBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#F8F9FA",
  padding: "20px",
  borderRadius: "8px"
}));

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({ show: false, severity: "success", message: "" });

  const handleSubscribe = () => {
    if (!email) {
      setSubscribeStatus({
        show: true,
        severity: "error",
        message: "Please enter a valid email address"
      });
      return;
    }
    setSubscribeStatus({
      show: true,
      severity: "success",
      message: "Thank you for subscribing!"
    });
    setEmail("");
  };

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
          <Box mb={3} sx={{paddingRight:'400px'}}>
          <LogoIcon style={{marginBottom: '30px'}}/> </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Connecting people through meaningful social interactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Nerds. All rights reserved.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Quick Links
            </Typography>
            <FooterLink variant="body2" color="text.secondary">About Us</FooterLink>
            <FooterLink variant="body2" color="text.secondary">Terms of Service</FooterLink>
            <FooterLink variant="body2" color="text.secondary">Privacy Policy</FooterLink>
            <FooterLink variant="body2" color="text.secondary">Community Guidelines</FooterLink>
            <FooterLink variant="body2" color="text.secondary">Help Center</FooterLink>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Connect With Us
            </Typography>
            <Box>
              <SocialIcon aria-label="Facebook" color="primary">
                <FaFacebookF />
              </SocialIcon>
              <SocialIcon aria-label="Twitter" color="primary">
                <FaTwitter />
              </SocialIcon>
              <SocialIcon aria-label="Instagram" color="primary">
                <FaInstagram />
              </SocialIcon>
              <SocialIcon aria-label="LinkedIn" color="primary">
                <FaLinkedinIn />
              </SocialIcon>
              <SocialIcon aria-label="YouTube" color="primary">
                <FaYoutube />
              </SocialIcon>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <NewsletterBox>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Stay Updated
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Subscribe to our newsletter for the latest updates and exclusive content.
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubscribe}
              >
                Subscribe
              </Button>
              {subscribeStatus.show && (
                <Alert
                  severity={subscribeStatus.severity}
                  sx={{ mt: 2 }}
                  onClose={() => setSubscribeStatus({ ...subscribeStatus, show: false })}
                >
                  {subscribeStatus.message}
                </Alert>
              )}
            </NewsletterBox>
          </Grid>
        </Grid>
      </Container>
    </StyledFooter>
  );
};

export default Footer;