import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import GalleryPage from "./pages/GalleryPage";
import DielinesPage from "./pages/DielinesPage";
import HistoryPage from "./pages/HistoryPage";
import NoteDetailPage from "./pages/NoteDetailPage";
import ProgressPage from "./pages/ProgressPage";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const location = useLocation();
  
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-base-100">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Root route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/gallery" element={
            <ProtectedRoute>
              <Layout>
                <GalleryPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dielines" element={
            <ProtectedRoute>
              <Layout>
                <DielinesPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/measurements/:id" element={
            <ProtectedRoute>
              <Layout>
                <NoteDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Layout>
                <ProgressPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <Layout>
                <HistoryPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default App;