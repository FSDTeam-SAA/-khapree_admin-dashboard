"use client";

import axios from "axios";
import type { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";
import { API_BASE_URL } from "@/lib/env";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const accessToken = session?.accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      const session = await getSession();
      if (session?.error === "RefreshAccessTokenError") {
        await signOut({ callbackUrl: "/login" });
      }
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

