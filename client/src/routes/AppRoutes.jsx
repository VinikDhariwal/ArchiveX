import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import PlaceholderPage from '../pages/PlaceholderPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route
          path="/discover"
          element={
            <PlaceholderPage
              eyebrow="Discover"
              title="The mixed archive feed"
              summary="Discover will show a shuffled feed of cars, motorcycles, and watches — a living multi-domain catalog, not a single-brand dump."
              nextPhase="Phase 7 (feed + filters); route shell in Phase 3"
            />
          }
        />
        <Route
          path="/brands"
          element={
            <PlaceholderPage
              eyebrow="Brands"
              title="Houses, A–Z"
              summary="Brands will list alphabetically by default, with filters for cars, motorcycles, watches, and other domains."
              nextPhase="Phase 11 (full brand index); route shell in Phase 3"
            />
          }
        />
        <Route
          path="/categories"
          element={
            <PlaceholderPage
              eyebrow="Categories"
              title="Taxonomy"
              summary="Category paths for cars, motorcycles, and watches will open here."
              nextPhase="Phase 11"
            />
          }
        />
        <Route
          path="/journal"
          element={
            <PlaceholderPage
              eyebrow="Journal"
              title="Editorial archive"
              summary="Museum essays, model histories, and collector notes will live here."
              nextPhase="Phase 10"
            />
          }
        />
        <Route
          path="/collections"
          element={
            <PlaceholderPage
              eyebrow="Collections"
              title="Private collections"
              summary="Saved collector collections will appear here after authentication."
              nextPhase="Phase 9"
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
