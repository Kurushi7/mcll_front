import { createTheme } from "@mui/material/styles";

export const typographyCustomizations = createTheme({
  typography: {
    fontSize: 12, // This sets the base font size to 0.875rem (14px)
    // Override specific typography variants if needed
    h1: {
      fontSize: "2.5rem",
    },
    body1: {
      fontSize: "0.875rem", // 14px for body text
    },
    button: {
      fontSize: "0.875rem", // 14px for buttons
    },
    // Add more overrides for other variants if needed
  },
});
