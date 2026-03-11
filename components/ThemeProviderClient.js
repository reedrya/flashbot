'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8ea8ff',
    },
    secondary: {
      main: '#67e8f9',
    },
    background: {
      default: '#0b1020',
      paper: '#11182d',
    },
    text: {
      primary: '#f4f7fb',
      secondary: '#9aa7bd',
    },
    divider: 'rgba(148, 163, 184, 0.16)',
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at top, rgba(142, 168, 255, 0.16), transparent 28%), radial-gradient(circle at 20% 20%, rgba(103, 232, 249, 0.08), transparent 24%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(11, 16, 32, 0.72)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 24, 45, 0.88)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          boxShadow: '0 24px 60px rgba(2, 6, 23, 0.28)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 44,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 16, 32, 0.52)',
          borderRadius: 18,
        },
        notchedOutline: {
          borderColor: 'rgba(148, 163, 184, 0.18)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
  },
});

export default function ThemeProviderClient({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
