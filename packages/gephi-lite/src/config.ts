import { version } from "../package.json";

const DEFAULT_GITHUB_PROXY =
  import.meta.env.VITE_GITHUB_PROXY ||
  (import.meta.env.DEV ? "/_github" : "/.netlify/functions/github-proxy");

export const config = {
  version,
  website_url: "https://github.com/gephi/gephi-lite#readme",
  notificationTimeoutMs: 3000,
  github_proxy: DEFAULT_GITHUB_PROXY,
  github: {
    client_id: "938f561199e6e55c739b",
    scopes: ["gist"],
  },
  matomo: {
    urlBase: import.meta.env.VITE_MATOMO_URL,
    siteId: import.meta.env.VITE_MATOMO_SITEID || 0,
    heartBeat: {
      active: true,
      seconds: 15,
    },
    configurations: {
      disableCookies: true,
      setSecureCookie: true,
      setRequestMethod: "POST",
    },
  },
};
