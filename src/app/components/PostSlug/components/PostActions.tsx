"use client";

import { useState, useEffect } from "react";
import { ThumbUp, ThumbDown } from "@mui/icons-material"; 
import { FaComment, FaShare, FaBookmark } from "react-icons/fa";

interface Author {
  id: number;
  userName: string;
  avatar: string;
}
interface PostActionsProps {
  post: {
    id: number;
    title: string;
    description: string;
    tags: string;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
    author: Author;
    category: { id: number; name: string };
  };
  userName: string;
}

const PostActions = ({ post }: PostActionsProps) => {
  const token = localStorage.getItem("token");
  console.log("Token:", token); // Debugging line 
  const [displayUpvotes, setDisplayUpvotes] = useState(post.upvotes);
  const [displayDownvotes, setDisplayDownvotes] = useState(post.downvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false); 
  const [hasDownvoted, setHasDownvoted] = useState(false); 
  const [commentsCount, setCommentsCount] = useState(0); 
  const [notificationId, setNotificationId] = useState<string | null>(null); 
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchCommentsCount = async () => {
      try {
        const response = await fetch(`http://localhost:5128/Comments/Post/${post.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          console.warn("Error fetching comments count:", errorMessage);
          return;
        }
  
        const data = await response.json();
        console.log("Comments data:", data); // Debugging line
  
        // Set the comments count based on the length of the comments array
        setCommentsCount(data.length);
      } catch (error) {
        console.error("Error fetching comments count:", error);
      }
    };
    fetchCommentsCount();
  });

  // Fetch data (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch username
        const userResponse = await fetch('http://localhost:5128/Users/username', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        const userData = await userResponse.json();
        setUserName(userData.username);

        // Fetch vote status
        const voteResponse = await fetch(`http://localhost:5128/Votes/Post/${post.id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!voteResponse.ok) {
          let errorMessage = "An unknown error occurred";
          try {
            const error = await voteResponse.json();
            errorMessage = error.message || JSON.stringify(error);
          } catch {
            errorMessage = await voteResponse.text();
          }
          console.warn('No votes found or another error occurred:', errorMessage);
        } else {
          const voteData = await voteResponse.json();
          const userVotes = voteData.reduce(
            (votes, vote) => {
              if (vote.userName === userName) {
                if (vote.voteType === 'Upvote') votes.upvoted = true;
                if (vote.voteType === 'Downvote') votes.downvoted = true;
              }
              return votes;
            },
            { upvoted: false, downvoted: false }
          );
          setHasUpvoted(userVotes.upvoted);
          setHasDownvoted(userVotes.downvoted);
        }

      }
       catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [post.id, token, userName, post.author.id]);
  
  // Fetch vote status (unchanged)
  const fetchVoteStatus = () => {
    fetch(`http://localhost:5128/Votes/Post/${post.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const userVotes = data.reduce(
          (votes: { upvoted: boolean; downvoted: boolean }, vote: { voteType: string; userName: string }) => {
            if (vote.userName === userName) {
              if (vote.voteType === 'Upvote') votes.upvoted = true;
              if (vote.voteType === 'Downvote') votes.downvoted = true;
            }
            return votes;
          },
          { upvoted: false, downvoted: false }
        );
        setHasUpvoted(userVotes.upvoted);
        setHasDownvoted(userVotes.downvoted);
      })
      .catch((error) => console.error('Error fetching vote status:', error));
  };

  // Handle upvote with notification logic
  const handleUpvoteAndNotification = async () => {
    try {
      if (hasUpvoted) {
        // User is removing their upvote
        setDisplayUpvotes((prev) => prev - 1);
        setHasUpvoted(false);

        // Remove the upvote from the Votes API
        await fetch("http://localhost:5128/Votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: post.id,
            voteType: "Upvote",
          }),
        });

        // Delete the upvote notification
        if (notificationId) {
          const deleteResponse = await fetch(
            `http://localhost:5128/Notifications/${notificationId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (deleteResponse.ok) {
            console.log("Upvote notification deleted successfully");
            setNotificationId(null);
          } else {
            console.error("Error deleting upvote notification");
          }
        }
        // Refresh vote status
        fetchVoteStatus();
      } else {
        // User is adding an upvote
        if (hasDownvoted) {
          setDisplayDownvotes((prev) => prev - 1);
          setHasDownvoted(false);

          // Delete the downvote notification
          if (notificationId) {
            const deleteResponse = await fetch(
              `http://localhost:5128/Notifications/${notificationId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (deleteResponse.ok) {
              console.log("Downvote notification deleted successfully");
              setNotificationId(null);
            } else {
              console.error("Error deleting downvote notification");
            }
          }
        }

        const voteResponse = await fetch("http://localhost:5128/Votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: post.id,
            voteType: "Upvote",
          }),
        });

        if (!voteResponse.ok) {
          throw new Error("Error submitting upvote");
        }

        setDisplayUpvotes((prev) => prev + 1);
        setHasUpvoted(true);

        // Post the upvote notification
        const notificationResponse = await fetch("http://localhost:5128/Notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationType: "Upvote",
            message: `${userName} Upvoted your post`,
            isRead: false,
            postId: post.id,
            receiverID: post.author.id,
          }),
        });

        if (notificationResponse.ok) {
          const notificationData = await notificationResponse.json();
          setNotificationId(notificationData.id);
          console.log("Upvote notification posted successfully:", notificationData);
        } else {
          throw new Error("Failed to post upvote notification");
        }
      }

      // Refresh vote status
      fetchVoteStatus();
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  // Handle downvote with notification logic
  const handleDownvoteAndNotification = async () => {
    try {
      if (hasDownvoted) {
        // User is removing their downvote
        setDisplayDownvotes((prev) => prev - 1);
        setHasDownvoted(false);

        // Remove the downvote from the Votes API
        await fetch("http://localhost:5128/Votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: post.id,
            voteType: "Downvote",
          }),
        });

        // Delete the downvote notification
        if (notificationId) {
          const deleteResponse = await fetch(
            `http://localhost:5128/Notifications/${notificationId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (deleteResponse.ok) {
            console.log("Downvote notification deleted successfully");
            setNotificationId(null);
          } else {
            console.error("Error deleting downvote notification");
          }
        }
      } else {
        // User is adding a downvote
        if (hasUpvoted) {
          setDisplayUpvotes((prev) => prev - 1);
          setHasUpvoted(false);

          // Delete the upvote notification
          if (notificationId) {
            const deleteResponse = await fetch(
              `http://localhost:5128/Notifications/${notificationId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (deleteResponse.ok) {
              console.log("Upvote notification deleted successfully");
              setNotificationId(null);
            } else {
              console.error("Error deleting upvote notification");
            }
          }
        }

        const voteResponse = await fetch("http://localhost:5128/Votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: post.id,
            voteType: "Downvote",
          }),
        });

        if (!voteResponse.ok) {
          throw new Error("Error submitting downvote");
        }

        setDisplayDownvotes((prev) => prev + 1);
        setHasDownvoted(true);

        // Post the downvote notification
        const notificationResponse = await fetch("http://localhost:5128/Notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationType: "Downvote",
            message: `${userName} Downvoted your post`,
            isRead: false,
            postId: post.id,
            receiverID: post.author.id,
          }),
        });

        if (notificationResponse.ok) {
          const notificationData = await notificationResponse.json();
          setNotificationId(notificationData.id);
          console.log("Downvote notification posted successfully:", notificationData);
        } else {
          throw new Error("Failed to post downvote notification");
        }
      }

      // Refresh vote status
      fetchVoteStatus();
    } catch (error) {
      console.error("Error handling downvote:", error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-4">
        {/* Upvote Button */}
        <button
          onClick={handleUpvoteAndNotification}
          className={`flex items-center space-x-1 ${
            hasUpvoted ? "text-green-500" : "text-gray-500"
          }`}
        >
          <ThumbUp />
          <span>{displayUpvotes}</span>
        </button>

        {/* Downvote Button */}
        <button
          onClick={handleDownvoteAndNotification}
          className={`flex items-center space-x-1 ${
            hasDownvoted ? "text-red-500" : "text-gray-500"
          }`}
        >
          <ThumbDown />
          <span>{displayDownvotes}</span>
        </button>

        {/* Comment Button */}
        <button className="flex items-center space-x-1 text-gray-500">
          <FaComment />
          <span>{commentsCount}</span>
        </button>

        {/* Share Button */}
        <button className="flex items-center space-x-1 text-gray-500">
          <FaShare />
        </button>
      </div>

      {/* Bookmark Button */}
      <button className="text-gray-500 hover:text-blue-600">
        <FaBookmark />
      </button>
    </div>
  );
};

export default PostActions;