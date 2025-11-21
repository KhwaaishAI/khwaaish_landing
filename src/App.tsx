import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Intro from "./pages/Intro";
import Home from "./pages/Home"; // You will create this next
import Chat1 from "./pages/Chat1";
import Chat2 from "./pages/Chat2";
import Chat3 from "./pages/Chat3";
import Chat4 from "./pages/Chat4";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

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

        {/* Home (4 cards) */}
        <Route
          path="/home"
          element={loggedIn ? <Home /> : <Navigate to="/" replace />}
        />

        {/* Chat Pages */}
        <Route
          path="/groceries"
          element={loggedIn ? <Chat1 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/chat2"
          element={loggedIn ? <Chat2 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/chat3"
          element={loggedIn ? <Chat3 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/chat4"
          element={loggedIn ? <Chat4 /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
