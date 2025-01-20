import * as React from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  IconButton,
  FormControl,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import { useEffect, useState } from 'react';
import FeaturedPosts from './Featured';
import Latest from '../components/Latest';
import PostCard from './PostCard'; // Import the PostCard component

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

export default function MainContent() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Fetch categories on component mount
  useEffect(() => {
    fetch('http://localhost:5128/Categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  // Fetch posts based on the selected category
  useEffect(() => {
    if (selectedCategoryId) {
      fetch(`http://localhost:5128/Posts/category/${selectedCategoryId}`)
        .then((response) => response.json())
        .then((data) => {
          const formattedPosts = Array.isArray(data) ? data : [data];
          setPosts(formattedPosts);
        })
        .catch((error) => console.error('Error fetching posts:', error));
    } else {
      setPosts([]); // Clear posts when "All categories" is selected
    }
  }, [selectedCategoryId]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          404: Social Life Not Found
        </Typography>
        <Typography>Stay in the loop with the latest tech news</Typography>
      </div>
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <Search />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'row',
            gap: 3,
            overflow: 'auto',
          }}
        >
          <Chip
            onClick={() => handleCategoryClick(null)}
            size="medium"
            label="All categories"
            sx={{
              backgroundColor: selectedCategoryId === null ? 'grey.300' : 'transparent',
              color: selectedCategoryId === null ? 'black' : 'inherit',
              border: 'none',
            }}
          />
          {categories.map((category) => (
            <Chip
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              size="medium"
              label={category.name}
              sx={{
                backgroundColor: selectedCategoryId === category.id ? 'grey.300' : 'transparent',
                color: selectedCategoryId === category.id ? 'black' : 'inherit',
                border: 'none',
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'row',
            gap: 1,
            width: { xs: '100%', md: 'fit-content' },
            overflow: 'auto',
          }}
        >
          <Search />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      {selectedCategoryId ? (
        <Box sx={{ padding: 3 }}>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Grid>
        </Box>
      ) : (
        <>
          <Typography variant="h2" gutterBottom>
            Featured
          </Typography>
          <FeaturedPosts />
          <Latest />
        </>
      )}
    </Box>
  );
}

// Search component (unchanged)
export function Search() {
  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          'aria-label': 'search',
        }}
      />
    </FormControl>
  );
}
