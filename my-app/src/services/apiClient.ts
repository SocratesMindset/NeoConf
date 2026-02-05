type ApiError = {
  status: number;
  message: string;
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: response.statusText,
    };
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
