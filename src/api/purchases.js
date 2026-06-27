import client from './client';

export const purchaseApp = (appId) => client.post('/purchases', { appId });
export const getMyPurchases = () => client.get('/purchases/my');
export const getDownloadLinks = (appId) => client.get(`/purchases/download/${appId}`);
