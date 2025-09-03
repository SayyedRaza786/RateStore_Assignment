import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiStar, FiTrendingUp, FiAward, FiActivity, FiSearch, FiMapPin, FiPlus } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, FormGroup, LoadingSpinner, Container } from '../../styles/GlobalStyles';
import { toast } from 'react-toastify';
import { storeAPI, ratingAPI } from '../../services/api';

// Layout styling adapted from AdminDashboard for visual parity
const DashboardWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(circle at 22% 24%, #212a3d 0%, #1b2335 38%, #151d2c 65%, #101724 85%)'
    : 'radial-gradient(circle at 20% 20%, #f0f4ff 0%, #eef3ff 30%, #e9effe 50%, #e3ecff 70%, #dae6ff 100%)'};
  position: relative;
  overflow-x: hidden;
  &::before, &::after { content:''; position:absolute; width:780px; height:780px; border-radius:50%; pointer-events:none; z-index:0; filter:blur(60px) saturate(140%); background: ${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(circle at 30% 30%, rgba(102,126,234,0.12), transparent 70%), radial-gradient(circle at 70% 70%, rgba(118,75,162,0.10), transparent 75%)'
    : 'radial-gradient(circle at 30% 30%, rgba(102,126,234,0.28), transparent 70%), radial-gradient(circle at 70% 70%, rgba(118,75,162,0.22), transparent 75%)'}; }
  &::before { top:-320px; left:-320px; }
  &::after { bottom:-360px; right:-360px; }
`;

const Content = styled(Container)`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md} 110px;
  position: relative;
  z-index:1;
`;

const Header = styled.div`
  text-align:center; margin-bottom:${({ theme }) => theme.spacing.xl}; position:relative; z-index:1;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 4vw, 2.9rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -1px;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(115deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 45%, #805ad5 85%);
  -webkit-background-clip: text; background-clip:text; -webkit-text-fill-color:transparent; position:relative;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray600};
  font-size: 1.02rem; max-width: 760px; margin:0 auto;
`;

const MetaBar = styled.div`
  display:flex; flex-wrap:wrap; justify-content:center; gap:14px; margin-top:24px; margin-bottom:6px;
`;

const InfoChip = styled.div`
  display:flex; align-items:center; gap:10px; padding:10px 16px 11px; border-radius:14px; font-size:.7rem; font-weight:600; letter-spacing:.55px;
  background:${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(140deg, rgba(102,126,234,0.18) 0%, rgba(118,75,162,0.18) 100%)'
    : 'linear-gradient(140deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.12) 100%)'};
  color:${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray700};
  border:1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(102,126,234,0.25)'};
  backdrop-filter: blur(6px) saturate(160%);
  box-shadow:0 4px 10px -4px rgba(0,0,0,0.25);
  span.value { font-weight:800; font-size:.78rem; background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%); -webkit-background-clip:text; color:transparent; }
`;

const StatsGrid = styled.div`
  display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:${({ theme }) => theme.spacing.lg}; margin-bottom:${({ theme }) => theme.spacing.lg}; position:relative; z-index:1;
`;

const StatCard = styled(Card)`
  background: ${({ theme, color }) => theme.mode === 'dark'
    ? `linear-gradient(160deg, ${color || '#5461d6'} 0%, #2b3954 70%)`
    : `linear-gradient(145deg, ${color || theme.colors.primary} 0%, ${color || theme.colors.secondary} 100%)`};
  color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : 'white'};
  text-align:left; padding:34px 30px 32px; position:relative; overflow:hidden;
  border: ${({ theme }) => theme.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.2)'};
  box-shadow:${({ theme }) => theme.mode === 'dark'
    ? '0 14px 34px -10px rgba(0,0,0,0.55), 0 6px 16px -6px rgba(0,0,0,0.45)'
    : '0 10px 30px -8px rgba(0,0,0,0.25), 0 4px 12px -4px rgba(0,0,0,0.12)'};
  transition:all .5s cubic-bezier(.4,0,.2,1); cursor:default;
  &:hover { transform:translateY(-6px) scale(1.015); box-shadow:0 18px 38px -10px rgba(0,0,0,0.35), 0 8px 18px -6px rgba(0,0,0,0.18); }
  &::before,&::after{content:'';position:absolute;width:140%;height:140%;top:-20%;left:-20%;background:${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.10), transparent 75%)'
    : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 70%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.18), transparent 75%)'}; opacity:.55; pointer-events:none;}
  &::after{filter:blur(20px); opacity:.35;}
