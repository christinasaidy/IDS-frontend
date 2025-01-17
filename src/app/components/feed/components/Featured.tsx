import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CardMedia, Button, IconButton } from '@mui/material';
import { ThumbUp, ThumbDown, Comment } from '@mui/icons-material';

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
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [displayUpvotes, setDisplayUpvotes] = useState(post.upvotes);
  const [displayDownvotes, setDisplayDownvotes] = useState(post.downvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  const token = localStorage.getItem('token');
  console.log("token: ",token);
  useEffect(() => {
    // Check if the user has voted on this post
    const userVoteStatus = localStorage.getItem(`voteStatus_${token}`);
    console.log("setHasUpvoted and setHasDownvoted: ",userVoteStatus);
    if (userVoteStatus) {
      const { upvoted, downvoted } = JSON.parse(userVoteStatus);
      setHasUpvoted(upvoted);
      setHasDownvoted(downvoted);
    }
  }, [post.id]);

  const handleUpvote = () => {
    if (hasUpvoted) return;

    if (hasDownvoted) {
      setDisplayDownvotes(displayDownvotes - 1);
      setHasDownvoted(false);
    }
    fetch('http://localhost:5128/Votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`,
      },
      body: JSON.stringify({
        postId: post.id,
        voteType: 'Upvote',
      }),
    })
    .then(() => {
      setDisplayUpvotes(displayUpvotes + 1);
      setHasUpvoted(true);
      localStorage.setItem(`voteStatus_${token}`, JSON.stringify({ upvoted: true, downvoted: false }));
    })
    .catch((error) => console.error('Error submitting upvote:', error));
  };

  const handleDownvote = () => {

    if (hasDownvoted) return;

    if (hasUpvoted) {
      setDisplayUpvotes(displayUpvotes - 1);
      setHasUpvoted(false);
    }

    fetch('http://localhost:5128/Votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`,
      },
      body: JSON.stringify({
        postId: post.id,
        voteType: 'Downvote',
      }),
    })
      .then(() => {
        setDisplayDownvotes(displayDownvotes + 1);
        setHasDownvoted(true);
        localStorage.setItem(`voteStatus_${token}`, JSON.stringify({ upvoted: false, downvoted: true }));
      })
      .catch((error) => console.error('Error submitting downvote:', error));
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          alt={post.title}
          image={post.img || 'https://picsum.photos/800/450?random=1'}
          sx={{
            height: 200,
            objectFit: 'cover',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
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
            <Button startIcon={<Comment />} variant="outlined" color="primary">
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

const FeaturedPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('http://localhost:5128/Posts/top?count=4')
      .then((response) => response.json())
      .then((data) => {
        const formattedPosts = Array.isArray(data) ? data : [data];
        const postsWithImage = formattedPosts.map((post: any) => ({
          ...post,
          img: 'https://picsum.photos/800/450?random=' + Math.floor(Math.random() * 100),
        }));
        setPosts(postsWithImage);
      })
      .catch((error) => console.error('Error fetching posts:', error));
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedPosts;
