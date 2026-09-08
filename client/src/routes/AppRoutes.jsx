import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import RouteErrorBoundary from '../components/feedback/RouteErrorBoundary.jsx';
import LoadingPage from '../pages/LoadingPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import RouteShellPage from '../pages/RouteShellPage.jsx';

const HomePage = lazy(() => import('../pages/HomePage.jsx'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage.jsx'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage.jsx'));

function shell(props) {
  return <RouteShellPage {...props} />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="home" element={<HomePage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="discover" element={<DiscoverPage />} />
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
              <Route
                path="brands"
                element={shell({
                  eyebrow: 'Brands',
                  title: 'Houses, A–Z',
                  summary: 'Brands will list alphabetically by default, with filters for cars, motorcycles, watches, and other domains.',
                  nextPhase: 'Phase 11',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Brands' },
                  ],
                  links: [{ label: 'View categories', to: '/categories' }],
                })}
              />
              <Route
                path="brands/:slug"
                element={shell({
                  eyebrow: 'Brand',
                  title: 'Brand chamber',
                  summary: 'Individual brand pages with related objects will live at this route.',
                  nextPhase: 'Phase 11',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Brands', to: '/brands' },
                    { label: 'Brand' },
                  ],
                })}
              />
              <Route
                path="categories"
                element={shell({
                  eyebrow: 'Categories',
                  title: 'Taxonomy',
                  summary: 'Category paths for cars, motorcycles, and watches will open here.',
                  nextPhase: 'Phase 11',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Categories' },
                  ],
                })}
              />
              <Route
                path="categories/:slug"
                element={shell({
                  eyebrow: 'Category',
                  title: 'Category chamber',
                  summary: 'Domain taxonomy detail pages will resolve here.',
                  nextPhase: 'Phase 11',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Categories', to: '/categories' },
                    { label: 'Category' },
                  ],
                })}
              />
              <Route
                path="journal"
                element={shell({
                  eyebrow: 'Journal',
                  title: 'Editorial archive',
                  summary: 'Museum essays, model histories, and collector notes will live here.',
                  nextPhase: 'Phase 10',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Journal' },
                  ],
                })}
              />
              <Route
                path="journal/:slug"
                element={shell({
                  eyebrow: 'Article',
                  title: 'Journal essay',
                  summary: 'Long-form editorial articles will resolve at this route.',
                  nextPhase: 'Phase 10',
                  breadcrumbs: [
                    { label: 'Home', to: '/' },
                    { label: 'Journal', to: '/journal' },
                    { label: 'Article' },
                  ],
                })}
              />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<AuthenticatedLayout />}>
              <Route
                path="account"
                element={shell({
                  eyebrow: 'Account',
                  title: 'Collector account',
                  summary: 'Profile and settings will appear here after authentication.',
                  nextPhase: 'Phase 6',
                })}
              />
              <Route
                path="favorites"
                element={shell({
                  eyebrow: 'Favorites',
                  title: 'Saved objects',
                  summary: 'Authenticated favorites will sync here.',
                  nextPhase: 'Phase 9',
                  links: [{ label: 'Compare shell', to: '/compare' }],
                })}
              />
              <Route
                path="collections"
                element={shell({
                  eyebrow: 'Collections',
                  title: 'Private collections',
                  summary: 'Saved collector collections will appear here after authentication.',
                  nextPhase: 'Phase 9',
                })}
              />
              <Route
                path="collections/:id"
                element={shell({
                  eyebrow: 'Collection',
                  title: 'Collection detail',
                  summary: 'A single private collection will open at this route.',
                  nextPhase: 'Phase 9',
                  breadcrumbs: [
                    { label: 'Collections', to: '/collections' },
                    { label: 'Detail' },
                  ],
                })}
              />
              <Route
                path="compare"
                element={shell({
                  eyebrow: 'Compare',
                  title: 'Object comparison',
                  summary: 'Side-by-side comparison of archived objects will live here.',
                  nextPhase: 'Phase 9',
                })}
              />
            </Route>

            <Route path="admin" element={<AdminLayout />}>
              <Route
                index
                element={shell({
                  eyebrow: 'Admin',
                  title: 'Operations overview',
                  summary: 'Admin analytics and shortcuts will land here. Authorization is not enforced yet.',
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
                  nextPhase: 'Phase 10 / 13',
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
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
