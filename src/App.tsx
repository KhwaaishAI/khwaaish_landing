import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Chat1 from "./pages/Chat1";
import Chat2 from "./pages/Chat2";
import Chat3 from "./pages/Chat3";
import Chat4 from "./pages/Chat4";
import Chat5 from "./pages/Nykaa";
import Chat6 from "./pages/Chat6";
import Chat7 from "./pages/Chat7";
import Chat8 from "./pages/Chat8";
import Ola from "./pages/Ola";
import Pharmeasy from "./pages/Pharmeasy";
import Instamart from "./pages/Instamart";
import Booking from "./pages/Booking";
import Agoda from "./pages/Agoda";
import Airbnb from "./pages/Airbnb";
import SwiggyDineoutChat from "./pages/Swiggy_DIneout";
import UnifiedLanding from "./pages/UnifiedLanding";
import WestsideChat from "./pages/Westside";
import PantaloonsChat from "./pages/Pantaloons";
import Flipkart from "./pages/Flipkart";
import Amazon from "./pages/Amazon";
import Combined from "./pages/Combined";
import UnifiedChat from "./pages/Unified";
import TataCliq from "./pages/TataCliq";

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
          path="/shopping"
          element={loggedIn ? <Chat3 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/food"
          element={loggedIn ? <Chat4 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/nykaa"
          element={loggedIn ? <Chat5 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/westside"
          element={loggedIn ? <WestsideChat /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pantaloons"
          element={loggedIn ? <PantaloonsChat /> : <Navigate to="/" replace />}
        />
        <Route
          path="/jiomart"
          element={loggedIn ? <Chat6 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/tatacliq"
          element={loggedIn ? <Chat7 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/dmart"
          element={loggedIn ? <Chat8 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/ola"
          element={loggedIn ? <Ola /> : <Navigate to="/" replace />}
        />
        <Route
          path="/pharmeasy"
          element={loggedIn ? <Pharmeasy /> : <Navigate to="/" replace />}
        />
        <Route
          path="/instamart"
          element={loggedIn ? <Instamart /> : <Navigate to="/" replace />}
        />
        <Route
          path="/booking"
          element={loggedIn ? <Booking /> : <Navigate to="/" replace />}
        />
        <Route
          path="/agoda"
          element={loggedIn ? <Agoda /> : <Navigate to="/" replace />}
        />
        <Route
          path="/airbnb"
          element={loggedIn ? <Airbnb /> : <Navigate to="/" replace />}
        />
        <Route
          path="/flipkart"
          element={loggedIn ? <Flipkart /> : <Navigate to="/" replace />}
        />
        <Route
          path="/amazon"
          element={loggedIn ? <Amazon /> : <Navigate to="/" replace />}
        />
        <Route
          path="/swiggy-dineout"
          element={
            loggedIn ? <SwiggyDineoutChat /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/unified-landing"
          element={loggedIn ? <UnifiedLanding /> : <Navigate to="/" replace />}
        />
        <Route
          path="/combined"
          element={loggedIn ? <Combined /> : <Navigate to="/" replace />}
        />
        <Route
          path="/unified"
          element={loggedIn ? <UnifiedChat /> : <Navigate to="/" replace />}
        />
        <Route
          path="/tata-cliq"
          element={loggedIn ? <TataCliq /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
