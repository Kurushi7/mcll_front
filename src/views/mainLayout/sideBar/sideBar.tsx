import {
  Box,
  ButtonBase,
  Drawer,
  List,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { McllIcon } from "../../../icons/companyIcons";
import { Link } from "react-router-dom";
import SidebarMenuList from "./recursiveMenu";

export const SideBar = () => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: "200px" }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          "& .MuiDrawer-paper": {
            width: 200,
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            [theme.breakpoints.up("md")]: {
              top: "88px",
            },
            borderRight: "none",
          },
        }}
        elevation={0}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Box sx={{ display: "flex", p: 2, mx: "auto" }}>
            <ButtonBase
              disableRipple
              onClick={() => console.log("logo clicked")}
              component={Link}
              to={"/dashboard"}
            >
              <McllIcon />
            </ButtonBase>
          </Box>
        </Box>
        <SidebarMenuList />
      </Drawer>
    </Box>
  );
};
