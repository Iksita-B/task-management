import { useEffect, useMemo, useRef } from 'react';
import { Box, TextField } from '@mui/material';

function OtpInputGroup({ value, onChange, disabled = false, autoFocus = false }) {
  const inputRefs = useRef([]);
  const digits = useMemo(() => {
    const padded = [...value];

    while (padded.length < 6) {
      padded.push('');
    }

    return padded.slice(0, 6);
  }, [value]);

  useEffect(() => {
    if (autoFocus && !digits.some(Boolean)) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, digits]);

  const updateDigit = (index, nextDigit) => {
    const nextValue = [...digits];
    nextValue[index] = nextDigit;
    onChange(nextValue);
  };

  const handleChange = (index, event) => {
    const rawValue = event.target.value.replace(/\D/g, '');

    if (!rawValue) {
      updateDigit(index, '');
      return;
    }

    if (rawValue.length > 1) {
      const pastedDigits = rawValue.slice(0, 6).split('');
      const nextValue = [...digits];

      pastedDigits.forEach((digit, pastedIndex) => {
        if (index + pastedIndex < 6) {
          nextValue[index + pastedIndex] = digit;
        }
      });

      onChange(nextValue);
      inputRefs.current[Math.min(index + pastedDigits.length, 5)]?.focus();
      return;
    }

    updateDigit(index, rawValue);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const previousIndex = index - 1;
      updateDigit(previousIndex, '');
      inputRefs.current[previousIndex]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
      .split('');

    if (!pastedDigits.length) {
      return;
    }

    const nextValue = [...digits];
    pastedDigits.forEach((digit, index) => {
      nextValue[index] = digit;
    });
    onChange(nextValue);
    inputRefs.current[Math.min(pastedDigits.length - 1, 5)]?.focus();
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      {digits.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(element) => {
            inputRefs.current[index] = element;
          }}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 1,
            'aria-label': `OTP digit ${index + 1}`,
            style: {
              textAlign: 'center',
              padding: '18px 0',
              fontSize: '1.35rem',
              fontWeight: 700,
            },
          }}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
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
          }}
        />
      ))}
    </Box>
  );
}

export default OtpInputGroup;