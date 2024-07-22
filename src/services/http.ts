import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { InternalAxiosRequestConfig } from 'axios';
import { addTiming, addError } from './datadog';

// Extend InternalAxiosRequestConfig to include metadata
interface InternalAxiosRequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: { startTime: Date };
}

const axiosInstance: AxiosInstance = axios.create({
  timeout: 10000, // request timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfigWithMetadata): InternalAxiosRequestConfigWithMetadata => {
    // Start tracking request timing
    config.metadata = { startTime: new Date() };
    return config;
  },
  error => {
    // Log request error
    addError(error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    const responseConfig = response.config as InternalAxiosRequestConfigWithMetadata;
    // Calculate request duration
    if (responseConfig.metadata) {
      const duration = new Date().getTime() - responseConfig.metadata.startTime.getTime();
      const endpoint = responseConfig.url || 'unknown-endpoint';
      addTiming(`response-api-${endpoint}`, duration);
    }

    return response;
  },
  error => {
    // Log response error
    addError(error);
    // Calculate request duration even on error
    if (error.config && error.config.metadata) {
      const duration = new Date().getTime() - error.config.metadata.startTime.getTime();
      const endpoint = error.config.url || 'unknown-endpoint';
      addTiming(`response-api-${endpoint}`, duration);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
