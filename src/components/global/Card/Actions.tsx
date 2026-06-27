import { ReactNode } from "react";
import { Button } from "@mui/material";

interface CardActionProps {
  children: ReactNode;
}

const Actions: React.FC<CardActionProps> = ({ children }) => {
  return (
    <Button
      sx={{
        "&:hover": {
          backgroundColor: "hsl(0deg 0% 100%)",
        },
        padding: "6 8",
      }}
    >
      {children}
    </Button>
  );
};

export default Actions;
