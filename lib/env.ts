const DEFAULT_BASE_URL = "http://localhost:5000/api/v1";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTPUBLICBASEURL ||
  DEFAULT_BASE_URL;

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

