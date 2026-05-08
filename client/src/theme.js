import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
      hover: '#F1F5F9',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    primary: {
      main: '#2563EB',
      dark: '#1D4ED8',
      light: '#DBEAFE',
    },
    secondary: {
      main: '#7C3AED',
      light: '#EDE9FE',
    },
    success: {
      main: '#16A34A',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#DC2626',
    },
    info: {
      main: '#0EA5E9',
    },
    divider: '#CBD5E1',
    border: '#E2E8F0',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B1220',
      paper: '#111827',
      elevated: '#1F2937',
      hover: '#1E293B',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      disabled: '#64748B',
    },
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      softBg: 'rgba(59, 130, 246, 0.15)',
    },
    secondary: {
      main: '#8B5CF6',
      light: 'rgba(139, 92, 246, 0.15)',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#FBBF24',
    },
    error: {
      main: '#F87171',
    },
    info: {
      main: '#38BDF8',
    },
    divider: '#334155',
    border: '#1F2937',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0B1220',
          color: '#E2E8F0',
        },
      },
    },
  },
});
