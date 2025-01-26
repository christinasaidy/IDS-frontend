"use client";

import { useState } from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostImageCarousel from "./PostImageCarousel";
import PostActions from "./PostActions";
import CommentSection from "./CommentSection";

// Define the interfaces
interface Author {
  id: number;
  userName: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  tags: string;
  upvotes: number;
  downvotes: number;
  createdAt: string; // Changed to string to match the API response
  author: Author;
  category: { id: number; name: string };
  imagePaths: string[]; // Added imagePaths to match your API response
}

interface SocialMediaPostProps {
  initialPost: Post;
  userName: string; // Add userName prop to identify the current user
  token: string | null; // Add token prop for API authentication
  userId: number | null; // Add userId prop for the logged-in user
}

const SocialMediaPost = ({ initialPost, userName, token, userId }: SocialMediaPostProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Post Header */}
        <PostHeader
          author={initialPost.author}
          createdAt={initialPost.createdAt}
          onEdit={() => {
            // Handle edit logic here
          }}
          onDelete={() => {
            // Handle delete logic here
          }}
          postId={initialPost.id} // Pass the postId to the PostHeader component
        />

        {/* Post Content */}
        <PostContent
          title={initialPost.title}
          category={initialPost.category.name}
          description={initialPost.description}
          tags={initialPost.tags.split(",")} // Convert tags string to array
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />

        {/* Post Image Carousel */}
        <PostImageCarousel
          images={initialPost.imagePaths.map(
            (path) => `http://localhost:5128${path}`
          )} // Append base URL to image paths
          currentImageIndex={currentImageIndex}
          onNext={() =>
            setCurrentImageIndex((prev) =>
              prev === initialPost.imagePaths.length - 1 ? 0 : prev + 1
            )
          }
          onPrev={() =>
            setCurrentImageIndex((prev) =>
              prev === 0 ? initialPost.imagePaths.length - 1 : prev - 1
            )
          }
          onOpenLightbox={() => setShowLightbox(true)}
        />

        {/* Post Actions and Comments */}
        <div className="p-4 border-t">
          <PostActions
            post={{ id: initialPost.id, upvotes: initialPost.upvotes, downvotes: initialPost.downvotes }}
            commentsCount={0} // This can be updated if you fetch the count from the API
            userName={userName} // Pass the current user's username
          />
          <CommentSection
            postId={initialPost.id} // Pass the postId to fetch comments
            token={token} // Pass the token for API authentication
            userId={userId} // Pass the userId for the logged-in user
          />
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowLightbox(false)}
        >
          <img
            src={`http://localhost:5128${initialPost.imagePaths[currentImageIndex]}`}
            alt="Enlarged post image"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default SocialMediaPost;