import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiStar, FiShield, FiUser, FiBriefcase, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { loginSchema } from '../utils/validationSchemas';
import { Button, Input, FormGroup, Label, ErrorText, Card } from '../styles/GlobalStyles';

// Layout containers & styling
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 28px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(circle at 25% 20%, #20273b 0%, #1a2133 45%, #141b2c 75%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  transition: background .6s ease;
`;

const Shell = styled(Card)`
  width: 100%;
  max-width: 1280px;
  padding: 54px 56px 52px;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(160deg, rgba(37,46,66,0.94) 0%, rgba(27,34,52,0.92) 60%, rgba(21,28,44,0.9) 100%)'
    : '#ffffffd9'};
  backdrop-filter: blur(18px) saturate(180%);
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 12px 42px -8px rgba(0,0,0,0.55), 0 4px 16px -4px rgba(0,0,0,0.45)'
    : '0 10px 40px -5px rgba(0,0,0,0.15), 0 2px 8px -2px rgba(0,0,0,0.08)'};

  .accent-bar {
    position: absolute; top:0; left:0; right:0; height:6px; z-index: 5;
    border-top-left-radius: 20px; border-top-right-radius: 20px;
  }

  .grid { display:grid; grid-template-columns:minmax(0,1fr) 410px; gap:60px; }
  @media (max-width:1180px){ padding:46px 46px 48px; .grid{gap:48px; grid-template-columns:minmax(0,1fr) 400px;} }
  @media (max-width:1024px){ padding:42px 40px 44px; .grid{gap:42px; grid-template-columns:1fr;} }
  @media (max-width:640px){ padding:34px 26px 38px; }
