import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LogoIcon } from '../../CustomIcons';
import Link from 'next/link';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

const ConfirmationBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 1,
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false); // State for confirmation dropdown
  const [mobileConfirmOpen, setMobileConfirmOpen] = React.useState(false); // Separate state for mobile confirmation

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // Handle sign-out
  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    window.location.href = '/pages/signin'; // Redirect to the sign-in page
  };

  // Toggle confirmation dropdown for desktop
  const toggleConfirmDropdown = () => {
    setConfirmOpen((prev) => !prev);
  };

  // Toggle confirmation dropdown for mobile
  const toggleMobileConfirmDropdown = () => {
    setMobileConfirmOpen((prev) => !prev);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          mt: 'calc(var(--template-frame-height, 0px) + 28px)',
        }}
      >
        <Container maxWidth="lg">
          <StyledToolbar variant="dense" disableGutters>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexGrow: 1,
                  ml: { xs: '30px', md: 0 },
                }}
              >
                <LogoIcon style={{ width: '200px' }} />
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, position: 'relative' }}>
                <Link href="/pages/userprofile" passHref>
                <Button variant="text" size="small" sx={{ color: 'black' }}>
                    My Profile
                  </Button>
                </Link>
                <Button variant="text" size="small" sx={{ color: 'black' }}>
                  Settings
                </Button>
                <Button variant="text" size="small" sx={{ color: 'black' }}>
                  Notifications
                </Button>
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  sx={{ minWidth: 0, color: 'error.main' }}
                  onClick={toggleConfirmDropdown} // Toggle confirmation dropdown
                >
                  Sign Out
                </Button>
                {confirmOpen && (
                  <ConfirmationBox>
                    <Box sx={{ fontWeight: 'medium', mb: 1, color: 'black' }}>Are you sure?</Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setConfirmOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </Box>
                  </ConfirmationBox>
                )}
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
              <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="top"
                open={open}
                onClose={toggleDrawer(false)}
                PaperProps={{
                  sx: {
                    top: 'var(--template-frame-height, 0px)',
                  },
                }}
              >
                <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={toggleDrawer(false)}>
                      <CloseRoundedIcon />
                    </IconButton>
                  </Box>
                  <Link href="/pages/userprofile" passHref>
                    <MenuItem>My Profile</MenuItem>
                  </Link>
                  <MenuItem>Settings</MenuItem>
                  <MenuItem>Notifications</MenuItem>
                  <MenuItem
                    sx={{ color: 'error.main' }}
                    onClick={toggleMobileConfirmDropdown} // Toggle mobile confirmation dropdown
                  >
                    Sign Out
                  </MenuItem>
                  {mobileConfirmOpen && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                      <Box sx={{ fontWeight: 'medium', mb: 1, color: 'black' }}>Are you sure?</Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setMobileConfirmOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                      </Box>
                    </Box>
                  )}
                  <Divider sx={{ my: 3 }} />
                </Box>
              </Drawer>
            </Box>
          </StyledToolbar>
        </Container>
      </AppBar>
    </>
  );
}