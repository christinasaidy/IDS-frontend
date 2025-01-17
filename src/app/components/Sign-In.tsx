"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
import { GoogleIcon, FacebookIcon, LogoIcon } from "./CustomIcons";
import AppTheme from "./shared-theme/AppTheme";
import { CircularProgress } from '@mui/material';

const lightTheme = {
  palette: {
    mode: "light",
  },
};

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  overflowY: "auto",
  maxHeight: "calc(100vh - 50px)",
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  overflowY: "auto",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) return;
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const username = data.get("username");
    const password = data.get("password");

    try {
      const response = await fetch("http://localhost:5128/Users/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        localStorage.setItem("token", result.token);
        window.location.href = "/pages/feed";
      } else {
        const error = await response.json();
        alert(error.message || "Sign-in failed");
      }
    } catch (err) {
      console.error("Error during sign-in:", err);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const validateInputs = () => {
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!username.value) {
      setUsernameError(true);
      setUsernameErrorMessage("Please enter your username.");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <AppTheme theme={lightTheme} disableCustomTheme={false}>
      <CssBaseline />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">

        {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  zIndex: 1,
                }}
              >
                <CircularProgress size={70} color="primary" />
              </Box>
        ) : null}

          <LogoIcon style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }} />
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)", marginTop: "-50px" }}>
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl error={usernameError}>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                required
                fullWidth
                id="username"
                placeholder="Your username"
                name="username"
                autoComplete="username"
                variant="outlined"
                helperText={usernameErrorMessage}
              />
            </FormControl>
            <FormControl error={passwordError}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                helperText={passwordErrorMessage}
              />
            </FormControl>
            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              Sign in
           </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => alert("Sign in with Google")} startIcon={<GoogleIcon />}>
              Sign in with Google
            </Button>
            <Button fullWidth variant="outlined" onClick={() => alert("Sign in with Facebook")} startIcon={<FacebookIcon />}>
              Sign in with Facebook
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Don't have an account?{" "}
              <Link href="/pages/signup" variant="body2" sx={{ alignSelf: "center" }} underline="hover">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
