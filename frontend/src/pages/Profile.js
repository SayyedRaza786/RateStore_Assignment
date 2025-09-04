import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiStar, FiTrendingUp, FiBarChart, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { authAPI, ratingAPI } from '../services/api';
import { updatePasswordSchema, updateProfileSchema } from '../utils/validationSchemas';
import { 
  Container, 
  Card, 
  Button, 
  Input, 
  FormGroup, 
  Label, 
  ErrorText,
  Badge,
  LoadingSpinner 
} from '../styles/GlobalStyles';
import { getRoleDisplayName, getRoleBadgeVariant } from '../utils/helpers';

const ProfileContainer = styled.div`
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

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(99, 102, 241, 0.2)' 
    : 'rgba(99, 102, 241, 0.1)'
  };
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray600};
  font-weight: 500;
`;

const FavoriteStoreCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'rgba(16, 185, 129, 0.1)'
  };
`;

const RecentActivity = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray200};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityLeft = styled.div`
  flex: 1;
`;

const ActivityStore = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray800};
`;

const ActivityDate = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray500};
`;

const ActivityRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray200};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray700};
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.gray900};
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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    profileCurrent: false,
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    commentedRatings: 0,
    favoriteStore: null,
    recentRatings: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(updatePasswordSchema),
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
    }
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const response = await ratingAPI.getUserStats();
      setUserStats({
        totalRatings: response.data.totalRatings || 0,
        averageRating: response.data.averageRating || 0,
        commentedRatings: response.data.commentedRatings || 0,
        favoriteStore: response.data.favoriteStore || null,
        recentRatings: response.data.recentRatings || []
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Set default stats on error
      setUserStats({
        totalRatings: 0,
        averageRating: 0,
        commentedRatings: 0,
        favoriteStore: null,
        recentRatings: []
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully!');
      resetPassword();
      setShowPasswords({ current: false, new: false, confirm: false, profileCurrent: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: data.name,
        currentPassword: data.currentPassword,
      });
      
      // Update user context with new data
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      resetProfile();
      setShowPasswords(prev => ({ ...prev, profileCurrent: false }));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <ProfileContainer>
      <Navbar />
      <Content>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Header>
            <Title>Profile Settings</Title>
            <Subtitle>Manage your account information and view your activity statistics</Subtitle>
          </Header>

          {/* User Statistics Section */}
          <StatsGrid>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <StatCard>
                <StatIcon><FiStar /></StatIcon>
                {statsLoading ? (
                  <LoadingSpinner size="24px" />
                ) : (
                  <>
                    <StatValue>{userStats.totalRatings || 0}</StatValue>
                    <StatLabel>Total Ratings</StatLabel>
                  </>
                )}
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StatCard>
                <StatIcon><FiTrendingUp /></StatIcon>
                {statsLoading ? (
                  <LoadingSpinner size="24px" />
                ) : (
                  <>
                    <StatValue>{userStats.averageRating ? userStats.averageRating.toFixed(1) : '0.0'}</StatValue>
                    <StatLabel>Average Rating</StatLabel>
                  </>
                )}
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StatCard>
                <StatIcon><FiBarChart /></StatIcon>
                {statsLoading ? (
                  <LoadingSpinner size="24px" />
                ) : (
                  <>
                    <StatValue>{userStats.commentedRatings || 0}</StatValue>
                    <StatLabel>Reviewed Stores</StatLabel>
                  </>
                )}
              </StatCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StatCard>
                <StatIcon><FiActivity /></StatIcon>
                {statsLoading ? (
                  <LoadingSpinner size="24px" />
                ) : (
                  <>
                    <StatValue>{userStats.recentRatings?.length || 0}</StatValue>
                    <StatLabel>Recent Activity</StatLabel>
                  </>
                )}
              </StatCard>
            </motion.div>
          </StatsGrid>

          <ProfileGrid>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                  <FiUser style={{ marginRight: '0.5rem' }} />
                  Personal Information
                </h2>
                
                <InfoRow>
                  <InfoLabel>Full Name:</InfoLabel>
                  <InfoValue>{user?.name}</InfoValue>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel>Email Address:</InfoLabel>
                  <InfoValue>{user?.email}</InfoValue>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel>Address:</InfoLabel>
                  <InfoValue>{user?.address}</InfoValue>
                </InfoRow>
                
                <InfoRow>
                  <InfoLabel>Role:</InfoLabel>
                  <InfoValue>
                    <Badge variant={getRoleBadgeVariant(user?.role)}>
                      {getRoleDisplayName(user?.role)}
                    </Badge>
                  </InfoValue>
                </InfoRow>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                  <FiUser style={{ marginRight: '0.5rem' }} />
                  Update Profile
                </h2>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiUser />
                      </InputIcon>
                      <StyledInput
                        type="text"
                        placeholder="Enter your full name"
                        $error={!!profileErrors.name}
                        $hasIcon
                        {...registerProfile('name')}
                      />
                    </InputWrapper>
                    {profileErrors.name && (
                      <ErrorText>{profileErrors.name.message}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Current Password (for verification)</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock />
                      </InputIcon>
                      <StyledInput
                        type={showPasswords.profileCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        $error={!!profileErrors.currentPassword}
                        $hasIcon
                        {...registerProfile('currentPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('profileCurrent')}
                      >
                        {showPasswords.profileCurrent ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {profileErrors.currentPassword && (
                      <ErrorText>{profileErrors.currentPassword.message}</ErrorText>
                    )}
                  </FormGroup>

                  <Button
                    type="submit"
                    disabled={profileLoading}
                    style={{ width: '100%' }}
                  >
                    {profileLoading ? 'Updating Profile...' : 'Update Profile'}
                  </Button>
                </form>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                  <FiActivity style={{ marginRight: '0.5rem' }} />
                  Activity & Favorites
                </h2>

                {/* Favorite Store Section */}
                {userStats.favoriteStore ? (
                  <FavoriteStoreCard>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiStar /> Favorite Store
                    </h4>
                    <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>{userStats.favoriteStore.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {userStats.favoriteStore.count} ratings • Average: {userStats.favoriteStore.average}/5
                    </div>
                  </FavoriteStoreCard>
                ) : (
                  <FavoriteStoreCard>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiStar /> Favorite Store
                    </h4>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>No ratings yet</div>
                  </FavoriteStoreCard>
                )}

                {/* Recent Activity */}
                <RecentActivity>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600' }}>
                    Recent Activity
                  </h4>
                  {userStats.recentRatings && userStats.recentRatings.length > 0 ? (
                    userStats.recentRatings.map((activity, index) => (
                      <ActivityItem key={index}>
                        <ActivityLeft>
                          <ActivityStore>{activity.storeName}</ActivityStore>
                          <ActivityDate>
                            {new Date(activity.created_at).toLocaleDateString()}
                          </ActivityDate>
                        </ActivityLeft>
                        <ActivityRating>
                          <StarRating rating={activity.rating} />
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>
                            {activity.rating}/5
                          </span>
                        </ActivityRating>
                      </ActivityItem>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: '#666', textAlign: 'center', padding: '1rem' }}>
                      No recent activity
                    </div>
                  )}
                </RecentActivity>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                  <FiLock style={{ marginRight: '0.5rem' }} />
                  Change Password
                </h2>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <FormGroup>
                    <Label>Current Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock />
                      </InputIcon>
                      <StyledInput
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="Enter current password"
                        $error={!!passwordErrors.currentPassword}
                        $hasIcon
                        {...registerPassword('currentPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {passwordErrors.currentPassword && (
                      <ErrorText>{passwordErrors.currentPassword.message}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>New Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock />
                      </InputIcon>
                      <StyledInput
                        type={showPasswords.new ? 'text' : 'password'}
                        placeholder="Enter new password"
                        $error={!!passwordErrors.newPassword}
                        $hasIcon
                        {...registerPassword('newPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {passwordErrors.newPassword && (
                      <ErrorText>{passwordErrors.newPassword.message}</ErrorText>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Confirm New Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock />
                      </InputIcon>
                      <StyledInput
                        type={showPasswords.confirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        $error={!!passwordErrors.confirmNewPassword}
                        $hasIcon
                        {...registerPassword('confirmNewPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {passwordErrors.confirmNewPassword && (
                      <ErrorText>{passwordErrors.confirmNewPassword.message}</ErrorText>
                    )}
                  </FormGroup>

                  <Button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </ProfileGrid>
        </motion.div>
      </Content>
    </ProfileContainer>
  );
};

export default Profile;
