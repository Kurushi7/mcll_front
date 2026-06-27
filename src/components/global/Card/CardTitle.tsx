import React, { ReactNode } from "react";
import { Box } from "@mui/material";

interface CardTitleProps {
  children: ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <Box
      sx={{
        fontSize: "1.5rem",
        lineHeight: 1.334,
        padding: "16px",
      }}
    >
      {children}
    </Box>
  );
};

export default CardTitle;
