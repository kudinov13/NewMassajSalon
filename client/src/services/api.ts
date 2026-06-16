// In development, CRA proxy forwards API requests to localhost:3001 (see package.json "proxy").
// In production, the API is served from the same origin.
export const BASE_URL = "";

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
      const response = await fetch(`${BASE_URL}/auth`, {
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
      const response = await fetch(`${BASE_URL}/auth`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
  },
  user: {
    register: async (data: RegistrationData) => {
      const response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      await errorHandler(response);
    },
    getCurrentUser: async () => {
      const response = await fetch(`${BASE_URL}/user`, {
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
      const response = await fetch(`${BASE_URL}/user/profile`, {
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
        ? `${BASE_URL}/products?category=${encodeURIComponent(category)}`
        : `${BASE_URL}/products`;
      const response = await fetch(url, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (formData: FormData) => {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (id: number, formData: FormData) => {
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      await errorHandler(response);
      return await response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
    getVideos: async (productId: number) => {
      const response = await fetch(`${BASE_URL}/products/${productId}/videos`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    uploadVideo: async (productId: number, formData: FormData) => {
      const response = await fetch(`${BASE_URL}/products/${productId}/videos`, { method: "POST", credentials: "include", body: formData });
      await errorHandler(response);
      return response.json();
    },
    deleteVideo: async (productId: number, videoId: number) => {
      const response = await fetch(`${BASE_URL}/products/${productId}/videos/${videoId}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    reorderVideos: async (productId: number, videoIds: number[]) => {
      const response = await fetch(`${BASE_URL}/products/${productId}/videos/reorder`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      });
      await errorHandler(response);
      return response.json();
    },
    updateVideoTitle: async (productId: number, videoId: number, title: string) => {
      const response = await fetch(`${BASE_URL}/products/${productId}/videos/${videoId}`, {
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
      const response = await fetch(`${BASE_URL}/cart`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    add: async (productId: number) => {
      const response = await fetch(`${BASE_URL}/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      await errorHandler(response);
      return await response.json();
    },
    updateQuantity: async (productId: number, quantity: number) => {
      const response = await fetch(`${BASE_URL}/cart/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      await errorHandler(response);
      return await response.json();
    },
    remove: async (productId: number) => {
      const response = await fetch(`${BASE_URL}/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    clear: async () => {
      const response = await fetch(`${BASE_URL}/cart`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    checkout: async () => {
      const response = await fetch(`${BASE_URL}/cart/checkout`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    getOrders: async () => {
      const response = await fetch(`${BASE_URL}/cart/orders`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
  },
  streams: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/streams`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (data: { title: string; description: string; date: string; time: string; speaker?: string; status?: string; price?: number; previewUrl?: string | null }) => {
      const response = await fetch(`${BASE_URL}/streams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (id: number, data: { title: string; description: string; date: string; time: string; speaker?: string; status?: string; price?: number; previewUrl?: string | null }) => {
      const response = await fetch(`${BASE_URL}/streams/${id}`, {
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
        xhr.open('POST', `${BASE_URL}/streams/${id}/preview`);
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
      const response = await fetch(`${BASE_URL}/streams/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
  },
  admin: {
    getStats: async () => {
      const response = await fetch(`${BASE_URL}/admin/stats`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getUsers: async () => {
      const response = await fetch(`${BASE_URL}/admin/users`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    changeRole: async (userId: number, role: string) => {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      await errorHandler(response);
      return await response.json();
    },
  },
  streamRoom: {
    start: async (streamId: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/start`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    stop: async (streamId: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/stop`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    join: async (streamId: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/join`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getMy: async () => {
      const response = await fetch(`${BASE_URL}/stream-room/my`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getRoom: async (streamId: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/room`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    sendSignal: async (streamId: number, type: string, data: any, receiverId?: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/signal`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data, receiverId: receiverId || 0 }),
      });
      await errorHandler(response);
    },
    getSignals: async (streamId: number, afterId: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/signals?after=${afterId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    sendChat: async (streamId: number, message: string) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/chat`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      await errorHandler(response);
      return await response.json();
    },
    getChat: async (streamId: number, afterId: number) => {
      const response = await fetch(`${BASE_URL}/stream-room/${streamId}/chat?after=${afterId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
  },
  labs: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/labs`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (data: { name: string; organization: string; url: string }) => {
      const response = await fetch(`${BASE_URL}/labs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (id: number, data: { name: string; organization: string; url: string }) => {
      const response = await fetch(`${BASE_URL}/labs/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/labs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
    },
  },
  schedule: {
    getAvailable: async () => {
      const response = await fetch(`${BASE_URL}/schedule`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/schedule/all`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    create: async (data: { date: string; times: string[] }) => {
      const response = await fetch(`${BASE_URL}/schedule`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/schedule/${id}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
    },
  },
  appointments: {
    getMy: async () => {
      const response = await fetch(`${BASE_URL}/appointments/my`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    get: async (id: number) => {
      const response = await fetch(`${BASE_URL}/appointments/${id}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    book: async (data: { slotId: number; fullName: string; phone: string }) => {
      const response = await fetch(`${BASE_URL}/appointments`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return await response.json();
    },
    start: async (id: number) => {
      const response = await fetch(`${BASE_URL}/appointments/${id}/start`, {
        method: "POST", credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    complete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/appointments/${id}/complete`, {
        method: "POST", credentials: "include",
      });
      await errorHandler(response);
      return await response.json();
    },
    cancel: async (id: number) => {
      const response = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: "DELETE", credentials: "include",
      });
      await errorHandler(response);
    },
  },
  room: {
    get: async (roomId: string) => {
      const response = await fetch(`${BASE_URL}/room/${roomId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
    sendSignal: async (roomId: string, type: string, data: any) => {
      const response = await fetch(`${BASE_URL}/room/${roomId}/signal`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      await errorHandler(response);
    },
    getSignals: async (roomId: string, afterId: number) => {
      const response = await fetch(`${BASE_URL}/room/${roomId}/signals?after=${afterId}`, { credentials: "include" });
      await errorHandler(response);
      return await response.json();
    },
  },
  settings: {
    get: async (): Promise<Record<string, string>> => {
      const response = await fetch(`${BASE_URL}/settings`, {
        credentials: "include",
        method: "GET"
      });
      await errorHandler(response);
      return await response.json();
    },
    update: async (updates: Record<string, string>): Promise<Record<string, string>> => {
      const response = await fetch(`${BASE_URL}/settings`, {
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
      const response = await fetch(`${BASE_URL}/courses`);
      await errorHandler(response);
      return response.json();
    },
    get: async (id: number) => {
      const response = await fetch(`${BASE_URL}/courses/${id}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (formData: FormData) => {
      const response = await fetch(`${BASE_URL}/courses`, { method: "POST", credentials: "include", body: formData });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, formData: FormData) => {
      const response = await fetch(`${BASE_URL}/courses/${id}`, { method: "PUT", credentials: "include", body: formData });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/courses/${id}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    uploadVideo: async (courseId: number, formData: FormData) => {
      const response = await fetch(`${BASE_URL}/courses/${courseId}/videos`, { method: "POST", credentials: "include", body: formData });
      await errorHandler(response);
      return response.json();
    },
    deleteVideo: async (courseId: number, videoId: number) => {
      const response = await fetch(`${BASE_URL}/courses/${courseId}/videos/${videoId}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    purchase: async (id: number) => {
      const response = await fetch(`${BASE_URL}/courses/${id}/purchase`, { method: "POST", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getMy: async () => {
      const response = await fetch(`${BASE_URL}/courses/my/list`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  bowls: {
    getAudio: async () => {
      const response = await fetch(`${BASE_URL}/bowls/audio`);
      await errorHandler(response);
      return response.json();
    },
    uploadAudio: async (file: File) => {
      const formData = new FormData();
      formData.append("audio", file);
      const response = await fetch(`${BASE_URL}/bowls/audio`, {
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
      const url = city ? `${BASE_URL}/bowls-schedule?city=${city}` : `${BASE_URL}/bowls-schedule`;
      const response = await fetch(url, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/bowls-schedule/all`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (date: string, times: string[], city?: string) => {
      const response = await fetch(`${BASE_URL}/bowls-schedule`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, times, city: city || 'novosibirsk' }),
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/bowls-schedule/${id}`, { method: "DELETE", credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    book: async (slotId: number, fullName: string, phone: string) => {
      const response = await fetch(`${BASE_URL}/bowls-schedule/book`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, fullName, phone }),
      });
      await errorHandler(response);
      return response.json();
    },
    getMyAppointments: async () => {
      const response = await fetch(`${BASE_URL}/bowls-schedule/my-appointments`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getSpecialistAppointments: async () => {
      const response = await fetch(`${BASE_URL}/bowls-schedule/appointments`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  diagnostics: {
    getAvailableSlots: async () => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    create: async (date: string, times: string[]) => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, times }),
      });
      await errorHandler(response);
      return response.json();
    },
    deleteSlot: async (id: number) => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    bookSlot: async (data: { slotId: number; fullName: string; phone: string }) => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/book`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    getMyAppointments: async () => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/my-appointments`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getAllAppointments: async () => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/all-appointments`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    joinRoom: async (appointmentId: number) => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/join-room/${appointmentId}`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    leaveRoom: async (appointmentId: number) => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/leave-room/${appointmentId}`, {
        method: "POST",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
    getRoomStatus: async (appointmentId: number) => {
      const response = await fetch(`${BASE_URL}/diagnostics-schedule/room-status/${appointmentId}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  guide: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/guide`);
      await errorHandler(response);
      return response.json();
    },
    create: async (data: { title: string; body: string }) => {
      const response = await fetch(`${BASE_URL}/guide`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    update: async (id: number, data: { title: string; body: string; sortOrder?: number }) => {
      const response = await fetch(`${BASE_URL}/guide/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/guide/${id}`, {
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
        await fetch(`${BASE_URL}/activity`, {
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
      const response = await fetch(`${BASE_URL}/activity?${params}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
    getUsers: async (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${BASE_URL}/activity/users${params}`, { credentials: "include" });
      await errorHandler(response);
      return response.json();
    },
  },
  bowlsMedia: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/bowls-media`);
      await errorHandler(response);
      return response.json();
    },
    upload: async (file: File, title: string) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      const response = await fetch(`${BASE_URL}/bowls-media`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      await errorHandler(response);
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/bowls-media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await errorHandler(response);
      return response.json();
    },
  },
};
