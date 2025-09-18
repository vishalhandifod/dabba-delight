import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageWrapper from './components/layout/PageWrapper';
import ProtectedRoute from './components/layout/ProtectedRoute';

import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import ProductsPage from './pages/ProductsPage';
import FeedbackPage from './pages/FeedbackPage';
import ContactUsPage from './pages/ContactUsPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import HousewifeDashboard from './pages/dashboards/HousewifeDashboard';
import VendorDashboard from './pages/dashboards/VendorDashboard';
import DeliveryPartnerDashboard from './pages/dashboards/DeliveryPartnerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import UsersList from './pages/UsersList';
import MenuPage from './pages/MenuPage';
import ItemPage from './pages/ItemPage';
import OrderPage from './pages/OrderPage';
import AddressPage from './pages/AddressPage';
import KitchenAddressPage from './pages/KitchenAddressPage';

function App() {
  React.useEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
    return () => {
      html.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <PageWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutUsPage />} />

                <Route path="/products" element={<ProductsPage />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/menus" element={<MenuPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />
                <Route path="/userlist" element={<UsersList />} />
                <Route path="/item/menu/:menuId" element={<ItemPage />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/users/:userId/addresses" element={<AddressPage />} />
                <Route path="/kitchen-addresses" element={<KitchenAddressPage />} />
                <Route path="/kitchen-address/menu/:menuId" element={<KitchenAddressPage />} />
                <Route path="/dashboard/customer" element={<CustomerDashboard />} />
                <Route path="/dashboard/housewife" element={<HousewifeDashboard />} />
                <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                <Route path="/dashboard/delivery" element={<DeliveryPartnerDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </PageWrapper>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;