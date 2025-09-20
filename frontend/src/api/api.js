//api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:2995', // Set here IP-address of the host
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchFuelData = async () => {
  const response = await apiClient.get('/fuel');
  return response.data;
};

export const addFuelRecord = async (fuelData) => {
  const response = await apiClient.post('/fuel', fuelData);
  return response.data;
};

export const updateFuelRecord = async (id, fuelData) => {
  const response = await apiClient.put(`/fuel/${id}`, fuelData);
  return response.data;
};

export const deleteFuelRecord = async (id) => {
  const response = await apiClient.delete(`/fuel/${id}`);
  return response.data;
};

// Cars API Calls
export const fetchCars = async () => {
  const response = await apiClient.get('/car');
  return response.data;
};

export const addCar = async (carData) => {
  const response = await apiClient.post('/car', carData);
  return response.data;
};

export const updateCarRecord = async (rekisteritunnus, carData) => {
  const response = await apiClient.put(`/car/${rekisteritunnus}`, carData);
  return response.data;
};

export const deleteCarRecord = async (rekisteritunnus) => { // Changed to accept rekisteritunnus
  const response = await apiClient.delete(`/car/${rekisteritunnus}`);
  return response.data;
};

// Services API Calls (assuming these are still relevant)
export const fetchServices = async () => {
  const response = await apiClient.get('/service');
  return response.data;
};

export const addService = async (serviceData) => {
  const response = await apiClient.post('/service', serviceData);
  return response.data;
};

export const updateService = async (id, serviceData) => {
  try {
    const response = await apiClient.put(`/service/${id}`, serviceData);
    return response.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/*
export const updateService = async (id, serviceData) => {
  const response = await apiClient.put(`/service/${id}`, serviceData);
  return response.data;
};
*/

export const deleteService = async (id) => {
  const response = await apiClient.delete(`/service/${id}`);
  return response.data;
};

// Driving data API Calls
export const fetchDrivingData = async () => {
  const response = await apiClient.get('/drivingdata');
  return response.data;
};

export const addDrivingData = async (drivingData) => {
  const response = await apiClient.post('/drivingdata', drivingData);
  return response.data;
};

export const updateDrivingData = async (rekisteritunnus, drivingData) => {
  const response = await apiClient.put(`/drivingdata/${rekisteritunnus}`, drivingData);
  return response.data;
};

export const deleteDrivingData = async (rekisteritunnus) => { // Changed to accept rekisteritunnus
  const response = await apiClient.delete(`/drivingdata/${rekisteritunnus}`);
  return response.data;
};
