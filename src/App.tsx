import React from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, To } from "react-router-dom";
import Login from "./views/login";
import { MainLayout } from "./views/mainLayout/mainLayout";
import { AuthProvider, useAuth } from "./composables/auth/AuthContext";
import Dashboard from "./views/dashboard";
import SuppliersList from "./views/persons/personsList";
import Persons from "./views/persons";
import PortList from "./views/persons/portList";
import ProductList from "./views/products/productList";
import ShipmentList from "./views/shipments/shipmentList";
import LinerList from "./views/shipments/linerList";
import VesselList from "./views/shipments/vesselList";
import RateList from "./views/shipments/rateList";
import ShipmentListView from "./views/reports/ShipmentListView";
import ShipmentInfo from "./views/shipments/shipmentInfo";
import Shipment from "./views/shipments/shipment";
import ShipmentLimitsList from "./views/manifest/shipmentLimitsList";
import FreightQuoteStagingList from "./views/manifest/freightQuoteStagingList";
import ProcessLayout from "./views/processFlow/processLayout";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Layout */}
          <Route
            path="/"
            element={<UseAuthRedirect component={<MainLayout />} />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="supplier-list"
              element={<SuppliersList key="supplier" personType="supplier" />}
            />
            <Route
              path="supplier/:id?"
              element={<Persons personType="supplier" />}
            />

            <Route
              path="consignee-list"
              element={<SuppliersList personType="consignee" />}
            />
            <Route
              path="consignee/:id?"
              element={<Persons personType="consignee" />}
            />

            <Route
              path="agent-list"
              element={<SuppliersList personType="agent" />}
            />
            <Route path="agent/:id?" element={<Persons personType="agent" />} />

            <Route path="port-list" element={<PortList />} />

            <Route path="product-list" element={<ProductList />} />

            <Route path="shipment-list" element={<ShipmentList />} />
            <Route path="shipment/:id?" element={<ShipmentInfo />} />
            <Route path="hbl/:shipmentId/:hblId?" element={<Shipment />} />

            <Route path="vessel-list" element={<VesselList />} />
            <Route path="liner-list" element={<LinerList />} />

            <Route path="rate-list" element={<RateList />} />

            <Route path="shipment-zone-list" element={<ShipmentLimitsList />} />

            <Route path="report">
              <Route path="shipment-list" element={<ShipmentListView />} />
            </Route>

            <Route
              path="freight-quote-staging"
              element={<FreightQuoteStagingList />}
            />
          </Route>

          <Route
            path="process_flow"
            element={<ProcessLayout />}
            />

          {/* Login route, redirect to home if authenticated */}
          <Route path="/login" element={<LoginRedirect />} />

          {/* Catch-all route to handle 404 or invalid routes */}
          <Route
            path="*"
            element={<UseAuthRedirect component={<MainLayout />} />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

interface UseAuthRedirectProps {
  component: React.ReactNode;
}

export const LoginRedirect = () => {
  const { isAuthenticated } = useAuth(); // Accessing authentication state
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Login />;
};

export const UseAuthRedirect = ({ component }: UseAuthRedirectProps) => {
  const { isAuthenticated } = useAuth(); // Accessing authentication state
  // If not authenticated, navigate to login; otherwise, render the component
  return isAuthenticated ? <>{component}</> : <Navigate to="/login" />;
};

export default App;
