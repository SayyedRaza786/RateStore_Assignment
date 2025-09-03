import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUsers, FiShoppingBag, FiStar, FiPlus, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { Container, Card, Button, LoadingSpinner } from '../../styles/GlobalStyles';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(circle at 22% 24%, #212a3d 0%, #1b2335 38%, #151d2c 65%, #101724 85%)'
    : 'radial-gradient(circle at 20% 20%, #f0f4ff 0%, #eef3ff 30%, #e9effe 50%, #e3ecff 70%, #dae6ff 100%)'};
  position: relative;
  overflow-x: hidden;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 780px;
    height: 780px;
    border-radius: 50%;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'radial-gradient(circle at 30% 30%, rgba(102,126,234,0.12), transparent 70%), radial-gradient(circle at 70% 70%, rgba(118,75,162,0.10), transparent 75%)'
      : 'radial-gradient(circle at 30% 30%, rgba(102,126,234,0.28), transparent 70%), radial-gradient(circle at 70% 70%, rgba(118,75,162,0.22), transparent 75%)'};
    filter: blur(60px) saturate(140%);
    pointer-events: none;
    z-index: 0;
  }
  &::before { top: -320px; left: -320px; }
  &::after { bottom: -360px; right: -360px; }
`;

const Content = styled(Container)`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: clamp(2.25rem, 4vw, 2.9rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  background: linear-gradient(115deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 45%, #805ad5 85%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray600};
  font-size: 1.05rem;
  max-width: 760px;
  margin: 0 auto;
`;

// Compact metrics bar to fill upper area and reduce empty scroll
const MetaBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
  margin-bottom: 10px;
`;

const InfoChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 11px;
  border-radius: 14px;
  font-size: .72rem;
  letter-spacing: .5px;
  font-weight: 600;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(140deg, rgba(102,126,234,0.18) 0%, rgba(118,75,162,0.18) 100%)'
    : 'linear-gradient(140deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.12) 100%)'};
  color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray700};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(102,126,234,0.25)'};
  backdrop-filter: blur(6px) saturate(160%);
  box-shadow: 0 4px 10px -4px rgba(0,0,0,0.25);
  transition: all .4s ease;

  span.value {
    font-weight: 800;
    font-size: .78rem;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: .4px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 18px -6px rgba(0,0,0,0.35);
    border-color: ${({ theme }) => theme.colors.primary}55;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const StatCard = styled(Card)`
  background: ${({ theme, color }) => theme.mode === 'dark'
    ? `linear-gradient(160deg, ${color || '#5461d6'} 0%, #2b3954 70%)`
    : `linear-gradient(145deg, ${color || theme.colors.primary} 0%, ${color || theme.colors.secondary} 100%)`};
  color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : 'white'};
  text-align: left;
  padding: 34px 30px 32px;
  position: relative;
  overflow: hidden;
  border: ${({ theme }) => theme.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.2)'};
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 14px 34px -10px rgba(0,0,0,0.55), 0 6px 16px -6px rgba(0,0,0,0.45)'
    : '0 10px 30px -8px rgba(0,0,0,0.25), 0 4px 12px -4px rgba(0,0,0,0.12)'};
  transition: all .5s cubic-bezier(.4,0,.2,1);
  cursor: default;

  &:hover {
    transform: translateY(-6px) scale(1.015);
    box-shadow: 0 18px 38px -10px rgba(0,0,0,0.35), 0 8px 18px -6px rgba(0,0,0,0.18);
  }

  &::before, &::after {
    content: '';
    position: absolute;
    width: 140%;
    height: 140%;
    top: -20%;
    left: -20%;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.10), transparent 75%)'
      : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 70%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.18), transparent 75%)'};
    opacity: .55;
    pointer-events: none;
    transform: translateZ(0);
  }
  &::after { filter: blur(20px); opacity:.35; }
`;

const StatIcon = styled.div`
  font-size: 2.1rem;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  display: inline-flex;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(4px) saturate(150%);
`;

const StatNumber = styled.div`
  font-size: 2.35rem;
  font-weight: 800;
  margin-bottom: 2px;
  position: relative;
  z-index: 1;
  letter-spacing: -1px;
`;

const StatLabel = styled.div`
  font-size: .82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .12em;
  opacity: .9;
  position: relative;
  z-index: 1;
