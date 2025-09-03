// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format rating to display with stars
export const formatRating = (rating) => {
  return parseFloat(rating).toFixed(1);
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Truncate text to specified length
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleMap = {
    admin: 'System Administrator',
    user: 'Normal User',
    store_owner: 'Store Owner',
  };
  return roleMap[role] || role;
};

// Get role badge variant
export const getRoleBadgeVariant = (role) => {
  const variantMap = {
    admin: 'error',
    user: 'info',
    store_owner: 'warning',
  };
  return variantMap[role] || 'info';
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate star rating array
export const generateStarArray = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }

  if (hasHalfStar) {
    stars.push('half');
  }

  while (stars.length < 5) {
    stars.push('empty');
  }

  return stars;
};

// Sort array by field
export const sortBy = (array, field, order = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle null/undefined values
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    // Convert to string for comparison if needed
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
    }
    if (typeof bVal === 'string') {
      bVal = bVal.toLowerCase();
    }

    if (order === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

// Filter array by multiple fields
export const filterData = (data, filters) => {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      if (itemValue == null) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });
};
