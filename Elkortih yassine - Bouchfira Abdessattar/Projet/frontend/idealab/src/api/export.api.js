import api from './axios'

export const exportCSV  = (ideaId) => api.post(`/export/csv/${ideaId}/`,  {}, { responseType: 'blob' })
export const exportXLSX = (ideaId) => api.post(`/export/xlsx/${ideaId}/`, {}, { responseType: 'blob' })
export const exportJSON = (ideaId) => api.post(`/export/json/${ideaId}/`, {}, { responseType: 'blob' })
export const exportPDF  = (ideaId) => api.post(`/export/pdf/${ideaId}/`,  {}, { responseType: 'blob' })