`;

const DerivedNote = styled.div`
  font-size: .65rem;
  letter-spacing: .06em;
  font-weight: 500;
  opacity: .85;
  position: relative;
  z-index: 1;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ActionCard = styled(Card)`
  text-align: left;
  padding: 30px 26px 28px;
  cursor: pointer;
  transition: all 0.45s cubic-bezier(.4,0,.2,1);
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(226,232,240,0.9)'};
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(145deg,#2a354a 0%, #232d42 55%, #1e273a 100%)'
    : 'linear-gradient(130deg,#ffffff 0%,#f8fafc 55%,#f1f5f9 100%)'};

  &::before {
    content:'';
    position:absolute;
    inset:0;
    background: radial-gradient(circle at 30% 30%, rgba(102,126,234,0.15), transparent 65%);
    opacity:0;
    transition: opacity .5s;
  }

  &:hover {
    transform: translateY(-8px) scale(1.015);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 18px 34px -10px rgba(0,0,0,0.55), 0 6px 16px -6px rgba(0,0,0,0.45)'
      : '0 14px 26px -6px rgba(0,0,0,0.15), 0 6px 12px -4px rgba(0,0,0,0.08)'};
    border-color: ${({ theme }) => theme.colors.primary}55;
  }
  &:hover::before { opacity:1; }
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 10px;
  display: inline-flex;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(102,126,234,0.18) 0%, rgba(118,75,162,0.18) 100%);
`;

const ActionTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: ${({ theme }) => theme.colors.gray800};
  letter-spacing: .3px;
`;

const ActionDescription = styled.p`
  color: ${({ theme }) => theme.colors.gray600};
  margin: 0 0 16px;
  font-size: .74rem;
  line-height: 1.1rem;
`;

const ModalOverlay = styled(motion.div)`
  position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:flex-start; justify-content:center; padding:90px 20px 40px; z-index:1200; overflow-y:auto;
