import React, { Component, ErrorInfo, ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import { UIkitProvider } from "../design-system/uikit/UIkitProvider";
import HealthMonitorPage from "./pages/HealthMonitorPage";
import Showcase from "./pages/Showcase";
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
        <Route path="/" element={<Navigate to="/health-monitor" replace />} />
        <Route path="/health-monitor" element={<HealthMonitorPage />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="*" element={<Navigate to="/health-monitor" replace />} />
      </Routes>
      <Agentation />
    </UIkitProvider>
  </AppErrorBoundary>
);

export default App;
