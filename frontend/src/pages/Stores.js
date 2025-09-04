import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { storeAPI, userAPI } from '../services/api';
import { Container, Card, Button, Input, FormGroup, Label, LoadingSpinner } from '../styles/GlobalStyles';
import { debounce } from '../utils/helpers';

const StoresContainer = styled.div`
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

const SearchFilters = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: end;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const StoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StoreCard = styled(Card)`
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const StoreName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.gray800};
`;

const StoreAddress = styled.p`
  color: ${({ theme }) => theme.colors.gray600};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const RatingSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const RatingLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray700};
`;

const UserRatingSection = styled.div`
  background: ${({ theme }) => theme.colors.gray50};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const RatingActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.gray600};

  .icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    opacity: 0.5;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: 1rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SearchInput = styled(Input)`
  position: relative;
  padding-left: 40px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray500};
  pointer-events: none;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Stores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    searchTerm: '', // Add unified search term
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  const [ratingStores, setRatingStores] = useState({});
  const [submittingRating, setSubmittingRating] = useState({});

  useEffect(() => {
    const initializeFetch = async () => {
      await fetchStores();
    };
    initializeFetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStores = async (searchFilters = filters) => {
    setLoading(true);
    try {
      // Use appropriate API based on user role
      let response;
      if (user?.role === 'admin') {
        response = await storeAPI.getAll(searchFilters);
      } else {
        response = await userAPI.getStores(searchFilters);
      }
      
      setStores(response.data.stores || response.data || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to fetch stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce((newFilters) => {
    fetchStores(newFilters);
  }, 500);

  const handleFilterChange = (field, value) => {
    let newFilters = { ...filters, [field]: value };
    
    // If using unified search, clear individual search fields
    if (field === 'searchTerm' && value) {
      newFilters.name = '';
      newFilters.address = '';
    }
    // If using individual search, clear unified search
    else if ((field === 'name' || field === 'address') && value) {
      newFilters.searchTerm = '';
    }
    
    setFilters(newFilters);
    debouncedSearch(newFilters);
  };

  const handleRatingSelect = (storeId, rating) => {
    setRatingStores(prev => ({
      ...prev,
      [storeId]: rating
    }));
  };

  const submitRating = async (storeId) => {
    const rating = ratingStores[storeId];
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(prev => ({ ...prev, [storeId]: true }));
    try {
      await userAPI.submitRating({ storeId, rating });
      toast.success('Rating submitted successfully!');
      
      // Update the store's user rating in the local state
      setStores(prev => prev.map(store => 
        store.id === storeId 
          ? { ...store, user_rating: rating }
          : store
      ));
      
      // Clear the rating selection
      setRatingStores(prev => {
        const { [storeId]: removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const clearRating = (storeId) => {
    setRatingStores(prev => {
      const { [storeId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSearch = () => {
    fetchStores();
    toast.info('Searching stores...');
  };

  const clearFilters = () => {
    const resetFilters = { name: '', address: '', searchTerm: '', sortBy: 'name', sortOrder: 'ASC' };
    setFilters(resetFilters);
    fetchStores(resetFilters);
  };

  return (
    <StoresContainer>
      <Navbar />
      <Content>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Header>
            <Title>All Stores</Title>
            <Subtitle>Discover and explore stores - search by name or location</Subtitle>
          </Header>

          <SearchFilters>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFilter /> Search & Filter Stores
            </h3>
            
            {/* Unified Search Bar */}
            <FormGroup style={{ marginBottom: '1rem' }}>
              <Label>Quick Search</Label>
              <InputWrapper>
                <SearchIcon><FiSearch /></SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search stores by name or location..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FiltersGrid>
              <FormGroup style={{ marginBottom: 0 }}>
                <Label>Search by Store Name</Label>
                <InputWrapper>
                  <SearchIcon><FiSearch /></SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="Enter store name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    disabled={!!filters.searchTerm} // Disable when using unified search
                  />
                </InputWrapper>
              </FormGroup>
              
              <FormGroup style={{ marginBottom: 0 }}>
                <Label>Search by Location</Label>
                <InputWrapper>
                  <SearchIcon><FiMapPin /></SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="Enter address or location..."
                    value={filters.address}
                    onChange={(e) => handleFilterChange('address', e.target.value)}
                    disabled={!!filters.searchTerm} // Disable when using unified search
                  />
                </InputWrapper>
              </FormGroup>
              
              <Button 
                variant="secondary" 
                onClick={clearFilters}
                style={{ height: 'fit-content' }}
              >
                Clear Filters
              </Button>

              <Button 
                onClick={handleSearch}
                style={{ height: 'fit-content' }}
              >
                <FiSearch /> Search
              </Button>
            </FiltersGrid>
          </SearchFilters>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <LoadingSpinner size="60px" />
            </div>
          ) : stores.length === 0 ? (
            <EmptyState>
              <FiSearch className="icon" />
              <h3>No stores found</h3>
              <p>Try adjusting your search criteria or check back later for new stores</p>
              <Button onClick={handleSearch}>
                <FiSearch /> Search Stores
              </Button>
            </EmptyState>
          ) : (
            <StoresGrid>
              {stores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <StoreCard>
                    <StoreName>{store.name}</StoreName>
                    <StoreAddress>
                      <FiMapPin />
                      {store.address}
                    </StoreAddress>

                    <RatingSection>
                      <RatingRow>
                        <RatingLabel>Overall Rating:</RatingLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <StarRating rating={parseFloat(store.average_rating || 0)} />
                          <span style={{ fontSize: '0.875rem', color: '#666' }}>
                            ({store.average_rating ? parseFloat(store.average_rating).toFixed(1) : '0.0'})
                          </span>
                        </div>
                      </RatingRow>
                      
                      {store.user_rating && (
                        <RatingRow>
                          <RatingLabel>Your Rating:</RatingLabel>
                          <StarRating rating={store.user_rating} />
                        </RatingRow>
                      )}
                    </RatingSection>

                    {/* Only show rating functionality for users */}
                    {user?.role === 'user' && (
                      <UserRatingSection>
                        <RatingLabel style={{ display: 'block', marginBottom: '0.5rem' }}>
                          {store.user_rating ? 'Update Your Rating:' : 'Rate This Store:'}
                        </RatingLabel>
                        
                        <StarRating
                          rating={ratingStores[store.id] || store.user_rating || 0}
                          interactive
                          onRatingChange={(rating) => handleRatingSelect(store.id, rating)}
                        />

                        <RatingActions>
                          <Button
                            size="sm"
                            onClick={() => submitRating(store.id)}
                            disabled={submittingRating[store.id] || !ratingStores[store.id]}
                          >
                            {submittingRating[store.id] 
                              ? 'Submitting...' 
                              : store.user_rating 
                                ? 'Update Rating' 
                                : 'Submit Rating'
                            }
                          </Button>
                          
                          {ratingStores[store.id] && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => clearRating(store.id)}
                            >
                              Clear
                            </Button>
                          )}
                        </RatingActions>
                      </UserRatingSection>
                    )}
                  </StoreCard>
                </motion.div>
              ))}
            </StoresGrid>
          )}
        </motion.div>
      </Content>
    </StoresContainer>
  );
};

export default Stores;
