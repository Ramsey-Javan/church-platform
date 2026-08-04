import axios from 'axios';

// --- Axios Configuration & Helpers ---
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

export const buildApiUrl = (path) => `${api.defaults.baseURL}${path}`;

// --- Church Settings ---
export const getChurchSettings = () => api.get('/church-settings/').then((r) => r.data);

// --- Sermons ---
export const getSermons = (params) => api.get('/sermons/', { params }).then((r) => r.data);
export const getSermon = (id) => api.get(`/sermons/${id}/`).then((r) => r.data);

// --- About ---
export const getAboutPage = () => api.get('/about/about-page/').then((r) => r.data);
export const getGallery = (params) => api.get('/about/gallery/', { params }).then((r) => r.data);
export const getLeaders = () => api.get('/about/leaders/').then((r) => r.data);

// --- Program ---
export const getTodayProgram = () =>
  api
    .get('/program/today/')
    .then((r) => r.data)
    .catch((err) => {
      if (err.response?.status === 404) return null; // no service scheduled today
      throw err;
    });
export const getService = (id) => api.get(`/program/services/${id}/`).then((r) => r.data);
export const getServiceForEvent = (eventId) =>
  api.get('/program/services/', { params: { event: eventId } }).then((r) => r.data);

// --- Events ---
export const getEvents = (params) => api.get('/events/', { params }).then((r) => r.data);
export const getEvent = (id) => api.get(`/events/${id}/`).then((r) => r.data);
export const rsvpEvent = (id, payload) => api.post(`/events/${id}/rsvp/`, payload).then((r) => r.data);
export const getEventCategories = () => api.get('/events/categories/').then((r) => r.data);

// --- Ministries & Connect ---
export const getMinistries = () => api.get('/ministries/').then((r) => r.data);
export const getSmallGroups = (params) => api.get('/ministries/small-groups/', { params }).then((r) => r.data);
export const submitConnectCard = (payload) => api.post('/connect/', payload).then((r) => r.data);

// --- Giving ---
export const getFunds = () => api.get('/giving/funds/').then((r) => r.data);
export const createDonationCheckout = (payload) => api.post('/giving/checkout/', payload).then((r) => r.data);