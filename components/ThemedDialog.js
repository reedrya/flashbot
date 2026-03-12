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
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(2, 6, 23, 0.56)',
        },
      }}
      PaperProps={{
        sx: {
          p: 2,
          overflow: 'hidden',
          borderRadius: 6,
          border: '1px solid rgba(148, 163, 184, 0.14)',
          background:
            'linear-gradient(180deg, rgba(17, 24, 45, 0.98), rgba(9, 14, 26, 0.98))',
          boxShadow: '0 32px 80px rgba(2, 6, 23, 0.48)',
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          height: 1,
          background:
            'linear-gradient(90deg, rgba(103, 232, 249, 0.72), rgba(142, 168, 255, 0.72))',
        }}
      />
      <DialogTitle sx={{ py: 3, pb: description || children ? 2 : 2 }}>
        {eyebrow ? (
          <Typography
            variant="overline"
            sx={{ px: 2, color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h5" sx={{ px: 2, pb: 1, mt: eyebrow ? 0.75 : 0 }}>
          {title}
        </Typography>
      </DialogTitle>
      {description || children ? (
        <DialogContent sx={{ pt: 1, pb: 3 }}>
          {description ? (
            <Typography variant="body2" sx={{ px: 2, pb: 1, color: 'text.secondary', lineHeight: 1.7, mb: children ? 2 : 0 }}>
              {description}
            </Typography>
          ) : null}
          {children}
        </DialogContent>
      ) : null}
      {actions ? (
        <DialogActions sx={{ px: { xs: 4, sm: 5 }, pb: 3, pt: 1.5 }}>{actions}</DialogActions>
      ) : null}
    </Dialog>
  );
}