`;

const StatIcon = styled.div`
  font-size:2.1rem; margin-bottom:10px; display:inline-flex; padding:14px; border-radius:18px; background:rgba(255,255,255,0.18); backdrop-filter:blur(4px) saturate(150%);
`;

const StatNumber = styled.div`
  font-size:2.35rem; font-weight:800; margin-bottom:2px; letter-spacing:-1px;
`;
const StatLabel = styled.div`
  font-size:.8rem; font-weight:600; text-transform:uppercase; letter-spacing:.12em; opacity:.9;
`;
const DerivedNote = styled.div`
  font-size:.6rem; letter-spacing:.05em; font-weight:500; opacity:.8;
`;

// Store exploration section styled to harmonize with admin quick actions
const StoresSection = styled(Card)`
  margin-top:${({ theme }) => theme.spacing.lg}; padding:42px 40px 44px; position:relative; overflow:hidden;
`;
const StoresHeader = styled.div`
  display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:18px; margin:0 0 1.8rem;
  h2 { margin:0; font-size:1.55rem; font-weight:700; letter-spacing:.5px; background:linear-gradient(120deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 80%); -webkit-background-clip:text; color:transparent; }
  p { margin:0; font-size:.7rem; letter-spacing:.55px; font-weight:600; color:${({ theme }) => theme.colors.gray600}; }
`;
const StoreSearchBar = styled.div`
  width:100%; max-width:420px; display:flex; gap:10px; align-items:center;
`;

const StoreGrid = styled.div`
  display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:26px;
