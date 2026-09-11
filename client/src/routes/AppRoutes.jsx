import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import RouteErrorBoundary from '../components/feedback/RouteErrorBoundary.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';

const HomePage = lazy(() => import('../pages/HomePage.jsx'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage.jsx'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage.jsx'));
const ComparisonPage = lazy(() => import('../pages/ComparisonPage.jsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'));
const AccountPage = lazy(() => import('../pages/AccountPage.jsx'));
const AccountSettingsPage = lazy(() => import('../pages/AccountSettingsPage.jsx'));
const ContributePage = lazy(() => import('../pages/ContributePage.jsx'));
const MySubmissionsPage = lazy(() => import('../pages/MySubmissionsPage.jsx'));
const EditSubmissionPage = lazy(() => import('../pages/EditSubmissionPage.jsx'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage.jsx'));
const CollectionsPage = lazy(() => import('../pages/CollectionsPage.jsx'));
const CollectionDetailPage = lazy(() => import('../pages/CollectionDetailPage.jsx'));
const JournalPage = lazy(() => import('../pages/JournalPage.jsx'));
const ArticleDetailPage = lazy(() => import('../pages/ArticleDetailPage.jsx'));
const BrandsPage = lazy(() => import('../pages/BrandsPage.jsx'));
const BrandDetailPage = lazy(() => import('../pages/BrandDetailPage.jsx'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage.jsx'));
const CategoryDetailPage = lazy(() => import('../pages/CategoryDetailPage.jsx'));
const SearchPage = lazy(() => import('../pages/SearchPage.jsx'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage.jsx'));
const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverviewPage.jsx'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage.jsx'));
const AdminProductFormPage = lazy(() => import('../pages/admin/AdminProductFormPage.jsx'));
const AdminApprovalsPage = lazy(() => import('../pages/admin/AdminApprovalsPage.jsx'));
const AdminBrandsPage = lazy(() => import('../pages/admin/AdminBrandsPage.jsx'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage.jsx'));
const AdminArticlesPage = lazy(() => import('../pages/admin/AdminArticlesPage.jsx'));
const AdminMediaPage = lazy(() => import('../pages/admin/AdminMediaPage.jsx'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage.jsx'));
const AdminAuditPage = lazy(() => import('../pages/admin/AdminAuditPage.jsx'));
const AdminAnalyticsPage = lazy(() => import('../pages/admin/AdminAnalyticsPage.jsx'));

/** Error boundary that resets itself when the route changes. */
function LocationAwareBoundary({ children }) {
  const location = useLocation();
  return <RouteErrorBoundary resetKey={location.pathname}>{children}</RouteErrorBoundary>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <LocationAwareBoundary>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="compare" element={<ComparisonPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="brands/:slug" element={<BrandDetailPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:slug" element={<CategoryDetailPage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="journal/:slug" element={<ArticleDetailPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<AuthenticatedLayout />}>
              <Route path="account" element={<AccountPage />} />
              <Route path="account/settings" element={<AccountSettingsPage />} />
              <Route path="account/submissions" element={<MySubmissionsPage />} />
              <Route path="account/submissions/:id/edit" element={<EditSubmissionPage />} />
              <Route path="contribute" element={<ContributePage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="collections/:id" element={<CollectionDetailPage />} />
            </Route>

            <Route path="admin/login" element={<AdminLoginPage />} />

            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="brands" element={<AdminBrandsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
      </LocationAwareBoundary>
    </BrowserRouter>
  );
}
