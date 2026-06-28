const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Trip {
  _id: string;
  user: string;
  title: string;
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripDays: number;
  adults: number;
  status: "saved" | "upcoming" | "completed";
  plannerData?: any;
  createdAt: string;
  updatedAt: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok) {
    const err = new Error(
      data.error || data.message || "Request failed"
    ) as Error;
    throw err;
  }

  return data as T;
}

export async function createTrip(
  accessToken: string,
  tripData: {
    title: string;
    source: string;
    destination: string;
    startDate: string;
    endDate: string;
    tripDays: number;
    adults: number;
    status?: string;
    plannerData: any;
  }
): Promise<{ message: string; trip: Trip }> {
  const res = await fetch(`${API_BASE}/api/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(tripData),
  });
  
  return parseResponse<{ message: string; trip: Trip }>(res);
}

export async function getTripById(
  accessToken: string,
  tripId: string
): Promise<{ message: string; trip: Trip }> {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseResponse<{ message: string; trip: Trip }>(res);
}

export async function getTrips(
  accessToken: string
): Promise<{ message: string; trips: Trip[] }> {
  const res = await fetch(`${API_BASE}/api/trips`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseResponse<{ message: string; trips: Trip[] }>(res);
}

export async function updateTrip(
  accessToken: string,
  tripId: string,
  updateData: Partial<{
    title: string;
    status: string;
    plannerData: any;
  }>
): Promise<{ message: string; trip: Trip }> {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updateData),
  });
  return parseResponse<{ message: string; trip: Trip }>(res);
}

export async function deleteTrip(
  accessToken: string,
  tripId: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseResponse<{ message: string }>(res);
}
