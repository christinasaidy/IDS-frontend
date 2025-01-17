import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import { SxProps, Theme } from '@mui/system';

interface CreatePostProps {
  sx?: SxProps<Theme>;
}

const CreatePost: React.FC<CreatePostProps> = ({ sx }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
          zIndex: 1000,
          ...sx,
        }}
        onClick={handleClickOpen}
      >
        Create a Post
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create a New Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
          />
          <TextField
            margin="dense"
            label="Tags"
            type="text"
            fullWidth
            variant="outlined"
            helperText="Separate tags with commas"
          />
          <TextField
            margin="dense"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Upload Images"
            type="file"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              multiple: true,
              accept: "image/*",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreatePost;
