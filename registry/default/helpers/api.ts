const BASE_URL = `${import.meta.env.VITE_API}`;

export async function GET<T>(endpoint: string, headers?: any): Promise<T> {
  const options: RequestInit = {
    method: "GET",
    headers: { "Content-Type": "application/json", ...headers },
  };

  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`HTTP error: ${response.status}, Response Body: ${responseBody}`);
  }

  return await response.json();
}

export async function POST<T>(endpoint: string, body: any, headers?: any): Promise<T> {
  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  };

  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`HTTP error: ${response.status}, Response Body: ${responseBody}`);
  }

  return await response.json();
}

export async function DELETE<T>(endpoint: string, body?: any, headers?: any): Promise<T> {
  const options: RequestInit = {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };

  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`HTTP error: ${response.status}, Response Body: ${responseBody}`);
  }

  return await response.json();
}
