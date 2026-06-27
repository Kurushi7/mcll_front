import React, { Component } from "react";
import { Box, CssBaseline, useTheme } from "@mui/material";
import { Header } from "./header/header";
import { SideBar } from "./sideBar/sideBar";
import { Outlet } from "react-router-dom";
import Dashboard from "../dashboard";

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const [selectedComponent, setSelectedComponent] =
    React.useState<JSX.Element | null>(null);

  return (
    <Box>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <SideBar />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header />
          <Box
            sx={{
              flexGrow: 1,
              padding: 2, // Padding for content
              backgroundColor: "rgb(238, 242, 246)",
              overflowY: "auto", // Enable scrolling
              borderTopLeftRadius: "8px",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
