// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/registration';
import CustomerDashboard from './components/CustomerDashboard';
import MyGoats from './components/MyGoats';
import AddGoat from './components/AddGoat';
import AdminDashboard from './components/AdminDashboard'; // ✅ NEW IMPORT
import BuyGoats from './components/BuyGoats';
import Wishlist from './components/Wishlist';
import PurchasedGoats from './components/PurchasedGoats';
import BidHistory from './components/BidHistory';
import Campaigns from './components/Campaigns';
import ViewCampaigns from './components/ViewCampaigns';
import CampaignContributors from './components/CampaignContributors';
import MyContributions from './components/MyContributions';




function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/my-goats" element={<MyGoats />} />
        <Route path="/add-goat" element={<AddGoat />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* ✅ NEW ROUTE */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/buy-goats" element={<BuyGoats />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/purchased-goats" element={<PurchasedGoats />} />
        <Route path="/bid-history" element={<BidHistory />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaign-market" element={<ViewCampaigns />} />
        <Route path="/campaign/:id/contributors" element={<CampaignContributors />} />
        <Route path="/my-contributions" element={<MyContributions />} />

      </Routes>
    </div>
  );
}

export default App;
