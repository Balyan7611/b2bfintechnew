import { apiService } from '../api/httpClient';

export const SectionTypeService = {
    getAll: async (isActive = true) => {
    const url = isActive !== null
      ? `/SectionType/get-all-sectiontype?isActive=${isActive}`
      : '/SectionType/get-all-sectiontype';
    return await apiService.post(url, {});
  },
};
