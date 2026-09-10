import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import RouteErrorBoundary from '../components/feedback/RouteErrorBoundary.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import RouteShellPage from '../pages/RouteShellPage.jsx';

const HomePage = lazy(() => import('../pages/HomePage.jsx'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage.jsx'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage.jsx'));
const ComparisonPage = lazy(() => import('../pages/ComparisonPage.jsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'));
const AccountPage = lazy(() => import('../pages/AccountPage.jsx'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage.jsx'));
const CollectionsPage = lazy(() => import('../pages/CollectionsPage.jsx'));
const CollectionDetailPage = lazy(() => import('../pages/CollectionDetailPage.jsx'));
const JournalPage = lazy(() => import('../pages/JournalPage.jsx'));
const ArticleDetailPage = lazy(() => import('../pages/ArticleDetailPage.jsx'));
const BrandsPage = lazy(() => import('../pages/BrandsPage.jsx'));
const BrandDetailPage = lazy(() => import('../pages/BrandDetailPage.jsx'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage.jsx'));
const CategoryDetailPage = lazy(() => import('../pages/CategoryDetailPage.jsx'));

function shell(props) {
  return <RouteShellPage {...props} />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="compare" element={<ComparisonPage />} />
              <Route
                path="search"
                element={shell({
                  eyebrow: 'Search',
                  title: 'Search the archive',
                  summary: 'Full-text and faceted search across domains will open here.',
                  nextPhase: 'Phase 12',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Search' },
                  ],
                })}
              />
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
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="collections/:id" element={<CollectionDetailPage />} />
            </Route>

            <Route path="admin" element={<AdminLayout />}>
              <Route
                index
                element={shell({
                  eyebrow: 'Admin',
                  title: 'Operations overview',
                  summary: 'Admin analytics and shortcuts will land here. Catalog CMS continues in Phase 13.',
                  nextPhase: 'Phase 13 / 15',
                  links: [{ label: 'Products', to: '/admin/products' }],
                })}
              />
              <Route
                path="products"
                element={shell({
                  eyebrow: 'Admin · Products',
                  title: 'Product catalog',
                  summary: 'Editors will manage multi-domain products from this list.',
                  nextPhase: 'Phase 13',
                  links: [{ label: 'New product', to: '/admin/products/new' }],
                })}
              />
              <Route
                path="products/new"
                element={shell({
                  eyebrow: 'Admin · Products',
                  title: 'New product',
                  summary: 'Domain-aware create form for cars, motorcycles, watches, and future types.',
                  nextPhase: 'Phase 13',
                })}
              />
              <Route
                path="products/:id/edit"
                element={shell({
                  eyebrow: 'Admin · Products',
                  title: 'Edit product',
                  summary: 'Edit an existing catalog object, including multi-image plates.',
                  nextPhase: 'Phase 13–14',
                })}
              />
              <Route
                path="brands"
                element={shell({
                  eyebrow: 'Admin · Brands',
                  title: 'Brand management',
                  summary: 'Create and edit houses in the archive.',
                  nextPhase: 'Phase 13',
                })}
              />
              <Route
                path="categories"
                element={shell({
                  eyebrow: 'Admin · Categories',
                  title: 'Category management',
                  summary: 'Maintain domain taxonomy trees.',
                  nextPhase: 'Phase 13',
                })}
              />
              <Route
                path="articles"
                element={shell({
                  eyebrow: 'Admin · Journal',
                  title: 'Article management',
                  summary: 'Editorial publishing tools will live here.',
                  nextPhase: 'Phase 13',
                })}
              />
              <Route
                path="users"
                element={shell({
                  eyebrow: 'Admin · Users',
                  title: 'User management',
                  summary: 'Role and account administration for editors and collectors.',
                  nextPhase: 'Phase 13',
                })}
              />
              <Route
                path="audit"
                element={shell({
                  eyebrow: 'Admin · Audit',
                  title: 'Audit log',
                  summary: 'Immutable operational history for catalog and user changes.',
                  nextPhase: 'Phase 13',
                })}
              />
              <Route
                path="analytics"
                element={shell({
                  eyebrow: 'Admin · Analytics',
                  title: 'Basic analytics',
                  summary: 'Views, favorites, and catalog health signals.',
                  nextPhase: 'Phase 15',
                })}
              />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