`;

const Logo = styled.div`
  display:flex; align-items:center; gap:10px; font-size:1.9rem; font-weight:800; margin-bottom:12px;
  color:${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size:.95rem; line-height:1.35rem; margin:0 0 26px; color:${({ theme }) => theme.colors.gray600};
`;

const InputWrapper = styled.div` position:relative; `;
const InputIcon = styled.div` position:absolute; left:12px; top:50%; transform:translateY(-50%); color:${({ theme }) => theme.colors.gray500}; pointer-events:none; `;
const StyledInput = styled(Input)` padding-left:40px; padding-right:${({ $hasIcon }) => $hasIcon ? '40px' : '12px'}; `;
const PasswordToggle = styled.button` position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:${({ theme }) => theme.colors.gray500}; cursor:pointer; padding:4px; &:hover{ color:${({ theme }) => theme.colors.gray700}; }`;
const SignupLink = styled.div` margin-top:1.25rem; text-align:center; font-size:.9rem; color:${({ theme }) => theme.colors.gray600}; a{ color:${({ theme }) => theme.colors.primary}; text-decoration:none; font-weight:600; &:hover{text-decoration:underline;} }`;

const RoleGrid = styled.div` display:grid; grid-template-columns:repeat(auto-fit,minmax(115px,1fr)); gap:16px; margin:14px 0 26px; `;

const RoleCard = styled(motion.button)`
  position:relative; border:0; text-align:left; padding:14px 14px 12px; cursor:pointer; border-radius:16px; color:#fff; overflow:hidden; min-height:118px; display:flex; flex-direction:column; justify-content:space-between; font:inherit; background:${({ $variant }) => $variant === 'admin' ? 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#ec4899 120%)' : $variant === 'user' ? 'linear-gradient(135deg,#0ea5e9 0%,#2563eb 55%,#6366f1 120%)' : 'linear-gradient(135deg,#10b981 0%,#059669 55%,#0d9488 120%)'}; box-shadow:0 4px 14px -4px rgba(0,0,0,0.4),0 2px 6px -2px rgba(0,0,0,0.35); transition:transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease; outline:none;
  &:before{content:''; position:absolute; inset:0; background:radial-gradient(circle at 75% 15%,rgba(255,255,255,.35),transparent 60%), radial-gradient(circle at 15% 85%,rgba(255,255,255,.25),transparent 55%); mix-blend-mode:overlay; opacity:.75; pointer-events:none;}
  &:hover{ transform:translateY(-6px) rotateX(10deg) scale(1.02); }
  &.active{ outline:2px solid rgba(255,255,255,0.65); outline-offset:2px; }
  h4{ font-size:.8rem; margin:0 0 4px; letter-spacing:.5px; display:flex; gap:6px; align-items:center; font-weight:700; text-transform:uppercase; }
  p{ font-size:.63rem; line-height:1rem; margin:0; letter-spacing:.3px; opacity:.95; }
  .creds{ margin-top:6px; font-size:.58rem; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; opacity:.85; background:rgba(255,255,255,.15); padding:4px 6px; border-radius:6px; backdrop-filter:blur(4px) saturate(180%); }
  .selection-ring{ position:absolute; inset:0; border-radius:16px; box-shadow:0 0 0 2px rgba(255,255,255,.85), 0 4px 16px -2px rgba(0,0,0,.45); pointer-events:none; }
  .check-overlay{ position:absolute; top:8px; right:8px; background:rgba(0,0,0,.35); width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:10px; backdrop-filter:blur(6px); box-shadow:0 4px 10px -2px rgba(0,0,0,.4); }
`;

const roleAccent = {
  user: 'linear-gradient(90deg,#0ea5e9,#2563eb,#6366f1)',
  store_owner: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)',
  admin: 'linear-gradient(90deg,#10b981,#059669,#0d9488)'
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(null); // 'user' | 'store_owner' | 'admin'

  const quickCreds = {
    user: { email: 'user1@example.com', password: 'password123', label: 'Browse & rate stores', icon: <FiUser /> },
    store_owner: { email: 'owner1@example.com', password: 'password123', label: 'Manage stores & ratings', icon: <FiBriefcase /> },
    admin: { email: 'admin@example.com', password: 'adminpass', label: 'Platform management', icon: <FiShield /> }
  };

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ resolver: yupResolver(loginSchema) });

  const applyQuickCreds = (roleKey) => {
    const creds = quickCreds[roleKey];
    setValue('email', creds.email, { shouldValidate: true });
    setValue('password', creds.password, { shouldValidate: true });
    setActiveRole(roleKey);
    toast.info(`Role set to ${roleKey.replace('_', ' ')}`);
  };

  const onSubmit = async (form) => {
    if (!activeRole) {
      toast.warn('Select a role first.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login({ ...form, role: activeRole });
      login(data.token, data.user);
      toast.success('Login successful');
      const from = location.state?.from?.pathname;
      if (from) return navigate(from, { replace: true });
  // All roles share the unified /dashboard route which renders the correct dashboard based on user.role
  navigate('/dashboard');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[Login Error]', e.response?.data || e.message);
      toast.error(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const roleDescription = !activeRole ? 'Choose a portal to continue.' : activeRole === 'user' ? 'Regular user portal: browse & rate stores.' : activeRole === 'store_owner' ? 'Store owner portal: manage stores & view all ratings.' : 'Administrator portal: platform oversight & management.';

  return (
    <Page>
      <Shell as={motion.div} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <AnimatePresence mode="wait">
          {activeRole && (
            <motion.div key={activeRole} className="accent-bar" style={{ background: roleAccent[activeRole] }} initial={{ opacity:0, scaleX:0 }} animate={{ opacity:1, scaleX:1 }} exit={{ opacity:0, scaleX:0 }} transition={{ duration:0.45, ease:'easeOut' }} />
          )}
        </AnimatePresence>
        <div className="grid">
          <div>
            <Logo><FiStar /> StoreRate</Logo>
            <motion.h1 layout style={{ fontSize:'2.05rem', margin:'0 0 6px', fontWeight:800 }}>Welcome Back</motion.h1>
            <Subtitle as={motion.p} layout>{roleDescription}</Subtitle>
            <RoleGrid>
              {Object.entries(quickCreds).map(([key, meta], idx) => (
                <RoleCard
                  key={key}
                  type="button"
                  $variant={key === 'admin' ? 'admin' : key === 'user' ? 'user' : 'owner'}
                  className={activeRole === key ? 'active' : ''}
                  onClick={() => applyQuickCreds(key)}
                  whileHover={{ y:-6 }}
                  whileTap={{ scale:0.95 }}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.05 + idx*0.05 }}
                  aria-pressed={activeRole === key}
                  aria-label={`Select ${key.replace('_',' ')} role`}
                >
                  <div>
                    <h4>{meta.icon}{key.replace('_',' ')}</h4>
                    <p>{meta.label}</p>
                    <span className="creds">{meta.email}</span>
                  </div>
                  {activeRole === key && <motion.div layoutId="roleRing" className="selection-ring" />}
                  {activeRole === key && <div className="check-overlay"><FiCheck /></div>}
                </RoleCard>
              ))}
            </RoleGrid>
            <div style={{ fontSize:'.7rem', letterSpacing:'.4px', color:'rgba(255,255,255,0.65)' }}>Secure role-based access • JWT Auth • Animated UI</div>
          </div>
          <div className="right-pane" style={{ background:'var(--panel-bg,rgba(255,255,255,0.75))', padding:'34px 32px 38px', borderRadius:20 }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormGroup>
                <Label>Email</Label>
                <InputWrapper>
                  <InputIcon><FiMail /></InputIcon>
                  <StyledInput type="email" placeholder="you@example.com" $error={!!errors.email} {...register('email')} />
                </InputWrapper>
                {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <Label>Password</Label>
                <InputWrapper>
                  <InputIcon><FiLock /></InputIcon>
                  <StyledInput type={showPassword ? 'text' : 'password'} placeholder="••••••••" $error={!!errors.password} $hasIcon {...register('password')} />
                  <PasswordToggle type="button" onClick={() => setShowPassword(s => !s)}>{showPassword ? <FiEyeOff /> : <FiEye />}</PasswordToggle>
                </InputWrapper>
                {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
              </FormGroup>
              <Button type="submit" size="lg" disabled={loading || !activeRole} style={{ width:'100%', marginTop:'1.1rem', opacity: (!activeRole ? .55 : 1) }}>{loading ? 'Signing In...' : 'Sign In'}</Button>
            </form>
            <SignupLink>Don't have an account? <Link to="/register">Sign up here</Link></SignupLink>
          </div>
        </div>
      </Shell>
    </Page>
  );
};

export default Login;
