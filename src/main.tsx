import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import Collection from './pages/Collection';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductPage from './pages/ProductPage';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/overlays.css';
import './styles/home.css';

// The hosted preview cannot rewrite URLs, so it builds with VITE_ROUTER=hash.
const makeRouter = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter : createBrowserRouter;

const router = makeRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Collection /> },
      { path: '/shop/:slug', element: <ProductPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
