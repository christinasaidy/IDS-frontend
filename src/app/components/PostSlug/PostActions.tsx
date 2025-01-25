"use client";

import { useState, useEffect } from "react";
import { ThumbUp, ThumbDown } from "@mui/icons-material"; // Import MUI icons
import { FaComment, FaShare, FaBookmark } from "react-icons/fa";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode

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

const PostActions = ({ post, userName }: PostActionsProps) => {
  const token = localStorage.getItem("token");
  console.log("Token:", token); // Debugging line

  const [displayUpvotes, setDisplayUpvotes] = useState(post.upvotes);
  const [displayDownvotes, setDisplayDownvotes] = useState(post.downvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false); // Initial state is false
  const [hasDownvoted, setHasDownvoted] = useState(false); // Initial state is false
  const [commentsCount, setCommentsCount] = useState(0); // State for comments count

  // Decode the token to get the username (sub) and userId
  const getUserIdFromToken = (): number | null => {
    if (token) {
      try {
        const decodedToken: { sub: string; UserId: string } = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // Debugging line
        return parseInt(decodedToken.UserId, 10); // Convert UserId to a number
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  };

  const getUsernameFromToken = (): string | null => {
    if (token) {
      try {
        const decodedToken: { sub: string } = jwtDecode(token);
        console.log("Decoded Token (sub):", decodedToken.sub); // Debugging line
        return decodedToken.sub; // Return the username (sub)
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  };

  // Fetch vote status on component mount
  useEffect(() => {
    fetchVoteStatus();
    fetchCommentsCount(); // Fetch comments count when the component mounts
  }, [post.id, userName]); // Re-run if post.id or userName changes

  // Fetch vote status
  const fetchVoteStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5128/Votes/Post/${post.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.warn("Error fetching vote status:", errorMessage);
        return;
      }

      const data = await response.json();
      console.log("Backend response:", data); // Debugging line

      // Get the username from the token
      const tokenUsername = getUsernameFromToken();

      // Find the vote for the signed-in user
      const userVote = data.find((vote: { userName: string }) => vote.userName === tokenUsername);

      // Update states based on the user's vote
      if (userVote) {
        setHasUpvoted(userVote.voteType === "Upvote");
        setHasDownvoted(userVote.voteType === "Downvote");
      } else {
        // If the user hasn't voted, reset the states
        setHasUpvoted(false);
        setHasDownvoted(false);
      }

      console.log("User vote status:", {
        hasUpvoted: userVote?.voteType === "Upvote",
        hasDownvoted: userVote?.voteType === "Downvote",
      }); // Debugging line
    } catch (error) {
      console.error("Error fetching vote status:", error);
    }
  };

  // Fetch comments count
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

  // Handle upvote
  const handleUpvote = async () => {
    try {
      const response = await fetch("http://localhost:5128/Votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          voteType: "Upvote", // Only send "Upvote" or "Downvote"
        }),
      });

      if (response.ok) {
        // Toggle the upvote state
        setHasUpvoted((prev) => !prev);
        // Update the upvote count
        setDisplayUpvotes((prev) => (hasUpvoted ? prev - 1 : prev + 1));
        // If the user was previously downvoting, remove the downvote
        if (hasDownvoted) {
          setHasDownvoted(false);
          setDisplayDownvotes((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
    }
  };

  // Handle downvote
  const handleDownvote = async () => {
    try {
      const response = await fetch("http://localhost:5128/Votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          voteType: "Downvote", // Only send "Upvote" or "Downvote"
        }),
      });

      if (response.ok) {
        // Toggle the downvote state
        setHasDownvoted((prev) => !prev);
        // Update the downvote count
        setDisplayDownvotes((prev) => (hasDownvoted ? prev - 1 : prev + 1));
        // If the user was previously upvoting, remove the upvote
        if (hasUpvoted) {
          setHasUpvoted(false);
          setDisplayUpvotes((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error("Error toggling downvote:", error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-4">
        {/* Upvote Button */}
        <button
          onClick={handleUpvote}
          className={`flex items-center space-x-1 ${
            hasUpvoted ? "text-green-500" : "text-gray-500"
          }`}
        >
          <ThumbUp />
          <span>{displayUpvotes}</span>
        </button>

        {/* Downvote Button */}
        <button
          onClick={handleDownvote}
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