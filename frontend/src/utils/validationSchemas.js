import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  role: yup
    .string()
    .oneOf(['user','store_owner','admin'],'Invalid role')
    .required('Role is required'),
});

export const updatePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter and one special character'
    )
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
});

export const updateProfileSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(60, 'Name must not exceed 60 characters')
    .required('Name is required'),
  currentPassword: yup
    .string()
    .required('Current password is required for security verification'),
});

export const storeSchema = yup.object().shape({
  name: yup
    .string()
    .min(20, 'Store name must be at least 20 characters')
    .max(60, 'Store name must not exceed 60 characters')
    .required('Store name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  ownerEmail: yup
    .string()
    .email('Please enter a valid owner email address')
    .nullable(),
});

export const userSchema = yup.object().shape({
  name: yup
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter and one special character'
    )
    .required('Password is required'),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  role: yup
    .string()
    .oneOf(['user', 'admin', 'store_owner'], 'Invalid role')
    .required('Role is required'),
});
