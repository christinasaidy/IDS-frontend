import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Link from 'next/link';

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  position: 'relative',
  textDecoration: 'none',
  '&:hover': { cursor: 'pointer' },
  '& .arrow': {
    visibility: 'hidden',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '&:hover .arrow': {
    visibility: 'visible',
    opacity: 0.7,
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '3px',
    borderRadius: '8px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: '1px',
    bottom: 0,
    left: 0,
    backgroundColor: (theme.vars || theme).palette.text.primary,
    opacity: 0.3,
    transition: 'width 0.3s ease, opacity 0.3s ease',
  },
  '&:hover::before': {
    width: '100%',
  },
}));

const token = localStorage.getItem('token');
function Author({ authors, createdAt }) {
  const [profilePictures, setProfilePictures] = React.useState({});

  React.useEffect(() => {
    authors.forEach(async (author) => {
      try {
        // Fetch profile picture
        const response = await fetch(`http://localhost:5128/Users/profile-picture/${author.id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile picture');
        }

        const data = await response.json();
        const fullProfilePictureUrl = `http://localhost:5128${data.profilePictureUrl}`;
        
        setProfilePictures((prev) => ({
          ...prev,
          [author.id]: fullProfilePictureUrl,
        }));
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setProfilePictures((prev) => ({
          ...prev,
          [author.id]: '', // Set to empty string if no profile picture is available
        }));
      }
    });
  }, [authors]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
        <AvatarGroup max={3}>
          {authors.map((author, index) => (
            <Avatar
              key={index}
              alt={author.name}
              src={profilePictures[author.id]}
              sx={{ width: 24, height: 24 }}
            />
          ))}
        </AvatarGroup>
        <Typography variant="caption">
          {authors.map((author) => author.name).join(', ')}
        </Typography>
      </Box>
      <Typography variant="caption">
        {new Date(createdAt).toLocaleDateString()}
      </Typography>
    </Box>
  );
}

export default function Latest() {
  const [latestPosts, setlatestPosts] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPosts, setTotalPosts] = React.useState(0);
  
  const postsPerPage = 4;

  React.useEffect(() => {
    const fetchPosts = async () => {
      const offset = (currentPage - 1) * postsPerPage;
      const response = await fetch(`http://localhost:5128/Posts/latest?count=${postsPerPage}&offset=${offset}`);
      const data = await response.json();

      const updatedData = data.map((item) => ({
        category: item.category.name,
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        id: item.id,

        authors: [
          {
            name: item.author.userName,
            id: item.author.id,
            avatar: '/static/images/avatar/placeholder.jpg',
          },
        ],
      }));
      console.log(updatedData)
      setlatestPosts(updatedData);
      console.log(latestPosts);
    };

    const fetchTotalPosts = async () => {
      const response = await fetch(`http://localhost:5128/Posts/count`);
      const count = await response.json();
      setTotalPosts(count);
    };

    
    fetchPosts();
    fetchTotalPosts();
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div>
      <Typography variant="h2" gutterBottom
        sx={{fontFamily: '"Poppins", sans-serif'}}> 
        Latest
      </Typography>
      <Grid container spacing={8} columns={12} sx={{ my: 4 }}>
        {latestPosts.map((latestPost, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1,
                height: '100%',
              }}
            >
              <Typography gutterBottom variant="caption" component="div">
                {latestPost.category}
              </Typography>
              <Link href={`/pages/${latestPost.id}/posts`} passHref> 

              <TitleTypography
                gutterBottom
                variant="h6"
                tabIndex={0}
              >
                {latestPost.title}

                <NavigateNextRoundedIcon
                  className="arrow"
                  sx={{ fontSize: '2rem' }}
                />
              </TitleTypography>
              </Link>
              <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                {latestPost.description}
              </StyledTypography>
              <Author authors={latestPost.authors} createdAt={latestPost.createdAt} />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
        <Pagination
          hidePrevButton
          hideNextButton
          count={totalPages}
          boundaryCount={10}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>
    </div>
  );
}
