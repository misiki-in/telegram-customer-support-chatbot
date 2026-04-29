import { PUBLIC_API_ENDPOINT } from "$env/static/public";
import { goto } from "$app/navigation";
import { page } from "$app/state";

function processUrl(url: string) {
  return `${PUBLIC_API_ENDPOINT}${url}`
}

export async function GET<T = any>(
	fetchFn: typeof fetch,
	url: string,
	headers?: Record<string, string>
) {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
	const requestHeaders = token ? { ...headers, 'x-token': token } : headers;

	let res: Response, data: unknown;
	try {
		res = await fetchFn(processUrl(url), requestHeaders ? { headers: requestHeaders } : undefined);

		if (res.status === 401) {
			await goto('/login');
			return undefined as T;
		}

		data = await res.json();
	} catch (e) {
		console.error(e);
		throw {
			message: `GET ${url} Failed`
		};
	}

	if (res.ok) return data as T;

	throw {
		message:
			(data && typeof (data as any).message === 'string' ? (data as any).message : undefined) ||
			`GET Status ${res.status}`
	};
}

export async function POST<T = any>(fetchFn: typeof fetch, url: string, body: Record<string, any>, headers?: Record<string, string>) {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
	const allHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...(token && { 'x-token': token }),
    ...headers,
	};

	let res: Response, data: unknown;
	try {
		res = await fetchFn(processUrl(url), {
			method: 'POST',
			headers: allHeaders,
			body: JSON.stringify(body)
		});

		if (res.status === 401 && page.url.pathname != '/login') {
			await goto('/login');
			return undefined as T;
		}

		data = await res.json();
	} catch (e: any) {
		throw {
			message: `POST ${url} Failed`,
			...e
		};
	}

	if (res.ok) return data as T;

	throw {
		message:
			(data && typeof (data as any).message === 'string' ? (data as any).message : undefined) ||
			`POST Status ${res.status}`
	};
}

export async function PUT<T = any>(fetchFn: typeof fetch, url: string, body: Record<string, any>, headers?: Record<string, string>) {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
	const allHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...(token && { 'x-token': token }),
    ...headers,
	};

	let res: Response, data: unknown;
	try {
		res = await fetchFn(processUrl(url), {
			method: 'PUT',
			headers: allHeaders,
			body: JSON.stringify(body)
		});

		if (res.status === 401) {
			await goto('/login');
			return undefined as T;
		}

		data = await res.json();
	} catch (e) {
		console.error(e);
		throw {
			message: `PUT ${url} Failed`
		};
	}

	if (res.ok) return data as T;

	throw {
		message:
			(data && typeof (data as any).message === 'string' ? (data as any).message : undefined) ||
			`PUT Status ${res.status}`
	};
}

export async function PATCH<T = any>(
	fetchFn: typeof fetch,
	url: string,
	body: Record<string, any>
) {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(token && { 'x-token': token })
	};

	let res: Response, data: unknown;
	try {
		res = await fetchFn(processUrl(url), {
			method: 'PATCH',
			headers,
			body: JSON.stringify(body)
		});

		if (res.status === 401) {
			await goto('/login');
			return undefined as T;
		}

		data = await res.json();
	} catch (e: any) {
		throw {
			message: `PATCH ${url} Failed`,
			...e
		};
	}

	if (res.ok) return data as T;

	throw {
		message:
			(data && typeof (data as any).message === 'string' ? (data as any).message : undefined) ||
			`PATCH Status ${res.status}`
	};
}
