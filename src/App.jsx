import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; 
import GroupPage from './pages/GroupPage';
import CardsShopPage from './pages/CardsShopPage';
import DeadboxPage from './pages/DeadboxPage';
import GamePage from './pages/GamePage';
import UsersPage from './pages/UsersPage';
import DashboardLayout from './components/DashboardLayout';
import { UserGroupProvider } from './contexts/UserGroupContext';
import { CartProvider } from './contexts/CartContext';

export default function App() {
  return (
    <UserGroupProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/groups" element={<GroupPage />} />
            <Route path="/dashboard/*" element={<DashboardLayout />} />
            <Route path="/shop" element={<CardsShopPage />} />
            <Route path="/deadbox" element={<DeadboxPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/" element={<LoginPage />} /> 
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </UserGroupProvider>
  );
}