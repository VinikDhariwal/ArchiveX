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
  tagTypes: [
    'Product',
    'Brand',
    'Category',
    'Article',
    'User',
    'Health',
    'Auth',
    'Favorite',
    'Collection',
    'RecentlyViewed',
    'AdminOverview',
    'AdminAnalytics',
    'AdminProduct',
    'AdminBrand',
    'AdminCategory',
    'AdminArticle',
    'AdminUser',
    'AdminAudit',
    'AdminMedia',
  ],
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
    updateMe: builder.mutation({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      transformResponse: (response) => response?.data?.user ?? null,
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const token = getState().auth?.accessToken;
          if (data && token) {
            dispatch(setCredentials({ user: data, accessToken: token }));
          }
        } catch {
          /* handled by UI */
        }
      },
    }),
    changeEmail: builder.mutation({
      query: (body) => ({ url: '/auth/me/email', method: 'PATCH', body }),
      transformResponse: (response) => response?.data?.user ?? null,
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const token = getState().auth?.accessToken;
          if (data && token) {
            dispatch(setCredentials({ user: data, accessToken: token }));
          }
        } catch {
          /* handled by UI */
        }
      },
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/me/password', method: 'PATCH', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user && data?.accessToken) {
            dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
          }
        } catch {
          /* handled by UI */
        }
      },
    }),
    deleteMe: builder.mutation({
      query: (body) => ({ url: '/auth/me', method: 'DELETE', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
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
    recordProductView: builder.mutation({
      query: ({ id, sessionKey, source = 'detail' }) => ({
        url: `/products/${id}/view`,
        method: 'POST',
        body: { sessionKey, source },
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: [{ type: 'RecentlyViewed', id: 'LIST' }],
    }),
    getRelatedProducts: builder.query({
      query: ({ id, limit = 6 }) => ({
        url: `/products/${id}/related`,
        params: { limit },
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: (_result, _error, arg) => [{ type: 'Product', id: `RELATED-${arg.id}` }],
    }),
    getRecommendedProducts: builder.query({
      query: (params = {}) => ({
        url: '/products/recommended',
        params,
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: [{ type: 'Product', id: 'RECOMMENDED' }],
    }),
    getProductJournal: builder.query({
      query: (id) => `/products/${id}/journal`,
      transformResponse: (response) => ({
        items: response?.data || [],
        meta: response?.meta || {},
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id: `JOURNAL-${id}` }],
    }),
    getArticles: builder.query({
      query: (params = {}) => ({
        url: '/articles',
        params,
      }),
      transformResponse: (response) => ({
        items: response?.data || [],
        meta: response?.meta || {},
      }),
      providesTags: [{ type: 'Article', id: 'LIST' }],
    }),
    getArticleBySlug: builder.query({
      query: (slug) => `/articles/${slug}`,
      transformResponse: (response) => response?.data ?? null,
      providesTags: (_result, _error, slug) => [{ type: 'Article', id: slug }],
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
    getFavorites: builder.query({
      query: () => '/favorites',
      transformResponse: (response) => response?.data || [],
      providesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
    addFavorite: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
    removeFavorite: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
    getCollections: builder.query({
      query: () => '/collections',
      transformResponse: (response) => response?.data || [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((item) => ({ type: 'Collection', id: item.id })),
              { type: 'Collection', id: 'LIST' },
            ]
          : [{ type: 'Collection', id: 'LIST' }],
    }),
    getCollection: builder.query({
      query: (id) => `/collections/${id}`,
      transformResponse: (response) => response?.data ?? null,
      providesTags: (_result, _error, id) => [{ type: 'Collection', id }],
    }),
    createCollection: builder.mutation({
      query: (body) => ({
        url: '/collections',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: [{ type: 'Collection', id: 'LIST' }],
    }),
    updateCollection: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/collections/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Collection', id: arg.id },
        { type: 'Collection', id: 'LIST' },
      ],
    }),
    deleteCollection: builder.mutation({
      query: (id) => ({
        url: `/collections/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: [{ type: 'Collection', id: 'LIST' }],
    }),
    addProductToCollection: builder.mutation({
      query: ({ collectionId, productId }) => ({
        url: `/collections/${collectionId}/products/${productId}`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Collection', id: arg.collectionId },
        { type: 'Collection', id: 'LIST' },
      ],
    }),
    removeProductFromCollection: builder.mutation({
      query: ({ collectionId, productId }) => ({
        url: `/collections/${collectionId}/products/${productId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? null,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Collection', id: arg.collectionId },
        { type: 'Collection', id: 'LIST' },
      ],
    }),
    getRecentlyViewed: builder.query({
      query: (params = {}) => ({
        url: '/products/recently-viewed',
        params,
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: [{ type: 'RecentlyViewed', id: 'LIST' }],
    }),

    getAdminOverview: builder.query({
      query: () => '/admin/overview',
      transformResponse: (response) => response?.data || {},
      providesTags: ['AdminOverview'],
    }),
    getAdminAnalytics: builder.query({
      query: () => '/admin/analytics',
      transformResponse: (response) => response?.data || null,
      providesTags: ['AdminAnalytics'],
    }),
    getAdminProducts: builder.query({
      query: (params = {}) => ({ url: '/admin/products', params }),
      transformResponse: (response) => ({
        items: response?.data || [],
        meta: response?.meta || {},
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: 'AdminProduct', id })),
              { type: 'AdminProduct', id: 'LIST' },
            ]
          : [{ type: 'AdminProduct', id: 'LIST' }],
    }),
    getAdminProduct: builder.query({
      query: (id) => `/admin/products/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_result, _error, id) => [{ type: 'AdminProduct', id }],
    }),
    createAdminProduct: builder.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [
        { type: 'AdminProduct', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        { type: 'Product', id: 'LIST' },
      ],
    }),
    updateAdminProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminProduct', id: arg.id },
        { type: 'AdminProduct', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        { type: 'Product', id: 'LIST' },
      ],
    }),
    setAdminProductStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminProduct', id: arg.id },
        { type: 'AdminProduct', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        { type: 'Product', id: 'LIST' },
      ],
    }),
    deleteAdminProduct: builder.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'AdminProduct', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        { type: 'Product', id: 'LIST' },
      ],
    }),
    getAdminBrands: builder.query({
      query: (params = {}) => ({ url: '/admin/brands', params }),
      transformResponse: (response) => response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminBrand', id })),
              { type: 'AdminBrand', id: 'LIST' },
            ]
          : [{ type: 'AdminBrand', id: 'LIST' }],
    }),
    createAdminBrand: builder.mutation({
      query: (body) => ({ url: '/admin/brands', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [{ type: 'AdminBrand', id: 'LIST' }, 'AdminOverview', 'AdminAudit', 'Brand'],
    }),
    updateAdminBrand: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/brands/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminBrand', id: arg.id },
        { type: 'AdminBrand', id: 'LIST' },
        'AdminAudit',
        'Brand',
      ],
    }),
    deleteAdminBrand: builder.mutation({
      query: (id) => ({ url: `/admin/brands/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminBrand', id: 'LIST' }, 'AdminOverview', 'AdminAudit', 'Brand'],
    }),
    getAdminCategories: builder.query({
      query: (params = {}) => ({ url: '/admin/categories', params }),
      transformResponse: (response) => response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminCategory', id })),
              { type: 'AdminCategory', id: 'LIST' },
            ]
          : [{ type: 'AdminCategory', id: 'LIST' }],
    }),
    createAdminCategory: builder.mutation({
      query: (body) => ({ url: '/admin/categories', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [
        { type: 'AdminCategory', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        'Category',
      ],
    }),
    updateAdminCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/categories/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminCategory', id: arg.id },
        { type: 'AdminCategory', id: 'LIST' },
        'AdminAudit',
        'Category',
      ],
    }),
    deleteAdminCategory: builder.mutation({
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'AdminCategory', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        'Category',
      ],
    }),
    getAdminArticles: builder.query({
      query: (params = {}) => ({ url: '/admin/articles', params }),
      transformResponse: (response) => response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminArticle', id })),
              { type: 'AdminArticle', id: 'LIST' },
            ]
          : [{ type: 'AdminArticle', id: 'LIST' }],
    }),
    getAdminArticle: builder.query({
      query: (id) => `/admin/articles/${id}`,
      transformResponse: (response) => response?.data,
      providesTags: (_r, _e, id) => [{ type: 'AdminArticle', id }],
    }),
    createAdminArticle: builder.mutation({
      query: (body) => ({ url: '/admin/articles', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [
        { type: 'AdminArticle', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        'Article',
      ],
    }),
    updateAdminArticle: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/articles/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminArticle', id: arg.id },
        { type: 'AdminArticle', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        'Article',
      ],
    }),
    deleteAdminArticle: builder.mutation({
      query: (id) => ({ url: `/admin/articles/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'AdminArticle', id: 'LIST' },
        'AdminOverview',
        'AdminAudit',
        'Article',
      ],
    }),
    getAdminUsers: builder.query({
      query: () => '/admin/users',
      transformResponse: (response) => response?.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'AdminUser', id })), { type: 'AdminUser', id: 'LIST' }]
          : [{ type: 'AdminUser', id: 'LIST' }],
    }),
    createAdminUser: builder.mutation({
      query: (body) => ({ url: '/admin/users', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [{ type: 'AdminUser', id: 'LIST' }, 'AdminOverview', 'AdminAudit'],
    }),
    updateAdminUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'AdminUser', id: arg.id },
        { type: 'AdminUser', id: 'LIST' },
        'AdminAudit',
      ],
    }),
    getAdminAudit: builder.query({
      query: (params = {}) => ({ url: '/admin/audit', params }),
      transformResponse: (response) => response?.data || [],
      providesTags: ['AdminAudit'],
    }),
    getAdminMedia: builder.query({
      query: (params = {}) => ({ url: '/admin/media', params }),
      transformResponse: (response) => response?.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminMedia', id })),
              { type: 'AdminMedia', id: 'LIST' },
            ]
          : [{ type: 'AdminMedia', id: 'LIST' }],
    }),
    uploadAdminMedia: builder.mutation({
      query: ({ file, alt = '', type = 'gallery' }) => {
        const body = new FormData();
        body.append('file', file);
        if (alt) body.append('alt', alt);
        if (type) body.append('type', type);
        return { url: '/admin/media/upload', method: 'POST', body };
      },
      transformResponse: (response) => response?.data,
      invalidatesTags: [{ type: 'AdminMedia', id: 'LIST' }, 'AdminAudit'],
    }),
    registerAdminMediaUrl: builder.mutation({
      query: (body) => ({ url: '/admin/media/url', method: 'POST', body }),
      transformResponse: (response) => response?.data,
      invalidatesTags: [{ type: 'AdminMedia', id: 'LIST' }, 'AdminAudit'],
    }),
    deleteAdminMedia: builder.mutation({
      query: (id) => ({ url: `/admin/media/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminMedia', id: 'LIST' }, 'AdminAudit'],
    }),
  }),
});

export const {
  useGetHealthQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteMeMutation,
  useGetProductsQuery,
  useGetProductFilterSchemaQuery,
  useGetProductBySlugQuery,
  useRecordProductViewMutation,
  useGetRelatedProductsQuery,
  useGetRecommendedProductsQuery,
  useGetProductJournalQuery,
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useGetBrandsQuery,
  useGetBrandBySlugQuery,
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddProductToCollectionMutation,
  useRemoveProductFromCollectionMutation,
  useGetRecentlyViewedQuery,
  useGetAdminOverviewQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useSetAdminProductStatusMutation,
  useDeleteAdminProductMutation,
  useGetAdminBrandsQuery,
  useCreateAdminBrandMutation,
  useUpdateAdminBrandMutation,
  useDeleteAdminBrandMutation,
  useGetAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useGetAdminArticlesQuery,
  useGetAdminArticleQuery,
  useCreateAdminArticleMutation,
  useUpdateAdminArticleMutation,
  useDeleteAdminArticleMutation,
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useGetAdminAuditQuery,
  useGetAdminMediaQuery,
  useUploadAdminMediaMutation,
  useRegisterAdminMediaUrlMutation,
  useDeleteAdminMediaMutation,
} = api;
