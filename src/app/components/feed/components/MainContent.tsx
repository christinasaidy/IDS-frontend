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
  const [searchResults, setSearchResults] = useState<Post[]>([]);

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
        .then((response) => {
          // First, check if the response is OK (status code 200-299)
       
          // Try to parse the response as JSON
          return response.text().then((text) => {
            try {
              // Attempt to parse the text as JSON
              return JSON.parse(text);
            } catch (error) {
              // If parsing fails, it means the response is not JSON (e.g., "No posts found")
              return null; // Return null or any other value to indicate non-JSON response
            }
          });
        })
        .then((data) => {
          // If data is null, it means the response was not JSON (e.g., "No posts found")
          if (data === null) {
            console.log("No posts found or invalid response."); // Log or handle as needed
            return; // Do nothing in this case
          }
          // If data is valid JSON, process it
          const formattedPosts = Array.isArray(data) ? data : [data];
          setPosts(formattedPosts);
        })
        .catch((error) => {
          console.error('Error fetching posts:', error);
          setPosts([]); // Clear posts if there's an error
        });
    } else {
      setPosts([]); // Clear posts when "All categories" is selected
    }
  }, [selectedCategoryId]);

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSearchResults([]); // Clear search results when a category is selected
  };

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length > 2) {
      try {
        const response = await fetch(`http://localhost:5128/Posts/search?query=${query}`);
        const data = await response.json();
        setSearchResults(data); // Update search results
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]); // Clear search results if query is too short
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Title and Subtitle */}
      <div>
        <Typography
          variant="h1"
          gutterBottom
          sx={{
            fontSize: '2.5rem',
            fontWeight: 700,
            fontFamily: '"Montserrat", sans-serif', // Use Poppins font
            color: 'text.primary',
            mb: 1,
          }}
        >
          Where Developers Unite
        </Typography>
        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 400,
            fontFamily: '"Montserrat", sans-serif',
            color: 'text.secondary',
          }}
        >
          Stay in the loop with the latest tech news
        </Typography>
      </div>

      {/* Search Bar and RSS Feed (Mobile) */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <Search onSearch={handleSearch} />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>

      {/* Categories and Search Bar (Desktop) */}
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
            flex: 1, // Allow categories to take up remaining space
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
            width: { xs: '100%', md: '100%' }, // Make the search bar longer
            flex: 2, // Allow search bar to take up more space
            maxWidth: '300px', // Optional: Set a max width for the search bar
          }}
        >
          <Search onSearch={handleSearch} />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Search Results or Posts */}
      {searchResults.length > 0 ? (
        <Box sx={{ padding: 3 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif', // Use Poppins font
              color: 'text.primary',
            }}
          >
            Search Results
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Grid>
        </Box>
      ) : selectedCategoryId ? (
        <Box sx={{ padding: 3 }}>
          <Grid container spacing={3}>
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                sx={{ width: '100%', fontFamily: '"Poppins", sans-serif' }} // Use Poppins font
              >
                No posts exist in this category.
              </Typography>
            )}
          </Grid>
        </Box>
      ) : (
        <>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: '"Montserrat", sans-serif', // Use Poppins font
              color: 'text.primary',
            }}
          >
            Featured
          </Typography>
          <FeaturedPosts />
          <Latest />
        </>
      )}
    </Box>
  );
}

export function Search({ onSearch }: { onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <FormControl sx={{ width: '100%' }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          onSearch(event);
        }}
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