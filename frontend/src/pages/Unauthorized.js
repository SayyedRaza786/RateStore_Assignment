import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';

import { Button } from '../styles/GlobalStyles';

const UnauthorizedContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Icon = styled.div`
  font-size: 4rem;
  color: #f56565;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #718096;
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Unauthorized = () => {
  return (
    <UnauthorizedContainer>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Content>
          <Icon>
            <FiShield />
          </Icon>
          
          <Title>Access Denied</Title>
          
          <Message>
            You don't have permission to access this page. Please contact your administrator 
            if you believe this is an error, or return to your dashboard.
          </Message>

          <ButtonGroup>
            <Button as={Link} to="/" variant="primary">
              <FiHome />
              Go to Dashboard
            </Button>
            
            <Button 
              as="button" 
              variant="secondary"
              onClick={() => window.history.back()}
            >
              <FiArrowLeft />
              Go Back
            </Button>
          </ButtonGroup>
        </Content>
      </motion.div>
    </UnauthorizedContainer>
  );
};

export default Unauthorized;
