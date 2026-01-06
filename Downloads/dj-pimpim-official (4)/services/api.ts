import axios from 'axios';
import { EventsDto, MerchandiseDto, TrackDto } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const MerchandiseService = {
  getAll: async () => {
    const response = await api.get<MerchandiseDto[]>('/merchandise/');
    return response.data;
  },
  create: async (data: any, file: File | null, token: string) => {
    const formData = new FormData();
    formData.append('merchandiseName', data.merchandiseName);
    formData.append('merchandisePrice', data.merchandisePrice); 
    formData.append('merchandiseDetails', data.merchandiseDetails);
    
    if (file) {
      formData.append('merchandiseImg', file);
    }
    
    return api.post('/merchandise/upload', formData, { 
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      } 
    });
  },
  delete: async (id: number, token: string) => {
    return api.delete(`/merchandise/delete/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
  },
};

export const EventService = {
  getAll: async () => {
    const response = await api.get<EventsDto[]>('/events');
    return response.data;
  },
  create: async (data: any, file: File | null, token: string) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('venueName', data.venueName);
    formData.append('location', data.location);
    formData.append('startDate', data.startDate);
    formData.append('ticketLink', data.ticketLink);
    formData.append('LocationLongitude', data.LocationLongitude);
    formData.append('LocationLatitude', data.LocationLatitude);
    formData.append('status', data.status);
    
    if (file) {
      formData.append('imageUrl', file);
    }

    return api.post('/events/upload', formData, { 
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      } 
    });
  },
  delete: async (id: number, token: string) => {
    return api.delete(`/events/delete/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
  },
};

export const TrackService = {
  getAll: async () => {
    const response = await api.get<TrackDto[]>('/track/');
    return response.data;
  },
  create: async (track: TrackDto, token: string) => {
    return api.post('/track/upload', track, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  delete: async (id: number, token: string) => {
    return api.delete(`/track/delete/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
  },
};