import { notFound } from 'next/navigation';
import { Typography, Box, Card, CardMedia, CardContent, Avatar } from '@mui/material';

interface Post {
  id: number;
  title: string;
  description: string;
  content: string; // Full content of the post
  tags: string;
  upvotes: number;
  downvotes: number;
  author: Author;
  category: { id: number; name: string };
  img: string;
}

interface Author {
  id: number;
  userName: string;
  avatar: string;
}

async function getPost(postId: string): Promise<Post | null> {
  try {
    const response = await fetch(`http://localhost:5128/posts/${postId}`);
    if (!response.ok) {
      return null; // Post not found
    }
    const post = await response.json();
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  console.log("slug", slug); // This should log the post ID (e.g., "29")

  const post = await getPost(slug); // Use the slug (post ID) to fetch the post

  if (!post) {
    notFound(); // Show a 404 page if the post is not found
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 4 }}>
      <Card variant="outlined">
        <CardMedia
          component="img"
          alt={post.title}
          image={post.img || 'https://picsum.photos/800/450?random=1'}
          sx={{ height: 400, objectFit: 'cover' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {post.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {post.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.content} {/* Full content of the post */}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <Avatar
              src={post.author.avatar || 'https://picsum.photos/800/450?random=1'}
              alt={post.author.userName}
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: 1 }}>
              By {post.author.userName}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}