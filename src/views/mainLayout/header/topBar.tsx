import { AppBar, Box, CssBaseline, Toolbar, useTheme } from "@mui/material";
import { Header } from "./header";

export const TopBar: React.FC = () => {
  const theme = useTheme();

  return (
    <Box className="top-bar" sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
        }}
      />
      <Toolbar>
        <Header />
      </Toolbar>
    </Box>
  );
};
