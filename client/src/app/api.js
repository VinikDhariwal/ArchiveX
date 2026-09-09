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
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      transformResponse: (response) => ({
        items: response?.data || [],
        meta: response?.meta || {},
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((item) => ({ type: 'Product', id: item.slug })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      transformResponse: (response) => response?.data ?? null,
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),
    getBrands: builder.query({
      query: (params = {}) => ({
        url: '/brands',
        params,
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
    getBrandBySlug: builder.query({
      query: (slug) => `/brands/${slug}`,
      transformResponse: (response) => response?.data ?? null,
      providesTags: (_result, _error, slug) => [{ type: 'Brand', id: slug }],
    }),
    getCategories: builder.query({
      query: (params = {}) => ({
        url: '/categories',
        params,
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    getCategoryBySlug: builder.query({
      query: (slug) => `/categories/${slug}`,
      transformResponse: (response) => response?.data ?? null,
      providesTags: (_result, _error, slug) => [{ type: 'Category', id: slug }],
    }),
  }),
});

export const {
  useGetHealthQuery,
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetBrandsQuery,
  useGetBrandBySlugQuery,
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
} = api;
