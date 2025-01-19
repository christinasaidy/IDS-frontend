import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, IconButton } from '@mui/material';
import { ThumbUp, ThumbDown, Comment } from '@mui/icons-material';
import Link from 'next/link';
import Carousel from 'mui-carousel'; // Import the Carousel component

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
  author: Author;
  category: { id: number; name: string };
  slug: string;
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [displayUpvotes, setDisplayUpvotes] = useState(post.upvotes);
  const [displayDownvotes, setDisplayDownvotes] = useState(post.downvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [userName, setUserName] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const token = localStorage.getItem('token');
  useEffect(() => {
    // Fetch post images
    fetch(`http://localhost:5128/Posts/${post.id}/images`, {
      method: 'GET',
    })
      .then(async (response) => {
        if (!response.ok) {
          // If the response is not OK (e.g., 404), handle it gracefully
          const errorMessage = await response.text(); // Read the text response
          console.warn(`Error fetching images: ${errorMessage}`);
          return [];
        }
        return response.json(); // Parse JSON if the response is OK
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Map the relative image paths to absolute URLs
          const fullImagePaths = data.map((image) => `http://localhost:5128${image.imagePath}`);
          setImages(fullImagePaths);
        }
      })
      .catch((error) => console.error('Error fetching images:', error));  
    // Fetch username
    fetch('http://localhost:5128/Users/username', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUserName(data.username))
      .catch((error) => console.error('Error fetching username:', error));

    // Fetch vote status
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
  }, [post.id, token, userName]); // Dependencies for the useEffect hook

  

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Link href={`/pages/${post.id}/posts`} passHref>
          <Box
            sx={{
              position: 'relative',
              '&:hover .hover-overlay': { opacity: 1 }, 
            }}
          >
            {images.length > 0 ? (
              <Carousel autoPlay={false}  navbuttonsalwaysvisible="true">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                  />
                ))}
              </Carousel>
            ) : (
              <Box
                component="img"
                src={'https://via.placeholder.com/800x450?text=No+Image+Available'}
                alt="Placeholder"
                sx={{ height: 200, objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
              />
            )}
          </Box>
        </Link>
        <CardContent>
          <Typography gutterBottom variant="caption" color="primary">
            {post.category.name}
          </Typography>
          <Typography gutterBottom variant="h6">
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {post.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  sx={{ color: hasUpvoted ? 'green' : 'gray' }}
                  onClick={() => setDisplayUpvotes((prev) => (hasUpvoted ? prev - 1 : prev + 1))}
                >
                  <ThumbUp />
                </IconButton>
                <Typography sx={{ fontWeight: 600 }}>{displayUpvotes}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  sx={{ color: hasDownvoted ? 'red' : 'gray' }}
                  onClick={() => setDisplayDownvotes((prev) => (hasDownvoted ? prev - 1 : prev + 1))}
                >
                  <ThumbDown />
                </IconButton>
                <Typography sx={{ fontWeight: 600 }}>{displayDownvotes}</Typography>
              </Box>
            </Box>
            <Button startIcon={<Comment />} variant="outlined">
              Comment
            </Button>
          </Box>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
          <img
            src={post.author.avatar}
            alt="Author Avatar"
            style={{ width: 30, height: 30, borderRadius: '50%' }}
          />
          <Typography variant="body2" sx={{ marginLeft: 1 }}>
            {post.author.userName}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
};

export default PostCard;