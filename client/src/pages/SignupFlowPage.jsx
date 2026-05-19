import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import logo from '../assets/logo.png';
import { authApi } from '../lib/api';
import OtpInputGroup from '../components/OtpInputGroup';

const initialForm = {
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
};

const initialErrors = {
  email: '',
  otp: '',
  name: '',
  password: '',
  confirmPassword: '',
  form: '',
};

const stepOrder = ['otp', 'password'];
const stepLabels = {
  otp: 'Verify',
  password: 'Account',
};

const passwordMinLength = 8;
const resendCooldownSeconds = 30;

function StepChip({ label, active, complete }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: '999px',
        bgcolor: active ? '#DBEAFE' : '#F8FAFC',
        color: active ? '#1D4ED8' : '#64748B',
        border: '1px solid',
        borderColor: active ? '#BFDBFE' : '#E2E8F0',
        transition: 'all 0.24s ease',
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: complete || active ? '#2563EB' : '#E2E8F0',
          color: '#FFFFFF',
        }}
      >
        {complete ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : null}
      </Box>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</Typography>
    </Box>
  );
}

function SignupFlowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const storedEmail = sessionStorage.getItem('lanzo-signup-email') || '';
  const routedEmail = location.state?.email || '';
  const initialEmail = routedEmail || storedEmail;
  const [step, setStep] = useState(
    sessionStorage.getItem('lanzo-signup-token') ? 'password' : 'otp'
  );
  const [form, setForm] = useState(initialForm);
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState({
    email: false,
    otp: false,
    resend: false,
    password: false,
  });
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [resendSeconds, setResendSeconds] = useState(0);

  const otpCode = useMemo(() => otpValues.join(''), [otpValues]);
  const completedStepIndex = stepOrder.indexOf(step);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!initialEmail) {
      navigate('/');
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      email: initialEmail,
    }));
    sessionStorage.setItem('lanzo-signup-email', initialEmail);
  }, [initialEmail, navigate]);

  useEffect(() => {
    if (!initialEmail || sessionStorage.getItem('lanzo-signup-token')) {
      return;
    }

    setResendSeconds(resendCooldownSeconds);
    setStatus({
      type: 'success',
      message: `We sent a 6-digit code to ${initialEmail}.`,
    });
  }, [initialEmail]);

  useEffect(() => {
    if (!resendSeconds) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const setFieldValue = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '', form: '' }));
  };

  const validatePasswordStep = () => {
    const nextErrors = {
      name: !form.name.trim() ? 'Name is required' : '',
      password:
        form.password.length < passwordMinLength
          ? `Password must be at least ${passwordMinLength} characters`
          : '',
      confirmPassword:
        form.password !== form.confirmPassword ? 'Passwords do not match' : '',
    };

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      ...nextErrors,
      form: '',
    }));

    return !Object.values(nextErrors).some(Boolean);
  };

  const resetOtpState = () => {
    setOtpValues(Array(6).fill(''));
    setErrors((currentErrors) => ({ ...currentErrors, otp: '', form: '' }));
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otpCode.length !== 6) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        otp: 'Enter the full 6-digit code',
      }));
      return;
    }

    setLoading((currentLoading) => ({ ...currentLoading, otp: true }));
    setErrors((currentErrors) => ({ ...currentErrors, otp: '', form: '' }));

    try {
      const response = await authApi.post('/verify-otp', {
        email: form.email.trim(),
        otp: otpCode,
      });

      const signupToken = response.data?.signupToken;
      sessionStorage.setItem('lanzo-signup-token', signupToken);
      setStep('password');
      setStatus({
        type: 'success',
        message: 'Email verified. Finish setting up your account.',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to verify code';
      const normalizedMessage = /expired/i.test(message)
        ? 'This code has expired. Request a fresh OTP to continue.'
        : /invalid/i.test(message)
          ? 'That code does not match. Please try again.'
          : message;

      setErrors((currentErrors) => ({
        ...currentErrors,
        otp: normalizedMessage,
      }));
      setStatus({ type: 'error', message: normalizedMessage });
    } finally {
      setLoading((currentLoading) => ({ ...currentLoading, otp: false }));
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0) {
      return;
    }

    setLoading((currentLoading) => ({ ...currentLoading, resend: true }));
    setErrors((currentErrors) => ({ ...currentErrors, otp: '', form: '' }));

    try {
      await authApi.post('/send-otp', { email: form.email.trim() });
      resetOtpState();
      setResendSeconds(resendCooldownSeconds);
      setStatus({
        type: 'success',
        message: 'A fresh verification code is on its way.',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to resend OTP';
      setStatus({ type: 'error', message });
    } finally {
      setLoading((currentLoading) => ({ ...currentLoading, resend: false }));
    }
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    if (!validatePasswordStep()) {
      return;
    }

    const signupToken = sessionStorage.getItem('lanzo-signup-token');

    if (!signupToken) {
      setStep('email');
      setStatus({
        type: 'error',
        message: 'Your signup session expired. Start again from your email.',
      });
      return;
    }

    setLoading((currentLoading) => ({ ...currentLoading, password: true }));

    try {
      const response = await authApi.post(
        '/create-account',
        {
          name: form.name.trim(),
          password: form.password,
        },
        {
          headers: {
            Authorization: `Bearer ${signupToken}`,
          },
        }
      );

      const loginToken = response.data?.token;

      localStorage.setItem('lanzo-token', loginToken);
      sessionStorage.removeItem('lanzo-signup-token');
      navigate('/app');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to create account';

      if (/user already exists/i.test(message)) {
        sessionStorage.removeItem('lanzo-signup-token');
        navigate('/login');
        return;
      }

      setErrors((currentErrors) => ({ ...currentErrors, form: message }));
      setStatus({ type: 'error', message });
    } finally {
      setLoading((currentLoading) => ({ ...currentLoading, password: false }));
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      sessionStorage.removeItem('lanzo-signup-email');
      navigate('/');
      return;
    }

    if (step === 'password') {
      sessionStorage.removeItem('lanzo-signup-token');
      setStep('otp');
      return;
    }

    navigate('/');
  };

  const renderOtpStep = () => (
    <Box
      key="otp-step"
      component="form"
      onSubmit={handleVerifyOtp}
      sx={{ animation: 'stepEnter 320ms ease' }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.8px' }}
      >
        Create account with us
      </Typography>
      <Typography
        align="center"
        sx={{ color: '#475569', mt: 1.5, mb: 4, lineHeight: 1.75 }}
      >
        Enter the 6-digit code we sent to {form.email.trim()}.
      </Typography>
      <Stack spacing={2.5}>
        {/* Keep OTP entry split across boxes for quicker scanning and keyboard flow. */}
        <OtpInputGroup
          value={otpValues}
          onChange={(nextValue) => {
            setOtpValues(nextValue);
            setErrors((currentErrors) => ({ ...currentErrors, otp: '', form: '' }));
          }}
          autoFocus
          disabled={loading.otp}
        />
        {errors.otp ? <Alert severity="error">{errors.otp}</Alert> : null}
        <Button
          type="submit"
          variant="contained"
          disabled={loading.otp}
          sx={primaryButtonStyles}
        >
          {loading.otp ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Verify code'}
        </Button>
        <Button
          type="button"
          variant="text"
          onClick={handleResendOtp}
          disabled={loading.resend || resendSeconds > 0}
          sx={{
            color: '#2563EB',
            fontWeight: 700,
            alignSelf: 'center',
          }}
        >
          {loading.resend
            ? 'Sending a new code...'
            : resendSeconds > 0
              ? `Resend OTP in ${resendSeconds}s`
              : 'Resend OTP'}
        </Button>
      </Stack>
    </Box>
  );

  const renderPasswordStep = () => (
    <Box
      key="password-step"
      component="form"
      onSubmit={handleCreateAccount}
      sx={{ animation: 'stepEnter 320ms ease' }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.8px' }}
      >
        Create account with us
      </Typography>
      <Typography
        align="center"
        sx={{ color: '#475569', mt: 1.5, mb: 4, lineHeight: 1.75 }}
      >
        Set your name and password to finish creating your Lanzo account.
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          label="Full name"
          value={form.name}
          onChange={(event) => setFieldValue('name', event.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          autoComplete="name"
          fullWidth
          sx={fieldStyles}
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setFieldValue('password', event.target.value)}
          error={!!errors.password}
          helperText={errors.password || `Use at least ${passwordMinLength} characters.`}
          autoComplete="new-password"
          fullWidth
          sx={fieldStyles}
        />
        <TextField
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setFieldValue('confirmPassword', event.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          autoComplete="new-password"
          fullWidth
          sx={fieldStyles}
        />
        {errors.form ? <Alert severity="error">{errors.form}</Alert> : null}
        <Button
          type="submit"
          variant="contained"
          disabled={loading.password}
          sx={primaryButtonStyles}
        >
          {loading.password ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Create account'}
        </Button>
      </Stack>
    </Box>
  );

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
            variant="text"
            href="/login"
            sx={{ color: '#2563EB', fontWeight: 700, minWidth: 'auto' }}
          >
            Log in
          </Button>
        </Box>
      </Fade>

      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Grid container justifyContent="center">
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
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: 6,
                    p: { xs: 3, sm: 4.5 },
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
                    '@keyframes stepEnter': {
                      from: { opacity: 0, transform: 'translateY(12px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      mb: 4,
                    }}
                  >
                    <Button
                      type="button"
                      onClick={goBack}
                      startIcon={<ArrowBackRoundedIcon />}
                      sx={{
                        color: '#475569',
                        fontWeight: 700,
                        minWidth: 'auto',
                        px: 0,
                      }}
                    >
                      Back
                    </Button>
                    <Typography
                      sx={{
                        color: '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        justifySelf: 'end',
                      }}
                    >
                      Step {completedStepIndex + 1} of {stepOrder.length}
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ mb: 4 }}
                  >
                    {stepOrder.map((stepName, index) => (
                      <StepChip
                        key={stepName}
                        label={stepLabels[stepName]}
                        active={stepName === step}
                        complete={index < completedStepIndex}
                      />
                    ))}
                  </Stack>

                  {status.message ? (
                    <Alert severity={status.type} sx={{ mb: 3, borderRadius: 3 }}>
                      {status.message}
                    </Alert>
                  ) : null}

                  {step === 'otp' ? renderOtpStep() : null}
                  {step === 'password' ? renderPasswordStep() : null}
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

export default SignupFlowPage;