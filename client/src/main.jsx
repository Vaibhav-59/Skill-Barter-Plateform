import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/slices/store";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

// Suppress known React 19 warning caused by third-party packages (like react-big-calendar) that
// still use the older JSX transform under the hood. Since we cannot directly rewrite the compiled
// dependency code, intercepting this specific console.error is the cleanest approach.
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("outdated JSX transform")) {
    return;
  }
  originalError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
