import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Fade,
  Slide,
  Stack,
} from '@mui/material';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from '../assets/logo.png';
import checklistLottie from '../assets/checklist.lottie';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Fade in={mounted} timeout={600}>
        <Box
          component="header"
          sx={{
            bgcolor: '#ffffff',
            px: { xs: 3, md: 6 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: '0 1px 0 #E2E8F0',
            zIndex: 10,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Lanzo logo"
            sx={{ width: 36, height: 36, objectFit: 'contain' }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: '#2563EB',
              lineHeight: 1,
            }}
          >
            Lanzo
          </Typography>
        </Box>
      </Fade>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Grid
            container
            spacing={{ xs: 4, md: 8 }}
            alignItems="center"
          >
            {/* ── Left: copy + CTAs ──────────────────────────────── */}
            <Grid item xs={12} md={6}>
              <Slide in={mounted} direction="right" timeout={700}>
                <Box>
                  <Fade in={mounted} timeout={900}>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: '#2563EB',
                          fontWeight: 700,
                          letterSpacing: 2,
                          fontSize: '0.75rem',
                        }}
                      >
                        Task management, reimagined
                      </Typography>

                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 800,
                          color: '#0F172A',
                          lineHeight: 1.15,
                          mt: 1.5,
                          mb: 2.5,
                          fontSize: { xs: '2.2rem', md: '3rem' },
                          letterSpacing: '-1px',
                        }}
                      >
                        Organize your work.{' '}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: '#475569',
                          fontSize: '1.05rem',
                          lineHeight: 1.75,
                          mb: 4,
                          maxWidth: 440,
                        }}
                      >
                        Lanzo helps you capture tasks, track progress, and stay
                        focused — all in one clean, intuitive workspace.
                      </Typography>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          variant="contained"
                          size="large"
                          href="/signup"
                          sx={{
                            bgcolor: '#2563EB',
                            color: '#ffffff',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                            transition: 'all 0.22s ease',
                            '&:hover': {
                              bgcolor: '#1D4ED8',
                              boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          Get started free
                        </Button>

                        <Button
                          variant="outlined"
                          size="large"
                          href="/login"
                          sx={{
                            borderColor: '#2563EB',
                            color: '#2563EB',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '0.95rem',
                            transition: 'all 0.22s ease',
                            '&:hover': {
                              bgcolor: '#EFF6FF',
                              borderColor: '#1D4ED8',
                              color: '#1D4ED8',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          Log in
                        </Button>
                      </Stack>
                    </Box>
                  </Fade>
                </Box>
              </Slide>
            </Grid>

            {/* ── Right: Lottie ──────────────────────────────────── */}
            <Grid item xs={12} md={6}>
              <Slide in={mounted} direction="left" timeout={800}>
                <Fade in={mounted} timeout={1000}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      maxWidth: { xs: 380, sm: 500, md: 920 },
                      mx: 'auto',
                      filter: 'drop-shadow(0 20px 48px rgba(37,99,235,0.12))',
                      animation: 'float 5s ease-in-out infinite',
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-12px)' },
                      },
                    }}
                  >
                    <DotLottieReact
                      src={checklistLottie}
                      loop
                      autoplay
                      style={{ width: '100%' }}
                    />
                  </Box>
                </Fade>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <Fade in={mounted} timeout={1200}>
        <Box
          component="footer"
          sx={{
            bgcolor: '#ffffff',
            borderTop: '1px solid #E2E8F0',
            py: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            © {new Date().getFullYear()} Lanzo. All rights reserved.
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}
