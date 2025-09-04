import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiShoppingBag, FiStar, FiLogOut, FiSettings, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../context/ThemeToggleContext';

const NavbarContainer = styled.nav`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
  padding: 0; /* inner handled by NavShell */
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(125deg, rgba(40,54,80,0.82) 0%, rgba(34,46,68,0.78) 45%, rgba(30,41,59,0.75) 100%)'
    : 'linear-gradient(125deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.78) 50%, rgba(248,250,252,0.72) 100%)'};
  box-shadow: 0 12px 34px -16px rgba(0,0,0,0.35), 0 6px 18px -10px rgba(0,0,0,0.15);
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.75)'};
  overflow: hidden;

  &::after { /* subtle gradient accent line */
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0; height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 60%, ${({ theme }) => theme.colors.primary} 100%);
    opacity: .65;
    filter: saturate(140%);
  }
`;

const NavShell = styled.div`
  max-width: 1380px;
  margin: 0 auto;
  padding: clamp(.9rem,1.4vw,1.15rem) clamp(1.2rem,2.4vw,2rem);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: clamp(1rem,2vw,1.4rem);
  align-items: center;

  @media (max-width: 1000px){
    grid-template-columns: 1fr auto;
    grid-template-areas: 'logo actions' 'links links';
  }
`;


const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  position: relative;
  letter-spacing: .5px;
  background: linear-gradient(120deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 70%);
  -webkit-background-clip: text; color: transparent; background-clip: text;
  padding: 10px 16px 11px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.85)'};
  background-origin: border-box;
  box-shadow: 0 6px 18px -8px rgba(0,0,0,0.35), 0 2px 6px -2px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px) saturate(160%);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(40,52,74,0.55)' : 'rgba(255,255,255,0.7)'};

  svg { font-size: 1.25rem; }
  .brand-star { 
    color: ${({ theme }) => theme.colors.primary};
    stroke: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  }
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -10px rgba(0,0,0,0.45), 0 4px 10px -4px rgba(0,0,0,0.25); }
  transition: all .45s cubic-bezier(.4,0,.2,1);
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px;
  border-radius: 18px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(120deg, rgba(54,70,96,0.65) 0%, rgba(46,60,84,0.6) 60%, rgba(40,52,74,0.55) 100%)'
    : 'linear-gradient(120deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.85) 60%, rgba(248,250,252,0.8) 100%)'};
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)'};
  box-shadow: 0 6px 20px -10px rgba(0,0,0,0.35), 0 2px 8px -4px rgba(0,0,0,0.12);
  position: relative;
  @media (max-width: 1000px){
    flex-wrap: wrap;
    justify-content: center;
    grid-area: links;
  }
`;

const NavLink = styled(Link)`
  position: relative;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 20px 13px;
  font-size: .82rem;
  letter-spacing: .5px;
  font-weight: 600;
  border-radius: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? theme.colors.gray900 : theme.colors.gray700};
  transition: all .4s cubic-bezier(.4,0,.2,1);
  isolation: isolate;
  overflow: hidden;
  svg { font-size: .95rem; }
  &:before { content:''; position:absolute; inset:0; background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}0F 0%, ${({ theme }) => theme.colors.secondary}0F 100%); opacity:0; transition: opacity .5s; }
  &:hover { transform: translateY(-3px); color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : theme.colors.gray800}; }
  &:hover:before { opacity:1; }
  &.active { background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%); color: #fff; box-shadow: 0 6px 18px -6px rgba(0,0,0,0.35); }
`;

const ActionButton = styled.button`
  position: relative;
  border: none;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 13px;
  font-size: .82rem;
  letter-spacing: .55px;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 18px -6px rgba(0,0,0,0.35);
  transition: all .45s cubic-bezier(.4,0,.2,1);
  &:hover { transform: translateY(-3px); box-shadow: 0 10px 26px -8px rgba(0,0,0,0.45), 0 4px 10px -4px rgba(0,0,0,0.28); }
  &:active { transform: translateY(-1px) scale(.97); }
