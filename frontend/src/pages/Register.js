import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiMapPin, FiEye, FiEyeOff, FiStar, FiShield, FiTrendingUp, FiThumbsUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { authAPI } from '../services/api';
import { registerSchema } from '../utils/validationSchemas';
import { Button, Input, TextArea, FormGroup, Label, ErrorText, Card } from '../styles/GlobalStyles';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(circle at 28% 22%, #212a3d 0%, #1a2335 45%, #141c2a 75%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  padding: ${({ theme }) => theme.spacing.md};
  transition: background .6s ease;
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 1280px;
  text-align: left;
  padding: 56px 58px 54px;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(155deg, rgba(38,48,70,0.92) 0%, rgba(29,38,58,0.90) 60%, rgba(23,31,49,0.88) 100%)' : '#ffffffd9'};
  backdrop-filter: blur(18px) saturate(180%);
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 12px 42px -8px rgba(0,0,0,0.55), 0 4px 16px -4px rgba(0,0,0,0.45)'
    : '0 10px 40px -5px rgba(0,0,0,0.15), 0 2px 8px -2px rgba(0,0,0,0.08)'};

  /* Decorative blurred gradient orbs */
  &::before, &::after {
    content: '';
    position: absolute;
    width: 540px;
    height: 540px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(102,126,234,0.35), transparent 70%),
                radial-gradient(circle at 70% 70%, rgba(118,75,162,0.28), transparent 75%);
    filter: blur(40px) saturate(140%);
    z-index: 0;
    pointer-events: none;
  }
  &::before { top: -220px; left: -220px; }
  &::after { bottom: -240px; right: -240px; }

  .left-pane { position: relative; z-index: 1; }
  .right-pane { position: relative; z-index: 2; }

  .layout {
    display: grid;
    grid-template-columns: minmax(0,1fr) 440px;
    gap: 60px;
    align-items: start;
  }

  @media (max-width: 1180px) {
    padding: 46px 46px 48px;
    .layout { gap: 48px; grid-template-columns: minmax(0,1fr) 420px; }
  }

  @media (max-width: 1024px) {
    padding: 42px 40px 44px;
    .layout { gap: 40px; grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    padding: 34px 26px 38px;
  }

  .left-head { margin-bottom: 30px; }
  .left-foot { margin-top: 38px; font-size: .72rem; letter-spacing:.4px; color: ${({ theme }) => theme.colors.gray500}; }
  .right-pane { background: ${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(155deg,#26324a 0%,#202a40 55%,#1a2233 100%)' : 'linear-gradient(145deg,#ffffff 0%,#f8fafc 60%,#f1f5f9 100%)'}; padding:34px 32px 38px; border-radius:20px; box-shadow:${({ theme }) => theme.mode === 'dark' ? '0 6px 22px -4px rgba(0,0,0,0.55),0 2px 10px -2px rgba(0,0,0,0.45)' : '0 4px 14px -2px rgba(0,0,0,0.08),0 2px 6px -2px rgba(0,0,0,0.04)'}; transition: background .6s ease, box-shadow .5s ease; }
  @media (max-width:1024px){ .right-pane{ padding:30px 26px 32px; } }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.gray800};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray600};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 18px;
  margin-top: 34px;
  margin-bottom: 4px;
  @media (max-width: 640px){
    grid-template-columns: repeat(auto-fit, minmax(140px,1fr));
  }
`;

const FeatureCard = styled(motion.div)`
  background: ${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(145deg,#2b374c 0%,#253043 100%)' : 'linear-gradient(135deg,#ffffff 0%, #f1f5f9 100%)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(226,232,240,0.9)'};
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.04), 0 2px 4px -1px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(6px) saturate(150%);
  transition: all .4s cubic-bezier(.4,0,.2,1);
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px -4px rgba(0,0,0,0.12), 0 4px 10px -2px rgba(0,0,0,0.08);
    border-color: ${({ theme }) => theme.colors.primary}40;
  }

  .icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 10px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
    color: #fff;
    position: relative;
  }

  h4 { margin: 0 0 4px; font-size: .86rem; font-weight: 700; letter-spacing:.4px; color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray800}; }
  p { margin: 0; font-size: .63rem; line-height: .92rem; color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray600 : theme.colors.gray600}; }
`;

const MiniStatsBar = styled.div`
  display: flex;
  gap: 34px;
  margin-top: 30px;
  flex-wrap: wrap;
  @media (max-width: 640px){ gap: 18px; }
`;

const MiniStat = styled.div`
  display: flex; flex-direction: column; gap: 2px; min-width: 90px;
  h3 { margin:0; font-size: 1.35rem; font-weight: 800; background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 80%); -webkit-background-clip: text; color: transparent; }
  span { font-size: .6rem; letter-spacing:.5px; text-transform: uppercase; font-weight:600; color: ${({ theme }) => theme.colors.gray500}; }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 12px;
  color: ${({ theme }) => theme.colors.gray500};
  pointer-events: none;
`;

const StyledInput = styled(Input)`
  padding-left: 40px;
  padding-right: ${({ $hasIcon }) => $hasIcon ? '40px' : '12px'};
`;

const StyledTextArea = styled(TextArea)`
  padding-left: 40px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 12px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray500};
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.gray700};
  }
