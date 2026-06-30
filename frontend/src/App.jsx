import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import CitizenLayout from "./components/layout/CitizenLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ShelterFinderPage from "./pages/ShelterFinderPage";
import SosPage from "./pages/SosPage";
import AssistantPage from "./pages/AssistantPage";
import MenuPage from "./pages/MenuPage";
import RescueDashboardPage from "./pages/RescueDashboardPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Citizen-facing routes share the bottom-nav + persistent SOS layout.
                SOS and Shelter Finder are intentionally NOT behind ProtectedRoute —
                per the PRD, emergency reporting must never require login. */}
            <Route element={<CitizenLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/shelter-finder" element={<ShelterFinderPage />} />
              <Route path="/sos" element={<SosPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/menu" element={<MenuPage />} />
            </Route>

            <Route
              path="/rescue"
              element={
                <ProtectedRoute allowedRoles={["rescue_team", "authority", "admin"]}>
                  <RescueDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
