import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GroupPage from "./pages/GroupPage";
import GamePage from "./pages/GamePage";
// Nuevo: Layout para el dashboard (simulando una barra lateral)
import DashboardLayout from "./components/DashboardLayout"; 

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/groups" element={<GroupPage />} />
        {/* Usamos el nuevo layout para la página de juego */}
        <Route path="/game" element={<DashboardLayout />}> 
          <Route index element={<GamePage />} />
          {/* Aquí podrías añadir más rutas como /game/config, /game/stats, etc. */}
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}




