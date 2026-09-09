import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clientConfig } from '../config/clientConfig.js';
import { clearCredentials, setCredentials } from '../features/auth/authSlice.js';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: clientConfig.apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refresh = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refresh.data?.data?.accessToken) {
      api.dispatch(
        setCredentials({
          user: refresh.data.data.user,
          accessToken: refresh.data.data.accessToken,
        })
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Brand', 'Category', 'Article', 'User', 'Health', 'Auth'],
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => '/health',
      providesTags: ['Health'],
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* handled by UI */
        }
      },
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* handled by UI */
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: (response) => response?.data?.user ?? null,
      providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = localStorage.getItem('archivex_access_token');
          if (data && token) {
            dispatch(setCredentials({ user: data, accessToken: token }));
          }
        } catch {
          dispatch(clearCredentials());
        }
      },
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
    getProductFilterSchema: builder.query({
      query: (params = {}) => ({
        url: '/products/filters/schema',
        params,
      }),
      transformResponse: (response) => response?.data ?? null,
      providesTags: [{ type: 'Product', id: 'FILTERS' }],
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
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetProductsQuery,
  useGetProductFilterSchemaQuery,
  useGetProductBySlugQuery,
  useGetBrandsQuery,
  useGetBrandBySlugQuery,
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
} = api;
