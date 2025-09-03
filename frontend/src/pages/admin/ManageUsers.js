import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FiSearch, FiFilter, FiUser, FiStar, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Page = styled.div``;
const Content = styled.div`
  max-width: 1250px; 
  margin: 34px auto 0; 
  padding: 46px 46px 100px; 
  background: ${({theme}) => theme.mode==='dark' 
    ? 'linear-gradient(140deg,#202a3a 0%,#1a2433 65%,#161e2c 100%)' 
    : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 55%, rgba(248,250,252,0.90) 100%)'};
  border-radius: 44px; 
  box-shadow: ${({theme}) => theme.mode==='dark'
    ? '0 18px 46px -12px rgba(0,0,0,0.65), 0 8px 28px -10px rgba(0,0,0,0.55)'
    : '0 28px 60px -22px rgba(31,41,55,0.18), 0 14px 32px -14px rgba(31,41,55,0.12)'};
  border: 1px solid ${({theme}) => theme.mode==='dark' ? 'rgba(255,255,255,0.07)' : 'rgba(226,232,240,0.9)'};
  backdrop-filter: blur(14px) saturate(180%);
`;
const Header = styled.div`display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:24px; margin-bottom:32px;`;
const TitleBlock = styled.div``;
const Title = styled.h1`margin:0 0 6px; font-size:2rem; font-weight:800; letter-spacing:-1px; background:linear-gradient(120deg, ${({theme})=>theme.colors.primary} 0%, ${({theme})=>theme.colors.secondary}); -webkit-background-clip:text; color:${({theme})=> theme.mode==='dark' ? 'transparent' : '#1b2540'}; text-shadow:${({theme})=> theme.mode==='dark' ? '0 2px 6px rgba(0,0,0,0.45)' : '0 2px 4px rgba(0,0,0,0.15)'};`;
const Subtitle = styled.p`
  margin:0; 
  color:${({theme})=> theme.mode==='dark' ? theme.colors.gray600 : '#253045'}; 
  font-size:.92rem; 
  font-weight:600; 
  letter-spacing:.25px; 
  line-height:1.25rem; 
  text-shadow:${({theme})=> theme.mode==='dark' ? '0 2px 6px rgba(0,0,0,0.55)' : '0 1px 2px rgba(0,0,0,0.15)'};
`;
const BackBtn = styled.button`
  display:inline-flex; align-items:center; gap:8px; 
  background:${({theme})=> theme.mode==='dark' ? 'linear-gradient(135deg,#253344,#1d2735)' : 'linear-gradient(135deg,#ffffff 0%,#f1f5f9 100%)'}; 
  border:1px solid ${({theme})=> theme.mode==='dark' ? '#2a3a4f' : '#d3dbe5'}; 
  color:${({theme})=> theme.mode==='dark' ? theme.colors.gray600 : '#1e293b'}; 
  padding:11px 18px 10px; border-radius:18px; cursor:pointer; 
  font-weight:700; font-size:.68rem; letter-spacing:.65px; text-transform:uppercase; 
  transition: .28s cubic-bezier(.4,0,.2,1); 
  position:relative; overflow:hidden; 
  box-shadow:${({theme})=> theme.mode==='dark' ? '0 4px 14px -4px rgba(0,0,0,0.55)' : '0 6px 16px -6px rgba(31,41,55,0.18)'};
  &:before { content:''; position:absolute; inset:0; background:linear-gradient(120deg,rgba(255,255,255,0.5),rgba(255,255,255,0)); opacity:0; transition:.5s; }
  &:hover { transform:translateY(-2px); color:${({theme})=> theme.mode==='dark' ? theme.colors.gray700 : '#132032'}; border-color:${({theme})=> theme.mode==='dark' ? '#34506d' : '#c3ceda'}; box-shadow:${({theme})=> theme.mode==='dark' ? '0 10px 22px -10px rgba(0,0,0,0.65)' : '0 12px 28px -10px rgba(31,41,55,0.25)'}; }
  &:hover:before { opacity:.55; }
  &:active { transform:translateY(0); }
`;

