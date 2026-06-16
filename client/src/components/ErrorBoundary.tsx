import React from "react";

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            background: "#fdf6ee",
            color: "#4a3728",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Что-то пошло не так</h2>
          <p style={{ marginBottom: "1.5rem", opacity: 0.7 }}>
            Произошла непредвиденная ошибка. Пожалуйста, обновите страницу.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "0.6rem 1.6rem",
              background: "#c8a97a",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
