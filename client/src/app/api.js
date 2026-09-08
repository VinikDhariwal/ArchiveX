import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clientConfig } from '../config/clientConfig.js';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: clientConfig.apiBaseUrl,
    credentials: 'include',
  }),
  tagTypes: ['Product', 'Brand', 'Category', 'Article', 'User', 'Health'],
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => '/health',
      providesTags: ['Health'],
    }),
  }),
});

export const { useGetHealthQuery } = api;