`;

const ActionsCluster = styled.div`
  display:flex; align-items:center; gap:10px; padding:6px 6px; border-radius:18px; background: ${({ theme }) => theme.mode === 'dark'
  ? 'linear-gradient(120deg, rgba(54,70,96,0.65) 0%, rgba(46,60,84,0.6) 60%, rgba(40,52,74,0.55) 100%)'
  : 'linear-gradient(120deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.85) 60%, rgba(248,250,252,0.8) 100%)'}; backdrop-filter:blur(14px) saturate(180%); border:1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)'}; box-shadow:0 6px 20px -10px rgba(0,0,0,0.35), 0 2px 8px -4px rgba(0,0,0,0.12);
`;

const UserInfo = styled.div`
  display: flex; align-items: center; gap: 18px; font-weight: 500;
  @media (max-width: 680px){ display:none; }
`;

const UserName = styled.span`
  font-weight: 600;
`;

const UserRole = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(102,126,234,0.25) 0%, rgba(118,75,162,0.25) 100%)'
    : 'linear-gradient(135deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.12) 100%)'};
  padding: 6px 12px 6px;
  border-radius: 14px;
  font-size: .6rem;
  letter-spacing: .55px;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(102,126,234,0.28)'};
`;


const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeToggle();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getNavItems = () => {
    if (!user) return [];

    const commonItems = [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
      { path: '/stores', icon: FiShoppingBag, label: 'Stores' },
      { path: '/profile', icon: FiSettings, label: 'Profile' },
    ];

    switch (user.role) {
      case 'admin':
        return [
          { path: '/dashboard', icon: FiBarChart2, label: 'Dashboard' },
          { path: '/stores', icon: FiShoppingBag, label: 'Stores' },
          { path: '/admin/users', icon: FiUsers, label: 'Users' },
          { path: '/admin/stores', icon: FiShoppingBag, label: 'Manage Stores' },
          { path: '/profile', icon: FiSettings, label: 'Profile' },
        ];
      case 'user':
        return [
          { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/stores', icon: FiShoppingBag, label: 'Stores' },
          { path: '/profile', icon: FiSettings, label: 'Profile' },
        ];
      case 'store_owner':
        return [
          { path: '/dashboard', icon: FiBarChart2, label: 'Dashboard' },
          { path: '/stores', icon: FiShoppingBag, label: 'Stores' },
          { path: '/profile', icon: FiSettings, label: 'Profile' },
        ];
      default:
        return commonItems;
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      admin: 'Administrator',
      user: 'User',
      store_owner: 'Store Owner',
    };
    return roleMap[role] || role;
  };

  return (
    <NavbarContainer>
      <NavShell>
  <Logo to="/"><FiStar className="brand-star" /> StoreRate</Logo>
        <NavLinks>
          {getNavItems().map((item) => (
            <NavLink key={item.path} to={item.path} className={isActive(item.path)}>
              <item.icon /> {item.label}
            </NavLink>
          ))}
          <ActionsCluster>
            <ActionButton type="button" onClick={toggleMode} aria-label="Toggle dark mode" style={{ background: mode === 'dark' ? 'linear-gradient(135deg,#4a5568 0%, #2d3748 100%)' : undefined }}>
              {mode === 'light' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
            </ActionButton>
            <ActionButton onClick={handleLogout}><FiLogOut /> Logout</ActionButton>
          </ActionsCluster>
        </NavLinks>
        <UserInfo>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', lineHeight:1.1}}>
            <UserName style={{ fontSize:'.8rem', fontWeight:700 }}>{user?.name}</UserName>
            <UserRole>{getRoleDisplayName(user?.role)}</UserRole>
          </div>
          {/* Logout moved into NavLinks */}
        </UserInfo>
      </NavShell>
    </NavbarContainer>
  );
};

export default Navbar;
