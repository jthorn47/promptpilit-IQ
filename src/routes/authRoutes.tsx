import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

// Lazy loaded auth components
const Auth = lazy(() => import("@/pages/Auth"));
const OAuthCallback = lazy(() => import("@/pages/OAuthCallback"));

/**
 * Authentication-related routes
 */
export const AuthRoutes = () => (
  <Routes>
    <Route index element={<Auth />} />
    <Route path="login" element={<Auth />} />
    <Route path="callback" element={<OAuthCallback />} />
  </Routes>
);