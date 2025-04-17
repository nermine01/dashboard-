import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Util/Theme/theme-provider";
import { AlertProvider } from "./Util/Alerts/AlertContext";
import Dashboard from "./pages/Dashboard";
import AlertDetailsPage from "./pages/DetailsPage/AlertDetailsPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="alert-dashboard-theme">
      <AlertProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts/:id" element={<AlertDetailsPage />} />
            </Routes>
          </div>
        </Router>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
