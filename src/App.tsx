import React, { Component, ErrorInfo, ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import { UIkitProvider } from "../design-system/uikit/UIkitProvider";
import Showcase from "./pages/Showcase";
import About from "./pages/About";
import Buckets from "./pages/Buckets";
import PostgresSettings from "./pages/PostgresSettings";
import { PostgresTables } from "./pages/PostgresTables";
import CVESummary from "./pages/CVESummary";
import HealthDashboard from "./pages/HealthDashboard";
import { Agentation } from "agentation";
import "./App.scss";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "sans-serif",
            maxWidth: "600px",
          }}
        >
          <h1 style={{ color: "#c00" }}>Не удалось загрузить приложение</h1>
          <pre
            style={{
              overflow: "auto",
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: 4,
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Повторить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => (
  <AppErrorBoundary>
    <UIkitProvider>
      <ConfirmDialog />
      <Routes>
        <Route path="/" element={<Showcase />} />
        <Route path="/buckets" element={<Buckets />} />
        <Route path="/postgres-setup" element={<PostgresSettings />} />
        <Route path="/postgres-tables" element={<PostgresTables />} />
        <Route path="/about" element={<About />} />
        <Route path="/cve-summary" element={<CVESummary />} />
        <Route path="/health-dashboard" element={<HealthDashboard />} />
      </Routes>
      <Agentation />
    </UIkitProvider>
  </AppErrorBoundary>
);

export default App;
