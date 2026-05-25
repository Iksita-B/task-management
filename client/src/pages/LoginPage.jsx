import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import logo from '../assets/logo.png';
import { authApi, getStoredAuthToken } from '../lib/api';

const initialForm = {
  email: '',
  password: '',
};

const initialErrors = {
  email: '',
  password: '',
  form: '',
};

function validateEmail(value) {
  if (!value.trim()) {
    return 'Email is required';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email';
  }

  return '';
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  return '';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    email: sessionStorage.getItem('lanzo-signup-email') || '',
  }));
  const [errors, setErrors] = useState(initialErrors);
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (getStoredAuthToken()) {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  const setFieldValue = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '', form: '' }));
    setStatus({ type: 'info', message: '' });
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      form: '',
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'info', message: '' });

    try {
      const response = await authApi.post('/login', {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem('lanzo-token', response.data?.token || '');
      sessionStorage.removeItem('lanzo-signup-token');
      sessionStorage.setItem('lanzo-signup-email', form.email.trim());
      navigate('/app');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to log in right now';
      setErrors((currentErrors) => ({ ...currentErrors, form: message }));
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)',
      }}
    >
      <Fade in={mounted} timeout={500}>
        <Box
          component="header"
          sx={{
            px: { xs: 3, md: 6 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 1px 0 #E2E8F0',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src={logo} alt="Lanzo logo" sx={{ width: 36, height: 36 }} />
            <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
              Lanzo
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: 2,
              fontSize: '0.875rem',
              transition: 'all 0.22s ease',
              '&:hover': {
                bgcolor: '#EFF6FF',
                borderColor: '#1D4ED8',
                color: '#1D4ED8',
              },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Fade>

      <Container
        maxWidth="lg"
        sx={{
          minHeight: 'calc(100vh - 73px)',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} md={8} lg={6}>
            <Fade in={mounted} timeout={850}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 620,
                  mx: 'auto',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 7,
                  bgcolor: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.55)',
                  boxShadow: '0 30px 80px rgba(37, 99, 235, 0.16)',
                }}
              >
                <Box
                  component="form"
                  onSubmit={handleLogin}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: 6,
                    p: { xs: 3, sm: 4.5 },
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
                  }}
                >
                  <Typography
                    variant="h4"
                    align="center"
                    sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.8px' }}
                  >
                    Welcome back
                  </Typography>
                  <Typography
                    align="center"
                    sx={{ color: '#475569', mt: 1.5, mb: 4, lineHeight: 1.75 }}
                  >
                    Log in with your email and password to get back to your Lanzo board.
                  </Typography>

                  {status.message && status.type === 'error' ? (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                      {status.message}
                    </Alert>
                  ) : null}

                  <Stack spacing={2.5}>
                    <TextField
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setFieldValue('email', event.target.value)}
                      onBlur={() => {
                        setErrors((currentErrors) => ({
                          ...currentErrors,
                          email: validateEmail(form.email),
                        }));
                      }}
                      error={!!errors.email}
                      helperText={errors.email}
                      autoComplete="email"
                      fullWidth
                      sx={fieldStyles}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(event) => setFieldValue('password', event.target.value)}
                      onBlur={() => {
                        setErrors((currentErrors) => ({
                          ...currentErrors,
                          password: validatePassword(form.password),
                        }));
                      }}
                      error={!!errors.password}
                      helperText={errors.password}
                      autoComplete="current-password"
                      fullWidth
                      sx={fieldStyles}
                    />
                    {errors.form ? <Alert severity="error">{errors.form}</Alert> : null}
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={primaryButtonStyles}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                      ) : (
                        'Log in'
                      )}
                    </Button>
                  </Stack>

                  <Typography
                    align="center"
                    sx={{ mt: 3.5, color: '#64748B', fontSize: '0.95rem' }}
                  >
                    Need an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/"
                      underline="hover"
                      sx={{ color: '#2563EB', fontWeight: 700 }}
                    >
                      Start signup
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      borderColor: '#CBD5E1',
    },
    '&:hover fieldset': {
      borderColor: '#2563EB',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563EB',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.14)',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#2563EB',
  },
  '& .MuiFormHelperText-root': {
    ml: 0.5,
  },
};

const primaryButtonStyles = {
  minHeight: 52,
  borderRadius: 3,
  bgcolor: '#2563EB',
  color: '#FFFFFF',
  fontWeight: 800,
  fontSize: '0.95rem',
  textTransform: 'none',
  boxShadow: '0 10px 24px rgba(37, 99, 235, 0.28)',
  transition: 'all 0.22s ease',
  '&:hover': {
    bgcolor: '#1D4ED8',
    boxShadow: '0 14px 28px rgba(37, 99, 235, 0.34)',
    transform: 'translateY(-1px)',
  },
  '&.Mui-disabled': {
    bgcolor: '#93C5FD',
    color: '#EFF6FF',
  },
};