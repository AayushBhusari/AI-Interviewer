export async function fetchWithAuth(url: string, options: RequestInit = {}) {
	const headers = new Headers(options.headers);
	headers.set("Content-Type", "application/json");

	return fetch(url, {
		...options,
		headers,
		credentials: "include",
	});
}

export async function callBackendAPI(
	endpoint: string,
	options: RequestInit = {},
) {
	const baseUrl =
		process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
	return fetchWithAuth(`${baseUrl}${endpoint}`, options);
}