`;
const StoreCard = styled(motion.div)`
  background:${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(150deg,#31445e 0%,#2a3a52 60%, #233146 100%)'
    : 'linear-gradient(150deg,#ffffff 0%, #ffffff 60%, #f5f8fa 100%)'};
  border:1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.6)'};
  padding:26px 24px 24px; border-radius:24px; display:flex; flex-direction:column; gap:14px; position:relative; overflow:hidden;
  box-shadow:${({ theme }) => theme.mode === 'dark' ? '0 10px 22px -10px rgba(0,0,0,0.32), 0 4px 10px -6px rgba(0,0,0,0.18)' : '0 4px 10px -6px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.05)'};
  transition:all .55s cubic-bezier(.4,0,.2,1); cursor:default;
  &:hover { transform:translateY(-8px); box-shadow:0 22px 40px -18px rgba(0,0,0,0.45), 0 10px 22px -10px rgba(0,0,0,0.30); }
  h3 { margin:0 0 2px; font-size:1.05rem; font-weight:700; letter-spacing:.4px; color:${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray800}; }
  .meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .badge { font-size:.55rem; letter-spacing:.55px; font-weight:700; text-transform:uppercase; padding:6px 10px; border-radius:12px; background:${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}; color:${({ theme }) => theme.mode === 'dark' ? theme.colors.gray600 : '#64748b'}; }
  .ratingBadge { display:flex; align-items:center; gap:6px; font-size:.7rem; font-weight:700; padding:8px 12px; border-radius:14px; background:linear-gradient(135deg,#f6ad55 0%, #fbbf24 100%); color:#693200; letter-spacing:.5px; box-shadow:0 4px 12px -4px rgba(0,0,0,0.25); }
  p { margin:4px 0; font-size:.68rem; line-height:1rem; color:${({ theme }) => theme.mode === 'dark' ? theme.colors.gray600 : '#5a6675'}; display:flex; align-items:center; gap:6px; }
  .user-rating { font-size:.6rem; letter-spacing:.5px; font-weight:600; padding:6px 8px; border-radius:10px; background:${({ theme }) => theme.mode === 'dark' ? 'rgba(252,211,77,0.15)' : 'rgba(251,191,36,0.18)'}; color:${({ theme }) => theme.mode === 'dark' ? '#fcd34d' : '#b7791f'}; display:inline-flex; gap:4px; align-items:center; }
  .actions { display:flex; gap:10px; margin-top:4px; }
  .thumbBox { width:120px; height:90px; border-radius:16px; overflow:hidden; flex-shrink:0; position:relative; background:#0f172a; box-shadow:0 4px 14px -6px rgba(0,0,0,0.4); }
  .thumbBox img { width:100%; height:100%; object-fit:cover; display:block; filter:brightness(${({ theme }) => theme.mode === 'dark' ? '0.9' : '0.97'}); transition:transform .55s ease; }
  &:hover .thumbBox img { transform:scale(1.08); }
`;

const RatingModal = styled(motion.div)`
  position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:1000;
  .modal-content { background:${({ theme }) => theme.mode === 'dark' ? 'linear-gradient(145deg,#253247 0%,#1d283a 65%,#172131 100%)' : 'linear-gradient(145deg,#ffffff 0%,#f8fafc 65%,#f1f5f9 100%)'}; padding:38px 36px 34px; border-radius:26px; width:min(520px,90%); max-height:90vh; overflow-y:auto; box-shadow:0 14px 44px -10px rgba(0,0,0,0.45), 0 6px 18px -6px rgba(0,0,0,0.28); border:1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.85)'}; }
  h2 { margin:0 0 .9rem; font-size:1.5rem; letter-spacing:-.5px; font-weight:700; background:linear-gradient(120deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 80%); -webkit-background-clip:text; color:transparent; }
  label { font-size:.7rem; letter-spacing:.55px; font-weight:600; text-transform:uppercase; color:${({ theme }) => theme.colors.gray600}; }
  textarea { background:${({ theme }) => theme.mode === 'dark' ? '#1f2a3a' : '#ffffff'}; color:${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray800}; border:2px solid ${({ theme }) => theme.mode === 'dark' ? '#2f3b52' : '#e2e8f0'}; }
`;
const StarRating = styled.div`
  display:flex; gap:6px; margin:10px 0 8px; .star { font-size:2.2rem; cursor:pointer; color:${({ theme }) => theme.mode === 'dark' ? '#2f3b52' : theme.colors.gray300}; transition:color .25s ease, transform .25s ease; } .star.active{ color:${({ theme }) => theme.colors.warning}; } .star:hover{ color:${({ theme }) => theme.colors.warning}; transform:translateY(-4px) scale(1.04); }
`;

const EmptyState = styled.div`
  border:1px dashed rgba(148,163,184,0.45); padding:70px 40px; border-radius:28px; text-align:center; background:rgba(255,255,255,0.4); backdrop-filter:blur(6px) saturate(160%); font-size:.9rem; color:#475569;
`;

const UserDashboard = () => {
  // Auth context retained for potential future personalization (name greeting removed in new design)
  useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stores, setStores] = useState([]);
  const [userStats, setUserStats] = useState({ totalRatings:0, averageRating:0, favoriteStore:null });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const favoriteStoreName = React.useMemo(() => {
    const fs = userStats.favoriteStore; if (fs && typeof fs === 'object') return fs.name || 'Unknown'; return fs || null;
  }, [userStats.favoriteStore]);

  useEffect(() => { fetchUserStats(); }, []);
  useEffect(() => {
    const handler = () => navigate('/login', { replace: true });
    window.history.pushState({ from: 'user-dashboard' }, '');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [navigate, location.key]);
  useEffect(() => { const id = setTimeout(() => fetchStores(searchTerm), 300); return () => clearTimeout(id); }, [searchTerm]);

  const fetchStores = async (term='') => {
    try { const params = term ? { name: term, address: term } : undefined; const res = await storeAPI.getAll(params); setStores(res.data); }
    catch (e) { console.error(e); toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  };
  const fetchUserStats = async () => { try { const res = await ratingAPI.getUserStats(); setUserStats(res.data); } catch(e){ console.error(e); } };
  const handleRateStore = (store) => { setSelectedStore(store); setRating(store.userRating || 0); setComment(store.userComment || ''); setShowRatingModal(true); };
  const submitRating = async () => {
    if (!rating) { toast.error('Select a rating'); return; }
    try { await ratingAPI.create({ storeId: selectedStore.id, rating, comment }); toast.success('Rating saved'); setShowRatingModal(false); fetchStores(searchTerm); fetchUserStats(); }
    catch(e){ console.error(e); toast.error(e.response?.data?.message || 'Failed to submit'); }
  };

  const ratedCount = stores.filter(s => s.userRating).length;
  const coverage = stores.length ? ((ratedCount / stores.length) * 100).toFixed(0) : '0';
  const avgGiven = Number.isFinite(Number(userStats.averageRating)) && Number(userStats.averageRating) > 0 ? Number(userStats.averageRating).toFixed(1) : '0.0';
  const favoriteText = favoriteStoreName || 'None';

  if (loading) {
    return (
      <DashboardWrapper>
        <Navbar />
        <Content>
          <LoadingSpinner size="60px" />
        </Content>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <Navbar />
      <Content>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6 }}>
          <Header>
            <Title>Explorer Dashboard</Title>
            <Subtitle>Your personalized hub to discover stores & track your rating journey.</Subtitle>
            <MetaBar>
              <InfoChip><span className="value">{coverage}%</span> Coverage</InfoChip>
              <InfoChip><span className="value">{avgGiven}</span> Avg Given</InfoChip>
              <InfoChip><span className="value">{ratedCount}</span> Rated</InfoChip>
              <InfoChip><span className="value">{favoriteText}</span> Favorite</InfoChip>
            </MetaBar>
          </Header>

          <StatsGrid>
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.05 }}>
              <StatCard color="#f6ad55">
                <StatIcon><FiStar /></StatIcon>
                <StatNumber>{userStats.totalRatings}</StatNumber>
                <StatLabel>Total Ratings</StatLabel>
                <DerivedNote>Your total contributions</DerivedNote>
              </StatCard>
            </motion.div>
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.15 }}>
              <StatCard color="#48bb78">
                <StatIcon><FiActivity /></StatIcon>
                <StatNumber>{coverage}%</StatNumber>
                <StatLabel>Coverage</StatLabel>
                <DerivedNote>Rated {ratedCount}/{stores.length}</DerivedNote>
              </StatCard>
            </motion.div>
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.25 }}>
              <StatCard color="#ed8936">
                <StatIcon><FiTrendingUp /></StatIcon>
                <StatNumber>{avgGiven}</StatNumber>
                <StatLabel>Avg Given</StatLabel>
                <DerivedNote>Across all stores</DerivedNote>
              </StatCard>
            </motion.div>
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.35 }}>
              <StatCard color="#805ad5">
                <StatIcon><FiAward /></StatIcon>
                <StatNumber style={{ fontSize:'1.4rem' }}>{favoriteText}</StatNumber>
                <StatLabel>Favorite</StatLabel>
                <DerivedNote>Your top store</DerivedNote>
              </StatCard>
            </motion.div>
          </StatsGrid>

          <StoresSection>
            <StoresHeader>
              <div>
                <h2><FiSearch /> Explore Stores</h2>
                <p>Browse and rate – your feedback shapes the platform.</p>
              </div>
              <StoreSearchBar>
                <Input placeholder="Search stores by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Button size="sm" onClick={() => fetchStores(searchTerm)} style={{ fontWeight:600 }}>
                  <FiPlus /> Refresh
                </Button>
              </StoreSearchBar>
            </StoresHeader>

            {stores.length === 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <EmptyState>{searchTerm ? 'No stores found for your search.' : 'No stores available yet.'}</EmptyState>
              </motion.div>
            )}

            <StoreGrid>
              {stores.map((store, idx) => {
                const avg = Number.isFinite(Number(store.averageRating)) && Number(store.averageRating) > 0 ? Number(store.averageRating).toFixed(1) : '—';
                const placeholderImages = {
                  restaurant: 'https://placehold.co/200x150?text=Restaurant',
                  electronics: 'https://placehold.co/200x150?text=Electronics',
                  clothing: 'https://placehold.co/200x150?text=Clothing',
                  grocery: 'https://placehold.co/200x150?text=Grocery',
                  cafe: 'https://placehold.co/200x150?text=Cafe',
                  bookstore: 'https://placehold.co/200x150?text=Bookstore',
                  default: 'https://placehold.co/200x150?text=Store'
                };
                const img = store.image_url || placeholderImages[store.category] || placeholderImages.default;
                return (
                  <StoreCard key={store.id} initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45, delay: idx * 0.04 }}>
                    <div style={{ display:'flex', gap:18 }}>
                      <div className="thumbBox"><img src={img} alt={store.name} /></div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ marginTop:2 }}>{store.name}</h3>
                        <div className="meta" style={{ margin:'4px 0 6px' }}>
                          <span className="badge">{store.category || 'General'}</span>
                          <div className="ratingBadge"><FiStar /> {avg}</div>
                        </div>
                        <p style={{ margin:0 }}><FiMapPin /> {store.address}</p>
                        <p style={{ margin:'4px 0 6px' }}>Total Ratings: {store.totalRatings || 0}</p>
                        {store.userRating ? (
                          <span className="user-rating"><FiStar style={{ color:'#fbbf24' }} /> Your: {store.userRating}</span>
                        ) : (
                          <span className="user-rating" style={{ background:'rgba(102,126,234,0.18)', color:'#4c51bf' }}>Not rated</span>
                        )}
                        <div className="actions" style={{ marginTop:12 }}>
                          <Button size="sm" onClick={() => handleRateStore(store)} style={{ fontWeight:600 }}>
                            <FiStar /> {store.userRating ? 'Edit Rating' : 'Rate Store'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </StoreCard>
                );
              })}
            </StoreGrid>
          </StoresSection>
        </motion.div>
      </Content>

      {showRatingModal && (
        <RatingModal initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={(e) => e.target === e.currentTarget && setShowRatingModal(false)}>
          <div className="modal-content">
            <h2>Rate {selectedStore?.name}</h2>
            <FormGroup>
              <label>Your Rating</label>
              <StarRating>
                {[1,2,3,4,5].map(star => (
                  <FiStar key={star} className={`star ${star <= rating ? 'active' : ''}`} onClick={() => setRating(star)} />
                ))}
              </StarRating>
            </FormGroup>
            <FormGroup>
              <label>Comment (Optional)</label>
              <textarea rows="4" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ width:'100%', padding:'12px', border:'2px solid #e2e8f0', borderRadius:'8px', fontSize:'1rem', fontFamily:'inherit', resize:'vertical' }} />
            </FormGroup>
            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowRatingModal(false)}>Cancel</Button>
              <Button onClick={submitRating}>{selectedStore?.userRating ? 'Update Rating' : 'Submit Rating'}</Button>
            </div>
          </div>
        </RatingModal>
      )}
    </DashboardWrapper>
  );
};

export default UserDashboard;
