import { client } from "#/http/.kubb/client";

client.setConfig({
	baseURL: import.meta.env.VITE_API_URL,
	options: {
		withCredentials: true,
	},
	// Generated hooks call with `throwOnError: true`, which is meant to leave `validateStatus`
	// unset so it falls back to axios's own 2xx-only default. In practice an explicit
	// `validateStatus: undefined` on the per-call config makes axios accept any status instead
	// (it only falls back to the instance default when the key is absent, not merely `undefined`),
	// so every non-2xx response was resolving as "success" with empty data instead of throwing.
	// Setting it here, explicitly, is what actually restores the 2xx-only behavior.
	validateStatus: (status) => status >= 200 && status < 300,
});

if (import.meta.env.SSR) {
	// `withCredentials` only makes the browser attach cookies; on the server there's no
	// browser, so the incoming request's cookie needs to be forwarded by hand or every
	// protected loader/beforeLoad call gets a 401 during SSR.
	client.interceptors.request.use(async (config) => {
		const { getRequestHeader } = await import("@tanstack/react-start/server");
		const cookie = getRequestHeader("cookie");

		if (cookie) {
			config.headers.set("cookie", cookie);
		}

		return config;
	});
}

export { client };

export default client;
