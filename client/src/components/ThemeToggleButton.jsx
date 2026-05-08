import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function ThemeToggleButton({ isDark, onToggle }) {
  return (
    <Tooltip
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      placement="left"
    >
      <IconButton
        onClick={onToggle}
        aria-label="toggle theme"
        sx={{
          position: 'fixed',
          top: 20,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(0,0,0,0.10)',
          boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.45)'
            : '0 2px 12px rgba(0,0,0,0.12)',
          color: isDark ? '#E2E8F0' : '#1D4ED8',
          transition: 'all 0.25s ease',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,1)',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.55)'
              : '0 4px 20px rgba(0,0,0,0.18)',
            transform: 'scale(1.07)',
          },
        }}
      >
        {isDark ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggleButton;