const FiltersBar = styled.div`display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin-bottom:26px;`;
const Input = styled.input`padding:12px 14px 12px 40px; border-radius:16px; border:2px solid ${({theme})=>theme.mode==='dark' ? '#2f3b52' : '#e2e8f0'}; background:${({theme})=>theme.mode==='dark' ? '#1f2a3a' : '#fff'}; font-size:.85rem; min-width:220px; position:relative; color:${({theme})=>theme.mode==='dark'?theme.colors.gray900:theme.colors.gray800}; &:focus{outline:none; border-color:${({theme})=>theme.colors.primary};}`;
const FieldWrap = styled.div`position:relative; svg{position:absolute; top:50%; left:14px; transform:translateY(-50%); color:${({theme})=>theme.colors.gray500};}`;
const Select = styled.select`padding:12px 14px; border-radius:16px; border:2px solid ${({theme})=>theme.mode==='dark' ? '#2f3b52' : '#e2e8f0'}; background:${({theme})=>theme.mode==='dark' ? '#1f2a3a' : '#fff'}; font-size:.8rem; min-width:170px; font-weight:600; letter-spacing:.4px; color:${({theme})=>theme.colors.gray700}; &:focus{outline:none; border-color:${({theme})=>theme.colors.primary};}`;

const CardGrid = styled.div`display:grid; gap:18px; grid-template-columns:repeat(auto-fill, minmax(290px,1fr));`;
const UserCard = styled(motion.div)`background:${({theme})=>theme.mode==='dark' ? 'linear-gradient(145deg,#243246,#1d293a)' : 'linear-gradient(145deg,#ffffff,#f1f5f9)'}; border:1px solid ${({theme})=>theme.mode==='dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}; padding:22px 20px 20px; border-radius:24px; position:relative; overflow:hidden; display:flex; flex-direction:column; gap:10px; box-shadow:0 8px 20px -6px rgba(0,0,0,.25), 0 4px 12px -4px rgba(0,0,0,.18);`;
const RoleBadge = styled.span`display:inline-flex; align-items:center; gap:6px; background:${({theme})=>theme.colors.primary}; color:#fff; font-size:.6rem; padding:6px 10px 5px; border-radius:40px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; box-shadow:0 4px 10px -3px rgba(0,0,0,.4);`;
const Name = styled.h3`margin:0; font-size:1.05rem; font-weight:700; letter-spacing:.4px; color:${({theme})=>theme.mode==='dark' ? '#fff' : '#1f2d3d'};`;
const FieldLine = styled.div`font-size:.68rem; letter-spacing:.35px; font-weight:600; text-transform:uppercase; color:${({theme})=>theme.colors.gray500}; display:flex; justify-content:space-between; gap:10px;`;
const Value = styled.div`font-size:.75rem; font-weight:600; color:${({theme})=>theme.mode==='dark' ? theme.colors.gray300 : theme.colors.gray700}; word-break:break-word; line-height:1.05rem;`;
const RatingPill = styled.div`display:inline-flex; align-items:center; gap:6px; background:${({theme})=>theme.mode==='dark' ? '#314862' : '#edf2f7'}; padding:6px 10px 6px; border-radius:14px; font-size:.65rem; font-weight:700; color:${({theme})=>theme.colors.gray700};`; 
const GroupSection = styled.div`margin-bottom:44px;`; 
const GroupTitle = styled.h2`margin:0 0 14px; font-size:1.15rem; font-weight:800; letter-spacing:.5px; color:${({theme})=>theme.mode==='dark' ? '#fff' : '#2d3748'};`; 
const Empty = styled.div`padding:50px 20px; text-align:center; opacity:.6; font-size:.85rem;`; 

