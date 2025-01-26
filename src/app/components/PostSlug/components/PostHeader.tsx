"use client";

import { useEffect, useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { format } from "date-fns";
import Link from "next/link"; // Import Link from next/link
import { Box, IconButton } from "@mui/material"; // Import MUI components
import { ArrowBack } from "@mui/icons-material"; // Import MUI arrow icon

interface PostHeaderProps {
  author: {
    id: number;
    userName: string;
  };
  createdAt: string; // createdAt is a string, not a Date object
}

const PostHeader = ({ author, createdAt }: PostHeaderProps) => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Fetch the user's profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        // Retrieve the authentication token (e.g., from localStorage)
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Authentication token not found");
          return;
        }

        console.log("Fetching profile picture for user ID:", author.id);
        const response = await fetch(
          `http://localhost:5128/Users/profile-picture/${author.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request headers
            },
          }
        );
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Profile picture data:", data);
          const profilePictureUrl =
            data.profilePictureUrl ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";
          // Prepend the base URL if the profile picture URL is not already a full URL
          const fullProfilePictureUrl = profilePictureUrl.startsWith("http")
            ? profilePictureUrl
            : `http://localhost:5128/${profilePictureUrl}`;
          setProfilePicture(fullProfilePictureUrl);
        } else if (response.status === 401) {
          console.error("Unauthorized: Please log in");
          // Handle unauthorized error (e.g., redirect to login page)
        } else {
          console.error("Failed to fetch profile picture:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [author.id]);

  return (
    <div>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/pages/feed">
          <IconButton color="primary" sx={{ color: "black" }}>
            <ArrowBack />
          </IconButton>
        </Link>
      </Box>

      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <img
            src={
              profilePicture
                ? profilePicture // Use the full URL directly (no need to append base URL)
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" // Fallback avatar
            }
            alt={author.userName}
            className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"; // Fallback on error
            }}
          />
          <div>
            <h2 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
              {author.userName}
            </h2>
            <p className="text-sm text-gray-500">
              {format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a")}{" "}
              {/* Convert string to Date */}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <FaEllipsisH />
        </button>
      </div>
    </div>
  );
};

export default PostHeader;