import api from '@/api/client';
import { Bug, CreateBugDTO } from '../types';

export const supportApi = {
  createBug: async (data: CreateBugDTO) => {
    const response = await api.post<Bug>('/v1/bugs', data);
    return response.data;
  },
  
  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await api.post<{ url: string }>('/v1/bugs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyBugs: async () => {
    const response = await api.get<Bug[]>('/v1/bugs/my-bugs');
    return response.data;
  }
};