const ManageUsers = () => {
  const [users,setUsers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [filters,setFilters] = useState({ name:'', email:'', address:'', role:'all' });
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if(filters.name) params.name = filters.name;
      if(filters.email) params.email = filters.email;
      if(filters.address) params.address = filters.address;
      if(filters.role !== 'all') params.role = filters.role;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users || data); // support previous shape
    } catch (e) {
      toast.error('Failed to load users');
    } finally { setLoading(false); }
  }, [filters.name, filters.email, filters.address, filters.role]);

  useEffect(()=>{ fetchUsers(); }, [fetchUsers]);

  const filtered = useMemo(()=>{
    return users.filter(u => (
      (!filters.name || u.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.email || u.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.address || (u.address||'').toLowerCase().includes(filters.address.toLowerCase())) &&
      (filters.role==='all' || u.role === filters.role)
    ));
  }, [users, filters]);

  const grouped = useMemo(()=>{
    const groups = { admin: [], store_owner: [], user: [] };
    filtered.forEach(u=>{ if(!groups[u.role]) groups[u.role]=[]; groups[u.role].push(u); });
    return groups;
  }, [filtered]);

  const roleOrder = ['admin','store_owner','user'];

  return (
    <Page>
      <Navbar />
      <Content>
        <Header>
          <TitleBlock>
            <Title>Manage Users</Title>
            <Subtitle>Filter, inspect and categorize every platform account.</Subtitle>
          </TitleBlock>
          <BackBtn onClick={()=>navigate('/admin')}><FiArrowLeft /> Back</BackBtn>
        </Header>
        <FiltersBar>
          <FieldWrap>
            <FiSearch size={16} />
            <Input placeholder="Filter by name" value={filters.name} onChange={e=>setFilters(f=>({...f,name:e.target.value}))} />
          </FieldWrap>
          <FieldWrap>
            <FiSearch size={16} />
            <Input placeholder="Filter by email" value={filters.email} onChange={e=>setFilters(f=>({...f,email:e.target.value}))} />
          </FieldWrap>
          <FieldWrap>
            <FiSearch size={16} />
            <Input placeholder="Filter by address" value={filters.address} onChange={e=>setFilters(f=>({...f,address:e.target.value}))} />
          </FieldWrap>
          <Select value={filters.role} onChange={e=>setFilters(f=>({...f,role:e.target.value}))}>
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="store_owner">Store Owners</option>
            <option value="user">Users</option>
          </Select>
          <BackBtn style={{fontWeight:700}} onClick={fetchUsers}><FiFilter /> Refresh</BackBtn>
        </FiltersBar>
        {loading ? <Empty>Loading users...</Empty> : (
          roleOrder.map(role => (
            <GroupSection key={role}>
              <GroupTitle>{role === 'store_owner' ? 'Store Owners' : role === 'admin' ? 'Administrators' : 'Users'} ({grouped[role]?.length || 0})</GroupTitle>
              {grouped[role] && grouped[role].length ? (
                <CardGrid>
                  {grouped[role].map(u => (
                    <UserCard key={u.id} initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{duration:.35}}>
                      <RoleBadge><FiUser size={12} /> {u.role}</RoleBadge>
                      <Name>{u.name}</Name>
                      <FieldLine><span>Email</span></FieldLine>
                      <Value>{u.email}</Value>
                      {u.address && (<><FieldLine><span>Address</span></FieldLine><Value>{u.address}</Value></>)}
                      {u.role === 'store_owner' && (
                        <RatingPill><FiStar size={13} style={{color:'#ed8936'}} /> {(u.store_rating ?? 0).toFixed ? u.store_rating.toFixed(2) : Number(u.store_rating || 0).toFixed(2)}</RatingPill>
                      )}
                      <FieldLine><span>Joined</span><span>{new Date(u.created_at).toLocaleDateString()}</span></FieldLine>
                    </UserCard>
                  ))}
                </CardGrid>
              ) : <Empty>No {role} accounts match filters.</Empty>}
            </GroupSection>
          ))
        )}
      </Content>
    </Page>
  );
};

export default ManageUsers;
