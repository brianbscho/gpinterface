export default async function callApi<T, BodyT = object>({
  endpoint,
  method = "GET",
  headers,
  body,
  showError = false,
  redirectToMain = false,
}: {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: BodyT;
  showError?: boolean;
  redirectToMain?: boolean;
}) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_ENDPOINT + endpoint,
      {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify(body),
      }
    );
    if (response?.ok) {
      return response.json() as T;
    } else {
      if (showError) {
        const error = await response.json();
        alert(error.message);
      }
      if (redirectToMain) {
        location.pathname = "/";
      }
    }
  } catch (e) {
    return;
  }
}
