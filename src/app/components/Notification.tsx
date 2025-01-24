"use client";
import { useRouter } from "next/navigation"; // For app router
import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { IconButton, Link, Avatar, Badge } from "@mui/material";
import { ArrowBack, ThumbUp, ThumbDown, Comment } from "@mui/icons-material";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<
    {
      id: number;
      message: string;
      isRead: boolean; 
      createdAt: string;
      postId: number;
      senderID: number;
      notificationType: string; 
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:5128/Notifications/User`, {
          method: "GET",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data = await response.json();
        const mappedNotifications = data.map((notification: any) => ({
          id: notification.id,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          postId: notification.postId,
          senderID: notification.senderID,
          notificationType: notification.notificationType,
        }));
        setNotifications(mappedNotifications);
        console.log("{notification.isRead}", mappedNotifications);

      } catch (err) {
        console.error(err);
        setError("Failed to load notifications.");
      }
    };

    fetchNotifications();
  }, []);
const handleNotificationClick = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    notificationId: number,
    postId: number
  ) => {
    event.preventDefault(); // Prevent the default navigation behavior

    try {
      // Mark notification as read
      const response = await fetch(
        `http://localhost:5128/Notifications/${notificationId}/mark-as-read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update local state to reflect read status
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Navigate to the post page after marking as read
      router.push(`/pages/${postId}/posts`);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }

  };
  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'upvote':
        return <ThumbUp className="text-green-500" />;
      case 'downvote':
        return <ThumbDown className="text-red-500" />;
      case 'comment':
        return <Comment className="text-blue-500" />;
    }
  };
  return (
    <Box
      className="max-w-2xl mx-auto p-4"
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        mt: 8,
      }}
    >
      {/* Back Button */}
      <Box className="mb-6 flex items-center space-x-2">
        <Link href="/pages/feed">
          <IconButton className="hover:bg-gray-100 transition-colors">
            <ArrowBack className="text-gray-600" />
          </IconButton>
        </Link>
        <Typography variant="h4" className="font-bold text-gray-800">
          Notifications
        </Typography>
      </Box>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : notifications.length === 0 ? (
        <Typography variant="h6" className="text-gray-400 text-center py-8">
          No new notifications
        </Typography>
      ) : (
        <List className="space-y-2">
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <a
                href={`/pages/${notification.postId}/posts`}
                onClick={(event) =>
                  handleNotificationClick(event, notification.id, notification.postId)
                }
                className="block no-underline"
              >
                <ListItem
                  className={`group transition-all duration-200 ${!notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'} hover:shadow-md rounded-lg px-4 py-3`}
                >
                  <Badge
                    color="primary"
                    variant="dot"
                    invisible={notification.isRead}
                    sx={{
                      '& .MuiBadge-dot': {
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                      }
                    }}
                  >
                    <Avatar className={`bg-gray-100 group-hover:bg-blue-100 transition-colors mr-3 
                      ${notification.notificationType.toLowerCase() === 'upvote' ? '!bg-green-50' : ''}
                      ${notification.notificationType.toLowerCase() === 'downvote' ? '!bg-red-50' : ''}`}
                    >
                      {getNotificationIcon(notification.notificationType)}
                    </Avatar>
                  </Badge>

                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        className={`${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'} group-hover:text-blue-600 transition-colors`}
                      >
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        className="text-gray-400"
                      >
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    }
                  />
                </ListItem>
              </a>
              <Divider className="!my-2" light />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default NotificationsPage;