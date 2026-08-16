import client from './client';

export const getApps = (params) => client.get('/apps', { params });
export const getAppById = (id) => client.get(`/apps/${id}`);
export const createApp = (data) => client.post('/apps', data);
export const updateApp = (id, data) => client.put(`/apps/${id}`, data);
export const deleteApp = (id) => client.delete(`/apps/${id}`);
export const addScreenshot = (appId, imageUrl, sortOrder) =>
  client.post(`/apps/${appId}/screenshots`, { imageUrl, sortOrder });
export const deleteScreenshot = (appId, screenshotId) =>
  client.delete(`/apps/${appId}/screenshots/${screenshotId}`);
export const addAppReview = (appId, rating, comment) =>
  client.post(`/apps/${appId}/reviews`, { rating, comment });
