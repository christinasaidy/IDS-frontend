import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { IconButton, Link } from '@mui/material';
import { ArrowBack} from "@mui/icons-material";
export default function NotificationsPage() {
  const notifications = [
    { id: 1, text: 'New comment on your post' },
    { id: 2, text: 'You have a new follower' },
    { id: 3, text: 'Your profile has been updated' },
  ];

  return (
    
    <Box
      sx={{
        padding: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        maxWidth: "100%",
        height: "100%",
        margin: 'auto',
        mt: 8,
        color: "black"
      }}
    >
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/pages/feed">
          <IconButton color="primary" sx={{ color: "black" }}>
            <ArrowBack />
          </IconButton>
        </Link>
      </Box>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <ListItem>
              <ListItemText primary={notification.text} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
