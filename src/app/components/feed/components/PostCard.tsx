import React, { useEffect, useState } from 'react';
import { Box, Grid,Typography,Card,CardContent,Button,IconButton,Avatar,} from '@mui/material';
import { ThumbUp, ThumbDown, Comment } from '@mui/icons-material';
import Link from 'next/link';
import CommentsModal from './CommentsModal'; // Import the CommentsModal component
import { jwtDecode } from 'jwt-decode';

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
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [commentModalOpen, setCommentModalOpen] = useState(false); // State for modal open/close
  const [postPosition, setPostPosition] = useState({ top: 0, left: 0, width: 0, height: 0 }); // State for post card position
  const [signedInUserId, setSignedInUserId] = useState<number | null>(null); // State for signed-in user ID

  const token = localStorage.getItem('token');

  // Fetch the signed-in user's ID from the token
  useEffect(() => {
    const getUserIdFromToken = (): number | null => {
      if (token) {
        try {
          const decodedToken: { UserId: string } = jwtDecode(token);
          console.log('Decoded Token:', decodedToken); // Debugging line
          return parseInt(decodedToken.UserId, 10); // Convert UserId to a number
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      return null;
    };

    const userId = getUserIdFromToken();
    setSignedInUserId(userId);
    console.log('Signed-in User ID:', userId); // Debugging line
  }, [token]);

  // Fetch data (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post images
        const imageResponse = await fetch(`http://localhost:5128/Posts/${post.id}/images`, { method: 'GET' });
        if (!imageResponse.ok) {
          const errorMessage = await imageResponse.text();
          console.warn(`Error fetching images: ${errorMessage}`);
        } else {
          const imageData = await imageResponse.json();
          const fullImagePaths = imageData.map((image) => `http://localhost:5128${image.imagePath}`);
          setImages(fullImagePaths);
        }

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

        // Fetch profile picture
        const profileResponse = await fetch(`http://localhost:5128/Users/profile-picture/${post.author.id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile picture');
        }
        const profileData = await profileResponse.json();
        const fullProfilePictureUrl = `http://localhost:5128${profileData.profilePictureUrl}`;
        setProfilePicture(fullProfilePictureUrl);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfilePicture('');
      }
    };

    fetchData();
  }, [post.id, token, userName, post.author.id]);

  // Handle upvote (unchanged)
  const handleUpvote = () => {
    if (hasUpvoted) {
      setDisplayUpvotes(displayUpvotes - 1);
      setHasUpvoted(false);
      fetch('http://localhost:5128/Votes', {
        method: 'Post',
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
          fetchVoteStatus();
        })
        .catch((error) => console.error('Error removing upvote:', error));
    } else {
      if (hasDownvoted) {
        setDisplayDownvotes(displayDownvotes - 1);
        setHasDownvoted(false);
      }
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
          setHasDownvoted(false);
          fetchVoteStatus();
        })
        .catch((error) => console.error('Error submitting upvote:', error));
    }
  };

  // Handle downvote (unchanged)
  const handleDownvote = () => {
    if (hasDownvoted) {
      setDisplayDownvotes(displayDownvotes - 1);
      setHasDownvoted(false);
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
          fetchVoteStatus();
        })
        .catch((error) => console.error('Error removing downvote:', error));
    } else {
      if (hasUpvoted) {
        setDisplayUpvotes(displayUpvotes - 1);
        setHasUpvoted(false);
      }
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
          setHasUpvoted(false);
          fetchVoteStatus();
        })
        .catch((error) => console.error('Error submitting downvote:', error));
    }
  };

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

  // Render images (unchanged)
  const renderImages = () => {
    if (images.length === 0) {
      return (
        <Box
          component="img"
          src={'https://via.placeholder.com/800x450?text=No+Image+Available'}
          alt="Placeholder"
          sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
        />
      );
    }

    switch (images.length) {
      case 1:
        return (
          <Box
            component="img"
            src={images[0]}
            alt="Post image"
            sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
          />
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', gap: '2px', height: 200 }}>
            {images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`Post image ${index + 1}`}
                sx={{ width: '50%', height: '100%', objectFit: 'cover' }}
              />
            ))}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', gap: '2px', height: 200 }}>
            <Box
              component="img"
              src={images[0]}
              alt="Post image 1"
              sx={{ width: '50%', height: '100%', objectFit: 'cover' }}
            />
            <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {images.slice(1).map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt={`Post image ${index + 2}`}
                  sx={{ width: '100%', height: '50%', objectFit: 'cover' }}
                />
              ))}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2px', height: 200 }}>
            {images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`Post image ${index + 1}`}
                sx={{ width: 'calc(50% - 1px)', height: '50%', objectFit: 'cover' }}
              />
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  // Handle opening the comments modal
  const handleOpenCommentsModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    const postCardElement = event.currentTarget.closest('.post-card'); // Find the closest post card element
    if (postCardElement) {
      const rect = postCardElement.getBoundingClientRect(); // Get the post card's position
      setPostPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setCommentModalOpen(true); // Open the modal
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }} className="post-card">
      <Link
  href={{
    pathname: `/pages/${post.id}/posts`,
   // Add your query parameters here
  }}
  passHref
>
          <Box
            sx={{
              position: 'relative',
              '&:hover .hover-overlay': { opacity: 1 },
            }}
          >
            {renderImages()}
          </Box>
        </Link>
        <CardContent>
          <Typography gutterBottom variant="caption" color="primary">
            {post.category.name}
          </Typography>
          <Typography gutterBottom variant="h6" sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton sx={{ color: hasUpvoted ? 'green' : 'gray' }} onClick={handleUpvote}>
                  <ThumbUp />
                </IconButton>
                <Typography sx={{ fontWeight: 600 }}>{displayUpvotes}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton sx={{ color: hasDownvoted ? 'red' : 'gray' }} onClick={handleDownvote}>
                  <ThumbDown />
                </IconButton>
                <Typography sx={{ fontWeight: 600 }}>{displayDownvotes}</Typography>
              </Box>
            </Box>
            <Button startIcon={<Comment />} variant="outlined" color="inherit" onClick={handleOpenCommentsModal}>
              Comment
            </Button>
          </Box>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
          <Avatar src={profilePicture} alt={post.author.userName} sx={{ width: 30, height: 30 }}>
            {!profilePicture && post.author.userName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ marginLeft: 1 }}>
            {post.author.userName}
          </Typography>
        </Box>
      </Card>

      {/* Comments Modal */}
      {commentModalOpen && (
        <CommentsModal
          open={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
          postId={post.id}
          token={token}
          userId={signedInUserId} // Pass the signed-in user's ID
          postPosition={postPosition}
        />
      )}
    </Grid>
  );
};

export default PostCard;