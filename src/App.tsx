import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Import Pages
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Chat1 from "./pages/Chat1"; // Groceries
import Chat2 from "./pages/Chat2"; // Transport
import Chat3 from "./pages/Chat3"; // Shopping
import Chat5 from "./pages/Chat5"; // Nykaa
import Chat6 from "./pages/Chat6"; // JioMart

// Import the specific Food Chat Component
// Ensure the file is actually named "HomeScreen.tsx" inside components/home/
import HomeScreen from "./components/home/HomeScreen"; 

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        {/* Intro / Login Page */}
        <Route
          path="/"
          element={
            !loggedIn ? (
              <Intro onLoginSuccess={() => setLoggedIn(true)} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Main Dashboard (The page with the BG image) */}
        <Route
          path="/home"
          element={loggedIn ? <Home /> : <Navigate to="/" replace />}
        />

        {/* --- Chat Routes --- */}

        {/* Groceries */}
        <Route
          path="/groceries"
          element={loggedIn ? <Chat1 /> : <Navigate to="/" replace />}
        />

        {/* Transport */}
        <Route
          path="/transport"
          element={loggedIn ? <Chat2 /> : <Navigate to="/" replace />}
        />

        {/* Shopping */}
        <Route
          path="/shopping"
          element={loggedIn ? <Chat3 /> : <Navigate to="/" replace />}
        />

        {/* FOOD ROUTE - Displays the Swiggy Chat Interface */}
        <Route
          path="/food"
          element={loggedIn ? <HomeScreen /> : <Navigate to="/" replace />}
        />

        {/* Beauty */}
        <Route
          path="/nykaa"
          element={loggedIn ? <Chat5 /> : <Navigate to="/" replace />}
        />

        {/* JioMart */}
        <Route
          path="/jiomart"
          element={loggedIn ? <Chat6 /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}