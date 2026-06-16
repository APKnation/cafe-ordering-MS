const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

// AUTH
export const login = (credentials) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(credentials) }).then(handleResponse);

export const register = (data) =>
  fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

// MENU
export const getMenuItems = () =>
  fetch(`${BASE_URL}/menu`, { headers: getHeaders() }).then(handleResponse);

export const getAvailableMenuItems = () =>
  fetch(`${BASE_URL}/menu/available`, { headers: getHeaders() }).then(handleResponse);

export const addMenuItem = (item) =>
  fetch(`${BASE_URL}/menu`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(item) }).then(handleResponse);

export const updateMenuItem = (id, item) =>
  fetch(`${BASE_URL}/menu/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(item) }).then(handleResponse);

export const deleteMenuItem = (id) =>
  fetch(`${BASE_URL}/menu/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);

// Reservation Endpoints
export const getReservations = () =>
  fetch(`${BASE_URL}/reservations`, { headers: getHeaders() }).then(handleResponse);

export const createReservation = (data) =>
  fetch(`${BASE_URL}/reservations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const updateReservationStatus = (id, status) =>
  fetch(`${BASE_URL}/reservations/${id}/status?status=${status}`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse);

// TABLES
export const getTables = () =>
  fetch(`${BASE_URL}/tables`, { headers: getHeaders() }).then(handleResponse);

export const addTable = (table) =>
  fetch(`${BASE_URL}/tables`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(table) }).then(handleResponse);

export const occupyTable = (tableNumber) =>
  fetch(`${BASE_URL}/tables/${tableNumber}/occupy`, { method: 'POST', headers: getHeaders() }).then(handleResponse);

export const vacateTable = (tableNumber) =>
  fetch(`${BASE_URL}/tables/${tableNumber}/vacate`, { method: 'POST', headers: getHeaders() }).then(handleResponse);

export const deleteTable = (tableNumber) =>
  fetch(`${BASE_URL}/tables/${tableNumber}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);

// ORDERS
export const getOrders = () =>
  fetch(`${BASE_URL}/orders`, { headers: getHeaders() }).then(handleResponse);

export const placeOrder = (order) =>
  fetch(`${BASE_URL}/orders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(order) }).then(handleResponse);

export const updateOrderStatus = (id, status) =>
  fetch(`${BASE_URL}/orders/${id}/status?status=${status}`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse);

// BILLING
export const generateBill = (orderId, discount, isPercentage) => {
  let url = `${BASE_URL}/bills/generate/${orderId}`;
  const params = [];
  if (discount) params.push(`discount=${discount}`);
  if (isPercentage !== undefined) params.push(`isPercentage=${isPercentage}`);
  if (params.length) url += '?' + params.join('&');
  return fetch(url, { method: 'POST', headers: getHeaders() }).then(handleResponse);
};

export const payBill = (billId, method) =>
  fetch(`${BASE_URL}/bills/${billId}/pay?method=${method}`, { method: 'POST', headers: getHeaders() }).then(handleResponse);

export const getReceipt = (billId) =>
  fetch(`${BASE_URL}/bills/${billId}/receipt`, { headers: getHeaders() }).then(handleResponse);

// REPORTS
export const getSalesReport = (period) =>
  fetch(`${BASE_URL}/reports/sales?period=${period}`, { headers: getHeaders() }).then(handleResponse);

export const getBestSellers = () =>
  fetch(`${BASE_URL}/reports/best-sellers`, { headers: getHeaders() }).then(handleResponse);

export const getRevenueAnalysis = () =>
  fetch(`${BASE_URL}/reports/revenue`, { headers: getHeaders() }).then(handleResponse);

// ANALYTICS
export const getPeakTimes = () =>
  fetch(`${BASE_URL}/analytics/peak-times`, { headers: getHeaders() }).then(handleResponse);

export const getTableTurnover = () =>
  fetch(`${BASE_URL}/analytics/table-turnover`, { headers: getHeaders() }).then(handleResponse);
