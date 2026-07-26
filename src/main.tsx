import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "./store/store";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const root = createRoot(
  document.getElementById("root") as HTMLElement,
);

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans serif",
  },
});

const queryClient= new QueryClient();

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
          <QueryClientProvider client={queryClient}>
                <App />
          </QueryClientProvider>
      </Provider>
    </ThemeProvider>
    ,
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
