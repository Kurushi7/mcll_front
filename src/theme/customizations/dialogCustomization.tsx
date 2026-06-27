import { Theme, alpha, Components } from "@mui/material/styles";
import { gray, orange } from "./themePrimitives";

export const dialogueCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: "2px 6px",
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
      }),
    },
  },
};
