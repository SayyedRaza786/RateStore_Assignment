import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'radial-gradient(circle at 20% 20%, #1f2541 0%, #1a2035 45%, #141a2b 70%, #101626 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    min-height: 100vh;
    color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray200 : '#333'};
    transition: background 0.6s ease, color 0.3s ease;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  #root {
    min-height: 100vh;
  }
`;

export const theme = {
  mode: 'light',
  colors: {
    primary: '#667eea',
    primaryDark: '#5a67d8',
    secondary: '#764ba2',
    success: '#48bb78',
    warning: '#ed8936',
    error: '#f56565',
    info: '#4299e1',
    white: '#ffffff',
    gray100: '#f7fafc',
    gray200: '#edf2f7',
    gray300: '#e2e8f0',
    gray400: '#cbd5e0',
    gray500: '#a0aec0',
    gray600: '#718096',
    gray700: '#4a5568',
    gray800: '#2d3748',
    gray900: '#1a202c',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export const darkTheme = {
  ...theme,
  mode: 'dark',
  colors: {
    ...theme.colors,
    white: '#1f2638',
    gray100: '#2a3144',
    gray200: '#353d52',
    gray300: '#3f485f',
    gray400: '#4a546d',
    gray500: '#5a6a87',
    gray600: '#7d8aa3',
    gray700: '#a5b1c5',
    gray800: '#cbd5e1',
    gray900: '#f1f5f9',
    primary: '#6d83f2',
    primaryDark: '#5a6fd8',
    secondary: '#8a5cc2'
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0,0,0,0.5), 0 1px 2px 0 rgba(0,0,0,0.4)',
    md: '0 4px 8px -2px rgba(0,0,0,0.55), 0 2px 4px -1px rgba(0,0,0,0.4)',
    lg: '0 10px 18px -3px rgba(0,0,0,0.55), 0 6px 10px -4px rgba(0,0,0,0.5)',
    xl: '0 20px 30px -5px rgba(0,0,0,0.6), 0 12px 16px -6px rgba(0,0,0,0.55)'
  }
};

// Common styled components
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(145deg,#222b3d 0%,#1b2434 100%)' : theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: ${({ theme }) => theme.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : 'none'};
  backdrop-filter: ${({ theme }) => theme.mode === 'dark' ? 'blur(4px) saturate(160%)' : 'none'};
  transition: background .5s ease, color .3s ease, border .5s ease;
`;

export const Button = styled.button`
  background: ${({ variant, theme }) => {
    // Elevated contrast variants for light mode
    if (variant === 'secondary') {
      return theme.mode === 'dark'
        ? 'linear-gradient(135deg, #d1d9e6 0%, #b9c4d3 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';
    }
    if (variant === 'outline') {
      return 'transparent';
    }
    const baseGradLight = `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`;
    const baseGradDark = `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.secondary} 100%)`;
    switch (variant) {
      case 'success':
        return theme.mode === 'dark' ? '#2f855a' : 'linear-gradient(135deg,#38a169 0%,#2f855a 100%)';
      case 'warning':
        return theme.mode === 'dark' ? '#c05621' : 'linear-gradient(135deg,#ed8936 0%,#dd6b20 100%)';
      case 'error':
        return theme.mode === 'dark' ? '#c53030' : 'linear-gradient(135deg,#f56565 0%,#e53e3e 100%)';
      default:
        return theme.mode === 'dark' ? baseGradDark : baseGradLight;
    }
  }};
  color: ${({ variant, theme }) => 
    variant === 'secondary' ? (theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray800) : (variant === 'outline' ? (theme.mode === 'dark' ? theme.colors.gray700 : theme.colors.gray800) : theme.colors.white)};
  border: ${({ variant, theme }) => variant === 'outline' ? `2px solid ${theme.mode === 'dark' ? theme.colors.gray500 : theme.colors.gray700}` : 'none'};
  padding: ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg':
        return `${theme.spacing.lg} ${theme.spacing.xl}`;
      default:
        return `${theme.spacing.md} ${theme.spacing.lg}`;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    filter: brightness(${({ theme, variant }) => variant === 'secondary' ? 1.03 : 1.08});
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    filter: grayscale(0.2);
  }
  position: relative;
  overflow: hidden;
  &:after { content:''; position:absolute; inset:0; background: ${({ variant }) => variant ? 'transparent' : 'linear-gradient(120deg,rgba(255,255,255,0.25),rgba(255,255,255,0))'}; opacity:0; transition:opacity .4s; }
  &:hover:after { opacity: .5; }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $error }) => $error ? theme.colors.error : (theme.mode === 'dark' ? theme.colors.gray400 : theme.colors.gray300)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
  border-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}55;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray500};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $error }) => $error ? theme.colors.error : (theme.mode === 'dark' ? theme.colors.gray400 : theme.colors.gray300)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
  border-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}55;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray500};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $error }) => $error ? theme.colors.error : (theme.mode === 'dark' ? theme.colors.gray400 : theme.colors.gray300)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
  border-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}55;
  }
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray700};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.mode === 'dark' ? '#212a3b' : 'white'};
  color: inherit;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: background .5s ease;
`;

export const TableHeader = styled.th`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: left;
  font-weight: 600;
  cursor: ${({ sortable }) => sortable ? 'pointer' : 'default'};
  user-select: none;
  transition: background .4s ease;

  &:hover {
    background: ${({ sortable, theme }) =>
      sortable ? `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.secondary} 100%)` : ''};
  }
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : theme.colors.gray100};
  }

  &:hover {
    background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.gray200};
  }
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.gray200};
`;

export const Badge = styled.span`
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  }};
  color: white;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const LoadingSpinner = styled.div`
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  border: 3px solid ${({ theme }) => theme.colors.gray300};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: ${({ theme }) => theme.spacing.md} auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const StarRating = styled.div`
  display: inline-flex;
  gap: 2px;
`;

export const Star = styled.span`
  color: ${({ filled, theme }) => filled ? '#fbbf24' : theme.colors.gray300};
  font-size: ${({ size }) => size || '1.25rem'};
  cursor: ${({ interactive }) => interactive ? 'pointer' : 'default'};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ interactive }) => interactive ? '#fbbf24' : ''};
  }
`;
