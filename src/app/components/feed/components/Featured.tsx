import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PostCard from './PostCard';
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
const FeaturedPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('http://localhost:5128/Posts/top?count=6')
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