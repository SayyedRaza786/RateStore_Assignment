import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { updatePasswordSchema } from '../utils/validationSchemas';
import { 
  Container, 
  Card, 
  Button, 
  Input, 
  FormGroup, 
  Label, 
  ErrorText,
  Badge 
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
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
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
  const { user } = useAuth();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(updatePasswordSchema),
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully!');
      reset();
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    } finally {
      setLoading(false);
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
            <Subtitle>Manage your account information and security settings</Subtitle>
          </Header>

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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                  <FiLock style={{ marginRight: '0.5rem' }} />
                  Change Password
                </h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormGroup>
                    <Label>Current Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock />
                      </InputIcon>
                      <StyledInput
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="Enter current password"
                        $error={!!errors.currentPassword}
                        $hasIcon
                        {...register('currentPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {errors.currentPassword && (
                      <ErrorText>{errors.currentPassword.message}</ErrorText>
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
                        $error={!!errors.newPassword}
                        $hasIcon
                        {...register('newPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {errors.newPassword && (
                      <ErrorText>{errors.newPassword.message}</ErrorText>
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
                        $error={!!errors.confirmNewPassword}
                        $hasIcon
                        {...register('confirmNewPassword')}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                      </PasswordToggle>
                    </InputWrapper>
                    {errors.confirmNewPassword && (
                      <ErrorText>{errors.confirmNewPassword.message}</ErrorText>
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
