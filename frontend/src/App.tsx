import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/AuthContext"
import { CustomerRoute, AdminRoute } from "@/components/auth/ProtectedRoute"

// Landing Page & Public Verification
import LandingPage from "@/pages/LandingPage"
import VerifyCertificatePage from "@/pages/public/VerifyCertificatePage"

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import AdminLoginPage from "@/pages/auth/AdminLoginPage"

// Customer Dashboard & Sub-pages
import CustomerLayout from "@/components/dashboard/CustomerLayout"
import CustomerDashboardPage from "@/pages/customer/CustomerDashboardPage"
import SubmitDevicePage from "@/pages/customer/SubmitDevicePage"
import MyDevicesPage from "@/pages/customer/MyDevicesPage"
import TrackRequestsPage from "@/pages/customer/TrackRequestsPage"
import CustomerProfilePage from "@/pages/customer/CustomerProfilePage"
import CustomerReportsPage from "@/pages/customer/CustomerReportsPage"
import RefurbishedMarketplacePage from "@/pages/customer/RefurbishedMarketplacePage"
import HelpSupportPage from "@/pages/customer/HelpSupportPage"

// Admin Dashboard & Sub-pages
import AdminLayout from "@/components/dashboard/AdminLayout"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage"
import AdminPickupsPage from "@/pages/admin/AdminPickupsPage"
import AdminDevicesPage from "@/pages/admin/AdminDevicesPage"
import AdminSanitizationPage from "@/pages/admin/AdminSanitizationPage"
import AdminCertificatesPage from "@/pages/admin/AdminCertificatesPage"
import AdminMarketplacePage from "@/pages/admin/AdminMarketplacePage"
import AdminRefurbishmentPage from "@/pages/admin/AdminRefurbishmentPage"
import AdminRecyclingPage from "@/pages/admin/AdminRecyclingPage"
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Public Verification */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify-certificate/:verificationId" element={<VerifyCertificatePage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <CustomerRoute>
                  <CustomerLayout />
                </CustomerRoute>
              }
            >
              <Route index element={<CustomerDashboardPage />} />
              <Route path="devices" element={<MyDevicesPage />} />
              <Route path="submit" element={<SubmitDevicePage />} />
              <Route path="track" element={<TrackRequestsPage />} />
              <Route path="reports" element={<CustomerReportsPage />} />
              <Route path="marketplace" element={<RefurbishedMarketplacePage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
              <Route path="support" element={<HelpSupportPage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="pickups" element={<AdminPickupsPage />} />
              <Route path="devices" element={<AdminDevicesPage />} />
              <Route path="sanitization" element={<AdminSanitizationPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="reports" element={<AdminCertificatesPage />} />
              <Route path="marketplace" element={<AdminMarketplacePage />} />
              <Route path="refurbishment" element={<AdminRefurbishmentPage />} />
              <Route path="recycling" element={<AdminRecyclingPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
