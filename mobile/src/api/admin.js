import { api } from './client';

// Admin endpoints per spec: verification, moderation, analytics
export async function getAnalytics() {
  return api.request('/admin/analytics', { auth: true });
}

export async function getVerifications(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  return api.request(`/admin/verifications?${qs}`, { auth: true });
}

export async function decideVerification(profileId, status, note) {
  return api.request(`/admin/verifications/${profileId}/decision`, {
    method: 'POST',
    body: { status, note },
    auth: true,
  });
}

export async function getUsers(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  return api.request(`/admin/users?${qs}`, { auth: true });
}

export async function moderateUser(userId, payload) {
  return api.request(`/admin/users/${userId}`, { method: 'PATCH', body: payload, auth: true });
}

export async function getListings(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  return api.request(`/admin/listings?${qs}`, { auth: true });
}

export async function moderateListing(productId, status, note) {
  return api.request(`/admin/listings/${productId}`, { method: 'PATCH', body: { status, note }, auth: true });
}
