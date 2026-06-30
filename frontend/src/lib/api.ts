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
	const response = await fetchWithAuth(`${baseUrl}${endpoint}`, options);

	if (response.status === 401 && typeof window !== "undefined") {
		// Redirect to login page if token has expired or is unauthorized
		window.location.href = "/login";
	}

	return response;
}
