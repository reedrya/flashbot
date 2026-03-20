'use client';

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export default function ThemedDialog({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  actions,
  maxWidth = 'xs',
  fullWidth = true,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      BackdropProps={{ className: 'themed-dialog-backdrop' }}
      PaperProps={{ className: 'themed-dialog-paper' }}
    >
      <Box aria-hidden="true" className="themed-dialog-accent" />
      <DialogTitle className="themed-dialog-title">
        {eyebrow ? (
          <Typography variant="overline" className="themed-dialog-eyebrow">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          variant="h5"
          className={`themed-dialog-heading${eyebrow ? ' themed-dialog-heading-with-eyebrow' : ''}`}
        >
          {title}
        </Typography>
      </DialogTitle>
      {description || children ? (
        <DialogContent className="themed-dialog-content">
          {description ? (
            <Typography
              variant="body2"
              className={`themed-dialog-description${
                children ? ' themed-dialog-description-with-children' : ''
              }`}
            >
              {description}
            </Typography>
          ) : null}
          {children}
        </DialogContent>
      ) : null}
      {actions ? (
        <DialogActions className="themed-dialog-actions">{actions}</DialogActions>
      ) : null}
    </Dialog>
  );
}
