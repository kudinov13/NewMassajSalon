// In development, CRA proxy forwards API requests to localhost:3001 (see package.json "proxy").
// In production, the API is served from the same origin under /api prefix.
export const BASE_URL = "";
export const API_BASE = "/api";

type LoginData = {
  login: string;
  password: string;
};

type RegistrationData = {
  login: string;
  password: string;
  fullName?: string;
  phone?: string;
  email?: string;
};

const errorHandler = async (response: Response) => {
  if (response.ok) return;
  let message = `Ошибка ${response.status}`;
  try {
    const responseData = await response.json();
    if (responseData?.message) message = responseData.message;
  } catch {
    // ответ без JSON (например, HTML от прокси)
  }
  throw new Error(message);
};

export const API = {
  auth: {
    login: async (data: LoginData) => {
      const response = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      await errorHandler(response);
    },
    logout: async () => {
      const response = await fetch(`${API_BASE}/auth`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
  },
  user: {
    register: async (data: RegistrationData) => {
      const response = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      await errorHandler(response);
    },
    getCurrentUser: async () => {
      const response = await fetch(`${API_BASE}/user`, {
        credentials: "include",
        method: "GET"
      });
      if (!response.ok) {
        await errorHandler(response);
      }
      const data = await response.json();
      return data ?? null;
    },
    updateProfile: async (data: { fullName: string; phone: string; email?: string }) => {
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
  },
  products: {
    getAll: async (category?: string) => {
      const url = category && category !== 'all'
        ? `${API_BASE}/products?category=${encodeURIComponent(category)}`
        : `${API_BASE}/products`;
      const response = await fetch(url, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (formData: FormData) => {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (id: number, formData: FormData) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return await response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
    getVideos: async (productId: number) => {
      const response = await fetch(`${API_BASE}/products/${productId}/videos`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    uploadVideo: async (productId: number, formData: FormData, onProgress?: (pct: number) => void) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/products/${productId}/videos`);
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
    },
    deleteVideo: async (productId: number, videoId: number) => {
      const response = await fetch(`${API_BASE}/products/${productId}/videos/${videoId}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    reorderVideos: async (productId: number, videoIds: number[]) => {
      const response = await fetch(`${API_BASE}/products/${productId}/videos/reorder`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      });
      await errorHandler(response);
      return response.json();
    },
    updateVideoTitle: async (productId: number, videoId: number, title: string) => {
      const response = await fetch(`${API_BASE}/products/${productId}/videos/${videoId}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      await errorHandler(response);
      return response.json();
    },
  },
  cart: {
    get: async () => {
      const response = await fetch(`${API_BASE}/basket`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    add: async (productId: number) => {
      const response = await fetch(`${API_BASE}/basket`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      await errorHandler(response);
      return await response.json();
    },
    updateQuantity: async (productId: number, quantity: number) => {
      const response = await fetch(`${API_BASE}/basket/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      await errorHandler(response);
      return await response.json();
    },
    remove: async (productId: number) => {
      const response = await fetch(`${API_BASE}/basket/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    clear: async () => {
      const response = await fetch(`${API_BASE}/basket`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    checkout: async () => {
      const response = await fetch(`${API_BASE}/basket/checkout`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    getOrders: async () => {
      const response = await fetch(`${API_BASE}/basket/orders`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
  },
  streams: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/streams`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (data: { title: string; description: string; date: string; time: string; speaker?: string; status?: string; price?: number; previewUrl?: string | null }) => {
      const response = await fetch(`${API_BASE}/streams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (id: number, data: { title: string; description: string; date: string; time: string; speaker?: string; status?: string; price?: number; previewUrl?: string | null }) => {
      const response = await fetch(`${API_BASE}/streams/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    uploadPreview: (id: number, file: File, onProgress?: (pct: number) => void): Promise<any> => {
      return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append('video', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/streams/${id}/preview`);
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Ошибка загрузки видео'));
          }
        };
        xhr.onerror = () => reject(new Error('Сетевая ошибка'));
        xhr.send(fd);
      });
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/streams/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
  },
  admin: {
    getStats: async () => {
      const response = await fetch(`${API_BASE}/panel/stats`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getUsers: async () => {
      const response = await fetch(`${API_BASE}/panel/users`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    changeRole: async (userId: number, role: string) => {
      const response = await fetch(`${API_BASE}/panel/users/${userId}/role`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      await errorHandler(response);
      return await response.json();
    },
    deleteUser: async (userId: number) => {
      const response = await fetch(`${API_BASE}/panel/users/${userId}`, {
        method: "DELETE", credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
  },
  streamRoom: {
    start: async (streamId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/start`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    stop: async (streamId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/stop`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    join: async (streamId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/join`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getMy: async () => {
      const response = await fetch(`${API_BASE}/stream-room/my`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getRoom: async (streamId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/room`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    sendSignal: async (streamId: number, type: string, data: any, receiverId?: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/signal`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data, receiverId: receiverId || 0 }),
      });
      await errorHandler(response);
    },
    getSignals: async (streamId: number, afterId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/signals?after=${afterId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    sendChat: async (streamId: number, message: string) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/chat`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      await errorHandler(response);
      return await response.json();
    },
    getChat: async (streamId: number, afterId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/chat?after=${afterId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    restore: async (streamId: number) => {
      const response = await fetch(`${API_BASE}/stream-room/${streamId}/restore`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getHistory: async () => {
      const response = await fetch(`${API_BASE}/stream-room/history`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
  },
  labs: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/labs`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (data: { name: string; organization: string; url: string }) => {
      const response = await fetch(`${API_BASE}/labs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (id: number, data: { name: string; organization: string; url: string }) => {
      const response = await fetch(`${API_BASE}/labs/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/labs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
  },
  schedule: {
    getAvailable: async () => {
      const response = await fetch(`${API_BASE}/schedule`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE}/schedule/all`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (data: { date: string; times: string[] }) => {
      const response = await fetch(`${API_BASE}/schedule`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/schedule/${id}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
    },
  },
  appointments: {
    getMy: async () => {
      const response = await fetch(`${API_BASE}/visits/my`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    get: async (id: number) => {
      const response = await fetch(`${API_BASE}/visits/${id}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    book: async (data: { slotId: number; fullName: string; phone: string }) => {
      const response = await fetch(`${API_BASE}/visits`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    start: async (id: number) => {
      const response = await fetch(`${API_BASE}/visits/${id}/start`, {
        method: "POST", credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    complete: async (id: number) => {
      const response = await fetch(`${API_BASE}/visits/${id}/complete`, {
        method: "POST", credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    cancel: async (id: number) => {
      const response = await fetch(`${API_BASE}/visits/${id}`, {
        method: "DELETE", credentials: "include",
      });
      await errorHandler(response);
    },
  },
  room: {
    get: async (roomId: string) => {
      const response = await fetch(`${API_BASE}/room/${roomId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    sendSignal: async (roomId: string, type: string, data: any) => {
      const response = await fetch(`${API_BASE}/room/${roomId}/signal`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      await errorHandler(response);
    },
    getSignals: async (roomId: string, afterId: number) => {
      const response = await fetch(`${API_BASE}/room/${roomId}/signals?after=${afterId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
  },
  settings: {
    get: async (): Promise<Record<string, string>> => {
      const response = await fetch(`${API_BASE}/settings`, {
        credentials: "include",
        method: "GET"
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (updates: Record<string, string>): Promise<Record<string, string>> => {
      const response = await fetch(`${API_BASE}/settings`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });
      await errorHandler(response);
      return await response.json();
    },
  },
  courses: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/courses`);
      await errorHandler(response);
      return response.json();
    },
    get: async (id: number) => {
      const response = await fetch(`${API_BASE}/courses/${id}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (formData: FormData) => {
      const response = await fetch(`${API_BASE}/courses`, { method: "POST", credentials: "include", body: formData });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, formData: FormData) => {
      const response = await fetch(`${API_BASE}/courses/${id}`, { method: "PUT", credentials: "include", body: formData });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/courses/${id}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    uploadVideo: async (courseId: number, formData: FormData, onProgress?: (pct: number) => void) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/courses/${courseId}/videos`);
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
    },
    deleteVideo: async (courseId: number, videoId: number) => {
      const response = await fetch(`${API_BASE}/courses/${courseId}/videos/${videoId}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    purchase: async (id: number) => {
      const response = await fetch(`${API_BASE}/courses/${id}/purchase`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getMy: async () => {
      const response = await fetch(`${API_BASE}/courses/my/list`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  bowls: {
    getAudio: async () => {
      const response = await fetch(`${API_BASE}/bowls/audio`);
      await errorHandler(response);
      return response.json();
    },
    uploadAudio: async (file: File) => {
      const formData = new FormData();
      formData.append("audio", file);
      const response = await fetch(`${API_BASE}/bowls/audio`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return response.json();
    },
  },
  bowlsSchedule: {
    getAvailable: async (city?: string) => {
      const url = city ? `${API_BASE}/bowls-schedule?city=${city}` : `${API_BASE}/bowls-schedule`;
      const response = await fetch(url, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE}/bowls-schedule/all`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (date: string, times: string[], city?: string) => {
      const response = await fetch(`${API_BASE}/bowls-schedule`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, times, city: city || 'novosibirsk' }),
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/bowls-schedule/${id}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    book: async (slotId: number, fullName: string, phone: string) => {
      const response = await fetch(`${API_BASE}/bowls-schedule/book`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, fullName, phone }),
      });
      await errorHandler(response);
      return response.json();
    },
    getMyAppointments: async () => {
      const response = await fetch(`${API_BASE}/bowls-schedule/my-bookings`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getSpecialistAppointments: async () => {
      const response = await fetch(`${API_BASE}/bowls-schedule/bookings`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  diagnostics: {
    getAvailableSlots: async () => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (date: string, times: string[]) => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, times }),
      });
      await errorHandler(response);
      return response.json();
    },
    deleteSlot: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    bookSlot: async (data: { slotId: number; fullName: string; phone: string }) => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/book`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    getMyAppointments: async () => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/my-bookings`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getAllAppointments: async () => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/all-bookings`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    joinRoom: async (appointmentId: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/join-room/${appointmentId}`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    leaveRoom: async (appointmentId: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/leave-room/${appointmentId}`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    getRoomStatus: async (appointmentId: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-schedule/room-status/${appointmentId}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  guide: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/guide`);
      await errorHandler(response);
      return response.json();
    },
    create: async (data: { title: string; body: string }) => {
      const response = await fetch(`${API_BASE}/guide`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, data: { title: string; body: string; sortOrder?: number }) => {
      const response = await fetch(`${API_BASE}/guide/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/guide/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
  },
  activity: {
    log: async (action: string, details?: string) => {
      try {
        await fetch(`${API_BASE}/journal`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, details: details || '' }),
        });
      } catch {}
    },
    getLog: async (search?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (limit) params.set('limit', String(limit));
      const response = await fetch(`${API_BASE}/journal?${params}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getUsers: async (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_BASE}/journal/users${params}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  bowlsMedia: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/bowls-media`);
      await errorHandler(response);
      return response.json();
    },
    upload: async (file: File, title: string) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      const response = await fetch(`${API_BASE}/bowls-media`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/bowls-media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
  },
  reviews: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/reviews`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (data: { rating: number; text: string }) => {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
  },
  diagnosticsTests: {
    getPublic: async (slug: string) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/public/${slug}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    evaluate: async (slug: string, score: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/public/${slug}/evaluate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      await errorHandler(response);
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE}/diagnostics-tests`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getFull: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/${id}/full`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    seedDefault: async () => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/seed`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    resetResults: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/${id}/reset-results`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    create: async (data: { slug: string; title: string; subtitle?: string; active?: boolean }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, data: { slug: string; title: string; subtitle?: string; active?: boolean }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    createQuestion: async (testId: number, data: { text: string; sortOrder?: number }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/${testId}/questions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    updateQuestion: async (id: number, data: { text: string; sortOrder?: number }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/questions/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    deleteQuestion: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/questions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    createOption: async (questionId: number, data: { text: string; score: number; sortOrder?: number }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/questions/${questionId}/options`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    updateOption: async (id: number, data: { text: string; score: number; sortOrder?: number }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/options/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    deleteOption: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/options/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    createResult: async (testId: number, data: { minScore: number; maxScore: number; title: string; text: string; isSeriousProblem?: boolean; buttonLabel?: string; buttonLink?: string }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/${testId}/results`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    updateResult: async (id: number, data: { minScore: number; maxScore: number; title: string; text: string; isSeriousProblem?: boolean; buttonLabel?: string; buttonLink?: string }) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/results/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    deleteResult: async (id: number) => {
      const response = await fetch(`${API_BASE}/diagnostics-tests/results/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
  },
  contact: {
    send: async (data: { name: string; phone: string; message: string }) => {
      const response = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE}/contact`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, data: { status: string; adminReply?: string }) => {
      const response = await fetch(`${API_BASE}/contact/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
  },
  beforeAfter: {
    getAll: async () => {
      const response = await fetch(`${API_BASE}/before-after`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (formData: FormData) => {
      const response = await fetch(`${API_BASE}/before-after`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, formData: FormData) => {
      const response = await fetch(`${API_BASE}/before-after/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE}/before-after/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
  },
};
