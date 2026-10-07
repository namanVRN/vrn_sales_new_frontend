// frontend/src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Layout from '../components/common/Layout';

// Eager
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

// Public
import EnquiryForm from '../pages/public/EnquiryForm';

// Lazy pages
const QualificationList = lazy(() => import('../pages/qualification/QualificationList'));
const SiteVisitScheduling = lazy(() => import('../pages/siteVisit/SiteVisitScheduling'));
const SiteVisitExecution = lazy(() => import('../pages/siteVisit/SiteVisitExecution'));
const PostVisitFollowup = lazy(() => import('../pages/postVisit/PostVisitFollowup'));
const DealList = lazy(() => import('../pages/deal/DealList'));

// Admin lazy pages
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const ProjectManagement = lazy(() => import('../pages/admin/ProjectManagement'));
const HolidayManagement = lazy(() => import('../pages/admin/HolidayManagement'));
const Reports = lazy(() => import('../pages/admin/Reports'));

// Audit lazy pages
const ActivityTracker = lazy(() => import('../pages/admin/ActivityTracker'));
const LeadMonitor = lazy(() => import('../pages/audit/LeadMonitor'));

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-full py-20">
        <LoadingSpinner size="lg" text="Loading page..." />
      </div>
    }
  >
    {children}
  </Suspense>
);

const PageWrapper = ({ children }) => (
  <Layout>
    <SuspenseWrapper>{children}</SuspenseWrapper>
  </Layout>
);

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="xl" text="Loading VRN CRM..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/enquiry" element={<EnquiryForm />} />

      {/* LOGIN */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />

        {/* PIPELINE */}
        <Route
          path="/qualification"
          element={
            <RoleRoute roles={['ADMIN', 'BDM']}>
              <PageWrapper><QualificationList /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/site-visit-scheduling"
          element={
            <RoleRoute roles={['ADMIN', 'BDM']}>
              <PageWrapper><SiteVisitScheduling /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/site-visit-execution"
          element={
            <RoleRoute roles={['ADMIN', 'BDM', 'ADVISOR']}>
              <PageWrapper><SiteVisitExecution /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/post-visit"
          element={
            <RoleRoute roles={['ADMIN', 'ADVISOR']}>
              <PageWrapper><PostVisitFollowup /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/deal"
          element={
            <RoleRoute roles={['ADMIN', 'ADVISOR']}>
              <PageWrapper><DealList /></PageWrapper>
            </RoleRoute>
          }
        />

        {/* AUDIT */}
        <Route
          path="/audit/leads"
          element={
            <RoleRoute roles={['ADMIN', 'PC', 'AUDITOR']}>
              <PageWrapper><LeadMonitor /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/activity-tracker"
          element={
            <RoleRoute roles={['ADMIN', 'PC', 'AUDITOR']}>
              <PageWrapper><ActivityTracker /></PageWrapper>
            </RoleRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute roles={['ADMIN']}>
              <PageWrapper><UserManagement /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/projects"
          element={
            <RoleRoute roles={['ADMIN']}>
              <PageWrapper><ProjectManagement /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/holidays"
          element={
            <RoleRoute roles={['ADMIN']}>
              <PageWrapper><HolidayManagement /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <RoleRoute roles={['ADMIN']}>
              <PageWrapper><Reports /></PageWrapper>
            </RoleRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;