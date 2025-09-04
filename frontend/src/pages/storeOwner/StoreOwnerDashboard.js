import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiTrendingUp, FiPlus, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import { storeOwnerAPI } from '../../services/api';
import { Container, Card, LoadingSpinner, Table, TableHeader, TableRow, TableCell } from '../../styles/GlobalStyles';
import { formatDate } from '../../utils/helpers';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.gray100};
`;

const Content = styled(Container)`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray600};
  font-size: 1.125rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  background: linear-gradient(135deg, ${({ color, theme }) => color || theme.colors.primary} 0%, ${({ color, theme }) => color || theme.colors.secondary} 100%);
  color: white;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: rotate(45deg);
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const StatLabel = styled.div`
  font-size: 1.125rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;

const StoreInfoCard = styled(Card)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StoreName = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StoreRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: 1.5rem;
  font-weight: 600;
`;

const RatingsTable = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.gray600};
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled(Card)`
  height: fit-content;
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SidebarHeader = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StoreList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const StoreListItem = styled.li`
  background: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.gray100)};
  color: ${({ active, theme }) => (active ? '#fff' : theme.colors.text)};
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  &:hover { background: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.gray200)}; }
`;

const SmallButton = styled.button`
  background: ${({ theme, variant }) => (variant === 'ghost' ? theme.colors.gray200 : theme.colors.primary)};
  color: ${({ variant }) => (variant === 'ghost' ? '#222' : '#fff')};
  border: none;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  &:hover { filter: brightness(1.05); }
  &:active { transform: translateY(1px); }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  font-size: 0.9rem;
  &:focus { outline: 2px solid ${({ theme }) => theme.colors.primary}; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  font-size: 0.9rem;
  resize: vertical;
  min-height: 90px;
  &:focus { outline: 2px solid ${({ theme }) => theme.colors.primary}; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const CreateForm = styled.form`
  background: ${({ theme }) => theme.colors.gray50};
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: 10px;
  padding: 1rem;
  margin-top: 0.5rem;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
`;

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', category: '', phone: '', website: '', description: '', imageBase64: '' });
  const [activeStoreId, setActiveStoreId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handler = () => navigate('/login', { replace: true });
    window.history.pushState({ from: 'owner-dashboard' }, '');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [navigate, location.key]);

  const fetchDashboardData = async (storeId) => {
    try {
      const response = await storeOwnerAPI.getDashboard(storeId ? { storeId } : undefined);
      setDashboardData(response.data);
      if (response.data?.store) {
        setActiveStoreId(response.data.store.id);
      }
    } catch (error) {
      // If unauthorized or other, show error. 404 removed; treat others only.
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => setForm(prev => ({ ...prev, imageBase64: reader.result }));
      reader.readAsDataURL(file);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.warn('Name and email are required');
      return;
    }
    setCreating(true);
    try {
      await storeOwnerAPI.createStore(form);
      toast.success('Store created');
      setShowCreate(false);
      setForm({ name: '', email: '', address: '', category: '', phone: '', website: '', description: '', imageBase64: '' });
      // refresh dashboard
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setCreating(false);
    }
  };

  const changeActiveStore = (id) => {
    if (id === activeStoreId) return;
    setLoading(true);
    fetchDashboardData(id);
  };

  const noStore = dashboardData?.noStore || !dashboardData?.store;

  if (noStore) {
    return (
      <DashboardContainer>
        <Navbar />
        <Content>
          <Header>
            <Title>Store Owner Dashboard</Title>
            <Subtitle>Create your first store to start receiving ratings</Subtitle>
          </Header>
          <Card>
            {!showCreate && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <FiShoppingBag size={56} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '0.75rem' }}>No Stores Yet</h2>
                <p style={{ marginBottom: '1.25rem' }}>Create a store with details and an optional image.</p>
                <SmallButton onClick={() => setShowCreate(true)}><FiPlus /> Create Store</SmallButton>
              </div>
            )}
            {showCreate && (
              <CreateForm onSubmit={submitCreate}>
                <FormGroup>
                  <label>Name *</label>
                  <Input name="name" value={form.name} onChange={onChange} placeholder="Store Name" />
                </FormGroup>
                <FormGroup>
                  <label>Email *</label>
                  <Input name="email" type="email" value={form.email} onChange={onChange} placeholder="contact@store.com" />
                </FormGroup>
                <FormGroup>
                  <label>Address</label>
                  <Input name="address" value={form.address} onChange={onChange} placeholder="Full address" />
                </FormGroup>
                <FormGroup>
                  <label>Category</label>
                  <Input name="category" value={form.category} onChange={onChange} placeholder="e.g. restaurant" />
                </FormGroup>
                <FormGroup>
                  <label>Phone</label>
                  <Input name="phone" value={form.phone} onChange={onChange} placeholder="(555) 123-4567" />
                </FormGroup>
                <FormGroup>
                  <label>Website</label>
                  <Input name="website" value={form.website} onChange={onChange} placeholder="https://" />
                </FormGroup>
                <FormGroup>
                  <label>Description</label>
                  <TextArea name="description" value={form.description} onChange={onChange} placeholder="Brief description" />
                </FormGroup>
                <FormGroup>
                  <label>Image</label>
                  <Input name="image" type="file" accept="image/*" onChange={onChange} />
                  {form.imageBase64 && <ImagePreview src={form.imageBase64} alt="preview" />}
                </FormGroup>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <SmallButton type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Store'}</SmallButton>
                  <SmallButton type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</SmallButton>
                </div>
              </CreateForm>
            )}
          </Card>
        </Content>
      </DashboardContainer>
    );
  }

  const { store, ratings } = dashboardData;
  const totalRatings = ratings.length;
  const averageRating = parseFloat(store.average_rating);

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
            <Title>Store Owner Dashboard</Title>
            <Subtitle>Monitor your store's performance and customer feedback</Subtitle>
          </Header>
          <Layout>
            <Sidebar>
              <SidebarHeader><FiShoppingBag /> Your Stores</SidebarHeader>
              <SmallButton style={{ width: '100%' }} onClick={() => setShowCreate(s => !s)}>
                <FiPlus /> {showCreate ? 'Close Form' : 'New Store'}
              </SmallButton>
              <SmallButton style={{ width: '100%' }} variant="ghost" onClick={() => fetchDashboardData(activeStoreId)}>
                <FiRefreshCw /> Refresh
              </SmallButton>
              {showCreate && (
                <CreateForm onSubmit={submitCreate} style={{ marginTop: '0.5rem' }}>
                  <FormGroup>
                    <label style={{ fontSize: '0.75rem' }}>Name *</label>
                    <Input name="name" value={form.name} onChange={onChange} />
                  </FormGroup>
                  <FormGroup>
                    <label style={{ fontSize: '0.75rem' }}>Email *</label>
                    <Input name="email" type="email" value={form.email} onChange={onChange} />
                  </FormGroup>
                  <FormGroup>
                    <label style={{ fontSize: '0.75rem' }}>Category</label>
                    <Input name="category" value={form.category} onChange={onChange} />
                  </FormGroup>
                  <FormGroup>
                    <label style={{ fontSize: '0.75rem' }}>Image</label>
                    <Input name="image" type="file" accept="image/*" onChange={onChange} />
                    {form.imageBase64 && <ImagePreview src={form.imageBase64} alt="preview" />}
                  </FormGroup>
                  <SmallButton type="submit" disabled={creating}>{creating ? '...' : 'Create'}</SmallButton>
                </CreateForm>
              )}
              <StoreList>
                {dashboardData.stores?.map(s => (
                  <StoreListItem key={s.id} active={s.id === activeStoreId} onClick={() => changeActiveStore(s.id)}>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                    {s.id === activeStoreId && <FiStar size={14} />}
                  </StoreListItem>
                ))}
              </StoreList>
            </Sidebar>
            <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StoreInfoCard>
              <StoreName>{store.name}</StoreName>
              <StoreRating>
                <span>Average Rating:</span>
                <StarRating rating={averageRating} size="1.5rem" />
                <span>({averageRating.toFixed(1)})</span>
              </StoreRating>
            </StoreInfoCard>
          </motion.div>

          <StatsGrid>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StatCard color="#4299e1">
                <StatIcon>
                  <FiStar />
                </StatIcon>
                <StatNumber>{averageRating.toFixed(1)}</StatNumber>
                <StatLabel>Average Rating</StatLabel>
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StatCard color="#48bb78">
                <StatIcon>
                  <FiUsers />
                </StatIcon>
                <StatNumber>{totalRatings}</StatNumber>
                <StatLabel>Total Ratings</StatLabel>
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StatCard color="#ed8936">
                <StatIcon>
                  <FiTrendingUp />
                </StatIcon>
                <StatNumber>
                  {totalRatings > 0 ? Math.round((ratings.filter(r => r.rating >= 4).length / totalRatings) * 100) : 0}%
                </StatNumber>
                <StatLabel>Positive Ratings</StatLabel>
              </StatCard>
            </motion.div>
          </StatsGrid>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                Customer Ratings & Reviews
              </h2>
              
              {ratings.length === 0 ? (
                <EmptyState>
                  <FiStar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3>No ratings yet</h3>
                  <p>Your store hasn't received any ratings yet. Encourage customers to rate your store!</p>
                </EmptyState>
              ) : (
                <RatingsTable>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Customer Name</TableHeader>
                        <TableHeader>Email</TableHeader>
                        <TableHeader>Rating</TableHeader>
                        <TableHeader>Date</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings.map((rating, index) => (
                        <motion.tr
                          key={rating.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                        >
                          <TableRow>
                            <TableCell>{rating.name}</TableCell>
                            <TableCell>{rating.email}</TableCell>
                            <TableCell>
                              <StarRating rating={rating.rating} size="1rem" />
                            </TableCell>
                            <TableCell>{formatDate(rating.created_at)}</TableCell>
                          </TableRow>
                        </motion.tr>
                      ))}
                    </tbody>
                  </Table>
                </RatingsTable>
              )}
            </Card>
          </motion.div>
            </div>
          </Layout>
        </motion.div>
      </Content>
    </DashboardContainer>
  );
};

export default StoreOwnerDashboard;
