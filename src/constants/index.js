import COLORS, { DARK_COLORS, LIGHT_COLORS } from './colors';

export { COLORS, DARK_COLORS, LIGHT_COLORS };

export const API_BASE_URL = 'https://AppMarketbackend.onrender.com/api';
// export const API_BASE_URL = 'http://192.168.1.11:5000/api';

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'free', label: '🎁 Free (₹0)' },
  { id: 'business', label: 'Business' },
  { id: 'tools', label: 'Tools' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'social', label: 'Social' },
  { id: 'finance', label: 'Finance' },
  { id: 'utility', label: 'Utility' },
  { id: 'games', label: 'Games' },
];

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export default COLORS;