import { env } from "@/config";

function normalizePath(path = "") {
  return path.replace(/^\/+/, "");
}

export function apiUrl(path) {
  return `${env.baseUrl}/${normalizePath(path)}`;
}

export function pingUrl() {
  return apiUrl("ping");
}

export function timeUrl() {
  return apiUrl("time");
}

export function exchangeInfoUrl() {
  return apiUrl("exchangeInfo");
}