`;

const LoginLink = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.gray600};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Static feature descriptors for the left pane
const registerFeatures = [
  { icon: <FiStar />, title: 'Smart Ratings', desc: 'Rate & update anytime with live averages.' },
  { icon: <FiShield />, title: 'Secure Auth', desc: 'Encrypted passwords & JWT protection.' },
  { icon: <FiTrendingUp />, title: 'Insights', desc: 'Track your rating impact & favorites.' },
  { icon: <FiThumbsUp />, title: 'Owner Ready', desc: 'Upgrade to manage stores when approved.' }
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [miniStats] = useState({ users: 1200, ratings: 8450, stores: 320 }); // illustrative static figures

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { role: 'user' }
  });
  const watchRole = watch('role');
  const roleOnChange = (e) => setValue('role', e.target.value, { shouldValidate: true });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = data;
      await authAPI.register(submitData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Registration Error]', error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors?.length) {
        backendErrors.slice(0,3).forEach(e => toast.error(e.msg));
      }
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <RegisterCard>
          <div className="layout">
            <div className="left-pane">
              <div className="left-head">
                <Logo>
                  <FiStar />
                  StoreRate
                </Logo>
                <Title>Create Account</Title>
                <Subtitle>Join us to start rating your favorite stores</Subtitle>
                <p style={{ fontSize: '.8rem', lineHeight: '1.2rem', maxWidth: '520px', color: '#4a5568', marginTop: '14px' }}>
                  Your account lets you rate stores, track feedback, and (if approved) manage a store. Password must include at least 1 uppercase, 1 special character and be 8–16 characters.
                </p>

                <FeatureGrid>
                  {registerFeatures.map((f, i) => (
                    <FeatureCard
                      key={f.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * i }}
                    >
                      <div className="icon-wrap">{f.icon}</div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </FeatureCard>
                  ))}
                </FeatureGrid>

                <MiniStatsBar>
                  <MiniStat>
                    <h3>{miniStats.users.toLocaleString()}</h3>
                    <span>Users</span>
                  </MiniStat>
                  <MiniStat>
                    <h3>{miniStats.ratings.toLocaleString()}</h3>
                    <span>Ratings</span>
                  </MiniStat>
                  <MiniStat>
                    <h3>{miniStats.stores.toLocaleString()}</h3>
                    <span>Stores</span>
                  </MiniStat>
                </MiniStatsBar>
              </div>
              <div className="left-foot">Secure registration • Validation • Role-based platform</div>
            </div>
            <div className="right-pane">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                  <Label>Full Name</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiUser />
                    </InputIcon>
                    <StyledInput
                      type="text"
                      placeholder="Enter your full name (20-60 characters)"
                      $error={!!errors.name}
                      {...register('name')}
                    />
                  </InputWrapper>
                  {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Register As</Label>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    {['user','store_owner','admin'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          // manually set value in react-hook-form
                          // register provides setValue via mutation but simpler to dispatch event
                          const evt = { target: { name: 'role', value: r } }; 
                          roleOnChange(evt);
                        }}
                        style={{
                          padding:'10px 18px',
                          borderRadius:16,
                          border:'2px solid '+(watchRole===r ? '#667eea' : '#e2e8f0'),
                          background: watchRole===r ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : '#ffffff',
                          color: watchRole===r ? '#fff' : '#374151',
                          fontSize:'.7rem',
                          fontWeight:700,
                          letterSpacing:'.6px',
                          textTransform:'uppercase',
                          cursor:'pointer',
                          boxShadow: watchRole===r ? '0 6px 16px -4px rgba(102,126,234,0.45)' : '0 2px 4px rgba(0,0,0,0.06)'
                        }}
                      >{r.replace('_',' ')}</button>
                    ))}
                  </div>
                  <input type="hidden" {...register('role')} />
                  {errors.role && <ErrorText>{errors.role.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Email Address</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiMail />
                    </InputIcon>
                    <StyledInput
                      type="email"
                      placeholder="Enter your email"
                      $error={!!errors.email}
                      {...register('email')}
                    />
                  </InputWrapper>
                  {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Address</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiMapPin />
                    </InputIcon>
                    <StyledTextArea
                      placeholder="Enter your address (max 400 characters)"
                      $error={!!errors.address}
                      {...register('address')}
                    />
                  </InputWrapper>
                  {errors.address && <ErrorText>{errors.address.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Password</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiLock />
                    </InputIcon>
                    <StyledInput
                      type={showPassword ? 'text' : 'password'}
                      placeholder="8-16 chars, 1 uppercase, 1 special char"
                      $error={!!errors.password}
                      $hasIcon
                      {...register('password')}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Confirm Password</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiLock />
                    </InputIcon>
                    <StyledInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      $error={!!errors.confirmPassword}
                      $hasIcon
                      {...register('confirmPassword')}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  {errors.confirmPassword && <ErrorText>{errors.confirmPassword.message}</ErrorText>}
                </FormGroup>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <LoginLink style={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/login">Sign in here</Link>
              </LoginLink>
            </div>
          </div>
        </RegisterCard>
      </motion.div>
    </RegisterContainer>
  );
};

export default Register;
