import React from 'react';
import { StarRating, Star } from '../styles/GlobalStyles';

const StarRatingComponent = ({ 
  rating = 0, 
  size = '1.25rem', 
  interactive = false, 
  onRatingChange = null 
}) => {
  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <StarRating>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          filled={star <= rating}
          size={size}
          interactive={interactive}
          onClick={() => handleStarClick(star)}
        >
          ★
        </Star>
      ))}
      {!interactive && rating > 0 && (
        <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9rem' }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </StarRating>
  );
};

export default StarRatingComponent;
