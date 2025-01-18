import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CardMedia, Button, IconButton } from '@mui/material';
import { ThumbUp, ThumbDown, Comment } from '@mui/icons-material';
import Link from 'next/link';

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
  img: string;
  slug: string;
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [displayUpvotes, setDisplayUpvotes] = useState(post.upvotes);
  const [displayDownvotes, setDisplayDownvotes] = useState(post.downvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [userName, setUserName] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch the username of the logged-in user
    fetch('http://localhost:5128/Users/username', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserName(data.username);
      })
      .catch((error) => console.error('Error fetching username:', error));

    // Fetch upvote/downvote status from the backend
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

        // Set state from backend data
        setHasUpvoted(userVotes.upvoted);
        setHasDownvoted(userVotes.downvoted);
      })
      .catch((error) => console.error('Error fetching vote status:', error));
  }, [post.id, token, userName]);

  const handleUpvote = () => {
    // Check if the user has already upvoted
    if (hasUpvoted) {
      // If already upvoted, remove the upvote
      setDisplayUpvotes(displayUpvotes - 1);
      setHasUpvoted(false);
      // Send a request to remove the upvote
      fetch('http://localhost:5128/Votes', {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          voteType: 'Upvote', // Indicate you're removing the upvote
        }),
      })
        .then(() => {
          fetchVoteStatus(); // Re-fetch vote status after removing the vote
        })
        .catch((error) => console.error('Error removing upvote:', error));
    } else {
      // Check if the user had downvoted, and if so, cancel the downvote
      if (hasDownvoted) {
        setDisplayDownvotes(displayDownvotes - 1);
        setHasDownvoted(false);
      }
      // If not already upvoted, proceed with adding an upvote
      fetch('http://localhost:5128/Votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          voteType: 'Upvote',
        }),
      })
        .then(() => {
          setDisplayUpvotes(displayUpvotes + 1);
          setHasUpvoted(true);
          setHasDownvoted(false); // Ensure downvote is removed if upvote is clicked
          fetchVoteStatus(); // Re-fetch vote status after upvoting
        })
        .catch((error) => console.error('Error submitting upvote:', error));
    }
  };

  const handleDownvote = () => {
    // Check if the user has already downvoted
    if (hasDownvoted) {
      // If already downvoted, remove the downvote
      setDisplayDownvotes(displayDownvotes - 1);
      setHasDownvoted(false);

      // Send a request to remove the downvote
      fetch('http://localhost:5128/Votes', {
        method: 'POST', // Use 'POST' to handle removing the downvote on the backend
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          voteType: 'Downvote', // Indicate you're removing the downvote
        }),
      })
        .then(() => {
          fetchVoteStatus(); // Re-fetch vote status after removing the vote
        })
        .catch((error) => console.error('Error removing downvote:', error));
    } else {
      // Check if the user had upvoted, and if so, cancel the upvote
      if (hasUpvoted) {
        setDisplayUpvotes(displayUpvotes - 1);
        setHasUpvoted(false);
      }

      // If not already downvoted, proceed with adding a downvote
      fetch('http://localhost:5128/Votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: post.id,
          voteType: 'Downvote',
        }),
      })
        .then(() => {
          setDisplayDownvotes(displayDownvotes + 1);
          setHasDownvoted(true);
          setHasUpvoted(false); // Ensure upvote is removed if downvote is clicked
          fetchVoteStatus(); // Re-fetch vote status after downvoting
        })
        .catch((error) => console.error('Error submitting downvote:', error));
    }
  };

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

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Link href={`/pages/${post.id}/posts`} passHref>
          <Box
            sx={{
              position: 'relative',
              '&:hover .hover-overlay': {
                opacity: 1, // Show overlay on hover
              },
            }}
          >
            <CardMedia
              component="img"
              alt={post.title}
              image={post.img || 'https://picsum.photos/800/450?random=1'}
              sx={{ height: 200, objectFit: 'cover', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
            />
            <Box
              className="hover-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
                opacity: 0, // Hidden by default
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.3s ease', // Smooth transition
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Click to read more
              </Typography>
            </Box>
          </Box>
        </Link>
        <CardContent>
          <Typography gutterBottom variant="caption" color="primary" component="div">
            {post.category.name}
          </Typography>
          <Typography gutterBottom variant="h6" component="div">
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
                  onClick={handleUpvote}
                >
                  <ThumbUp />
                </IconButton>
                <Typography sx={{ color: 'black', fontWeight: 600 }}>{displayUpvotes}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  sx={{ color: hasDownvoted ? 'red' : 'gray' }}
                  onClick={handleDownvote}
                >
                  <ThumbDown />
                </IconButton>
                <Typography sx={{ color: 'red', fontWeight: 600 }}>{displayDownvotes}</Typography>
              </Box>
            </Box>
            <Button startIcon={<Comment />} variant="outlined" color="inherit">
              Comment
            </Button>
          </Box>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
          <img
            src={post.author.avatar || 'https://picsum.photos/800/450?random=1'}
            alt="Author Avatar"
            style={{ width: 30, height: 30, borderRadius: '50%' }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ marginLeft: 1 }}>
            {post.author.userName}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
};

export default PostCard;