`;
const ModalCard = styled(motion.div)`
  background:${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(150deg,#253247 0%,#1d283a 65%,#172131 100%)' : 'linear-gradient(150deg,#ffffff 0%,#f8fafc 65%,#f1f5f9 100%)'};
  width:min(560px,100%); border-radius:28px; padding:48px 44px 42px; position:relative; box-shadow:0 18px 48px -12px rgba(0,0,0,0.55), 0 8px 28px -8px rgba(0,0,0,0.35); border:1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(226,232,240,0.85)'};
`;
const ModalTitle = styled.h2`margin:0 0 1.2rem; font-size:1.65rem; font-weight:800; letter-spacing:-.5px; background:linear-gradient(115deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 70%); -webkit-background-clip:text; color:${({ theme }) => theme.mode==='dark' ? 'transparent' : '#1d2940'}; text-shadow:${({ theme }) => theme.mode==='dark' ? '0 2px 6px rgba(0,0,0,0.45)' : '0 2px 4px rgba(0,0,0,0.18)'};`;
const FormGrid = styled.div`display:grid; gap:18px; margin:0 0 1.4rem;`;
const Field = styled.div`display:flex; flex-direction:column; gap:8px; label{font-size:.65rem; letter-spacing:.55px; font-weight:600; text-transform:uppercase; color:${({ theme }) => theme.colors.gray600};} input,textarea{padding:14px 16px; border-radius:16px; border:2px solid ${({ theme }) => theme.mode === 'dark' ? '#2f3b52' : '#e2e8f0'}; background:${({ theme }) => theme.mode === 'dark' ? '#1f2a3a' : '#ffffff'}; font:inherit; font-size:.85rem; color:${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray800}; transition:border .3s; &:focus{outline:none; border-color:${({ theme }) => theme.colors.primary};}}`; 
const ActionsRow = styled.div`display:flex; justify-content:flex-end; gap:14px;`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingStore, setCreatingStore] = useState(false);
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'', address:'' });
  const [storeForm, setStoreForm] = useState({ name:'', email:'', address:'', category:'', ownerEmail:'', imageBase64:'' });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Ensure browser back from dashboard (first entry) goes to /login
  useEffect(() => {
    if (window.history && location.key) {
      // Push a sentinel entry so that going back from dashboard sends to login
      const handler = (e) => {
        // If user tries to go back within first dashboard session, redirect login
        if (document.visibilityState !== 'hidden') {
          navigate('/login', { replace: true });
        }
      };
      window.history.pushState({ from: 'dashboard' }, '');
      window.addEventListener('popstate', handler);
      return () => window.removeEventListener('popstate', handler);
    }
  }, [navigate, location.key]);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: FiUsers,
      title: 'Add New User',
      description: 'Create a new user account for the platform',
      color: '#4299e1',
      action: () => setShowUserModal(true)
    },
    {
      icon: FiShoppingBag,
      title: 'Add New Store',
      description: 'Register a new store on the platform',
      color: '#48bb78',
  action: () => setShowStoreModal(true)
    },
    {
      icon: FiUsers,
      title: 'Manage Users',
      description: 'View and manage all registered users',
      color: '#ed8936',
  action: () => navigate('/admin/users')
    },
    {
      icon: FiShoppingBag,
      title: 'Manage Stores',
      description: 'View and manage all registered stores',
      color: '#9f7aea',
      action: () => navigate('/admin/stores')
    }
  ];

  const avgRatingsPerStore = stats?.totalStores ? (stats.totalRatings / stats.totalStores).toFixed(2) : '0.00';
  const userToStoreRatio = stats?.totalStores ? (stats.totalUsers / stats.totalStores).toFixed(1) : '0.0';
  const ratingsPerUser = stats?.totalUsers ? (stats.totalRatings / stats.totalUsers).toFixed(2) : '0.00';
  const systemHealth = 'Healthy';

  if (loading) {
    return (
      <DashboardContainer>
        <Navbar />
        <Content>
          <LoadingSpinner size="60px" />
        </Content>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Navbar />
      <Content>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Header>
            <Title>Administrator Control Center</Title>
            <Subtitle>High‑level insight and rapid actions to keep the platform healthy & growing.</Subtitle>
            <MetaBar>
              <InfoChip><span className="value">{userToStoreRatio}</span> Users / Store</InfoChip>
              <InfoChip><span className="value">{ratingsPerUser}</span> Ratings / User</InfoChip>
              <InfoChip><span className="value">{avgRatingsPerStore}</span> Ratings / Store</InfoChip>
              <InfoChip><span className="value">{systemHealth}</span> System</InfoChip>
            </MetaBar>
          </Header>

          <StatsGrid>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
              <StatCard color="#4299e1">
                <StatIcon><FiUsers /></StatIcon>
                <StatNumber>{stats?.totalUsers || 0}</StatNumber>
                <StatLabel>Total Users</StatLabel>
                <DerivedNote>Active growth trajectory</DerivedNote>
              </StatCard>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <StatCard color="#48bb78">
                <StatIcon><FiShoppingBag /></StatIcon>
                <StatNumber>{stats?.totalStores || 0}</StatNumber>
                <StatLabel>Total Stores</StatLabel>
                <DerivedNote>Distribution network</DerivedNote>
              </StatCard>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
              <StatCard color="#ed8936">
                <StatIcon><FiStar /></StatIcon>
                <StatNumber>{stats?.totalRatings || 0}</StatNumber>
                <StatLabel>Total Ratings</StatLabel>
                <DerivedNote>User engagement indicator</DerivedNote>
              </StatCard>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
              <StatCard color="#805ad5">
                <StatIcon><FiActivity /></StatIcon>
                <StatNumber>{avgRatingsPerStore}</StatNumber>
                <StatLabel>Avg Ratings / Store</StatLabel>
                <DerivedNote>Quality engagement metric</DerivedNote>
              </StatCard>
            </motion.div>
          </StatsGrid>

          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <h2 style={{ margin: '0 0 1.2rem', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '.5px', color: '#2d3748' }}>Quick Actions</h2>
            <QuickActions>
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25 + index * 0.08 }}
                >
                  <ActionCard onClick={action.action}>
                    <ActionIcon style={{ color: action.color }}>
                      <action.icon />
                    </ActionIcon>
                    <ActionTitle>{action.title}</ActionTitle>
                    <ActionDescription>{action.description}</ActionDescription>
                    <Button size="sm" style={{ fontWeight: 600 }}>
                      <FiPlus />
                      Get Started
                    </Button>
                  </ActionCard>
                </motion.div>
              ))}
            </QuickActions>
          </Card>
          {showUserModal && (
            <ModalOverlay initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={(e) => e.target === e.currentTarget && !creatingUser && setShowUserModal(false)}>
              <ModalCard initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:.45, ease:[.4,0,.2,1] }}>
                <ModalTitle>New User</ModalTitle>
                <FormGrid>
                  <Field>
                    <label>Name</label>
                    <input type="text" value={userForm.name} onChange={e => setUserForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe" />
                  </Field>
                  <Field>
                    <label>Email</label>
                    <input type="email" value={userForm.email} onChange={e => setUserForm(f=>({...f,email:e.target.value}))} placeholder="jane@example.com" />
                  </Field>
                  <Field>
                    <label>Password</label>
                    <input type="password" value={userForm.password} onChange={e => setUserForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" />
                  </Field>
                  <Field>
                    <label>Address</label>
                    <textarea rows="3" value={userForm.address} onChange={e => setUserForm(f=>({...f,address:e.target.value}))} placeholder="123 Main St, Springfield" />
                  </Field>
                </FormGrid>
                <ActionsRow>
                  <Button variant="secondary" disabled={creatingUser} onClick={() => setShowUserModal(false)}>Cancel</Button>
                  <Button disabled={creatingUser} onClick={async ()=>{
                    if(!userForm.name || !userForm.email || !userForm.password){ toast.error('Name, Email & Password required'); return; }
                    setCreatingUser(true);
                    try {
                      await adminAPI.createUser(userForm);
                      toast.success('User created');
                      setShowUserModal(false);
                      setUserForm({ name:'', email:'', password:'', address:'' });
                      fetchDashboardStats();
                    } catch(err){
                      console.error('[CreateUser] error response:', err.response?.data || err.message);
                      const validationErrors = err.response?.data?.errors;
                      if (Array.isArray(validationErrors) && validationErrors.length) {
                        // Collect unique messages (avoid duplicates like multiple password rules failing)
                        const msgs = [...new Set(validationErrors.map(e=>e.msg))];
                        // Show most relevant (password complexity usually first) or join if multiple
                        if (msgs.length === 1) {
                          toast.error(msgs[0]);
                        } else {
                          toast.error(msgs.join('\n'));
                        }
                      } else {
                        toast.error(err.response?.data?.message || 'Failed to create user');
                      }
                    } finally { setCreatingUser(false); }
                  }}>{creatingUser ? 'Saving...' : 'Create User'}</Button>
                </ActionsRow>
              </ModalCard>
            </ModalOverlay>
          )}
          {showStoreModal && (
            <ModalOverlay initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={(e) => e.target === e.currentTarget && !creatingStore && setShowStoreModal(false)}>
              <ModalCard initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:.45, ease:[.4,0,.2,1] }}>
                <ModalTitle>New Store</ModalTitle>
                <FormGrid>
                  <Field>
                    <label>Store Name</label>
                    <input type="text" value={storeForm.name} onChange={e => setStoreForm(f=>({...f,name:e.target.value}))} placeholder="Awesome Store" />
                  </Field>
                  <Field>
                    <label>Store Email</label>
                    <input type="email" value={storeForm.email} onChange={e => setStoreForm(f=>({...f,email:e.target.value}))} placeholder="store@example.com" />
                  </Field>
                  <Field>
                    <label>Address</label>
                    <textarea rows="2" value={storeForm.address} onChange={e => setStoreForm(f=>({...f,address:e.target.value}))} placeholder="456 Commerce Ave" />
                  </Field>
                  <Field>
                    <label>Category</label>
                    <input type="text" value={storeForm.category} onChange={e => setStoreForm(f=>({...f,category:e.target.value}))} placeholder="e.g. restaurant, electronics" />
                  </Field>
                  <Field>
                    <label>Owner Email (optional)</label>
                    <input type="email" value={storeForm.ownerEmail} onChange={e => setStoreForm(f=>({...f,ownerEmail:e.target.value}))} placeholder="owner@example.com" />
                  </Field>
                  <Field>
                    <label>Image (optional)</label>
                    <input type="file" accept="image/*" onChange={(e)=>{
                      const file = e.target.files?.[0];
                      if(!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => { setStoreForm(f=>({...f,imageBase64:ev.target.result})); setImagePreview(ev.target.result); };
                      reader.readAsDataURL(file);
                    }} />
                    {imagePreview && <img src={imagePreview} alt="preview" style={{ marginTop:8, width:'100%', maxHeight:180, objectFit:'cover', borderRadius:16, border:'1px solid #e2e8f0' }} />}
                  </Field>
                </FormGrid>
                <ActionsRow>
                  <Button variant="secondary" disabled={creatingStore} onClick={() => setShowStoreModal(false)}>Cancel</Button>
                  <Button disabled={creatingStore} onClick={async ()=>{
                    if(!storeForm.name || !storeForm.email || !storeForm.address){ toast.error('Name, Email & Address required'); return; }
                    setCreatingStore(true);
                    try {
                      await adminAPI.createStore(storeForm);
                      toast.success('Store created');
                      setShowStoreModal(false);
                      setStoreForm({ name:'', email:'', address:'', category:'', ownerEmail:'', imageBase64:'' });
                      setImagePreview('');
                      fetchDashboardStats();
                    } catch(err){
                      console.error(err);
                      toast.error(err.response?.data?.message || 'Failed to create store');
                    } finally { setCreatingStore(false); }
                  }}>{creatingStore ? 'Saving...' : 'Create Store'}</Button>
                </ActionsRow>
              </ModalCard>
            </ModalOverlay>
          )}
        </motion.div>
      </Content>
    </DashboardContainer>
  );
};

export default AdminDashboard;
