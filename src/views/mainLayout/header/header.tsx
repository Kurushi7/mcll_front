import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { getNotificationList } from "../../../composables/notifications/notifications.tsx";
import { FilterItem, ListFilter } from "../../../types/table.ts";
import ListConstants from "../../../composables/constants/table.ts";
import { notification } from "../../../types/notification.ts";

export const Header = () => {
  const theme = useTheme();
  const [notifBadge, setNotifBadge] = useState(0);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(
    null,
  );
  const isUserMenuOpen = Boolean(menuAnchor);
  const isNotifMenuOpen = Boolean(notifAnchor);
  const menuId = "primary-account-menu";
  const notifMenuId = "primary-account-notif-menu";
  const [notifications, setNotifications] = React.useState<notification[]>([]);

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    setMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleNotifMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifMenuClose = () => {
    setNotifAnchor(null);
  };

  const renderUserMenu = (
    <Menu
      anchorEl={menuAnchor}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted={true}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isUserMenuOpen}
      onClose={handleProfileMenuClose}
    >
      <MenuItem>Profile</MenuItem>
      <MenuItem>My account</MenuItem>
    </Menu>
  );

  const renderNotifMenu = (
    <Menu
      anchorEl={notifAnchor}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={notifMenuId}
      keepMounted={true}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isNotifMenuOpen}
      onClose={handleNotifMenuClose}
    >
      {notifications &&
        notifications.map((item) => (
          <MenuItem key={item.Notification_Id}>{item.message}</MenuItem>
        ))}
      ;
    </Menu>
  );

  useEffect(() => {
    (async () => {
      const filterItem: FilterItem[] = [
        {
          field: "false",
          value: "is_read",
          operator: ListConstants.EQUALS,
          logicOperator: "and",
        },
      ];

      const filterList: ListFilter = {
        limit: 0,
        offset: 0,
        filter: filterItem,
        sort: [],
      };

      const response = await getNotificationList(filterList);

      if (!response || !response.data) return;

      const notifications: notification[] = response?.data?.data;
      setNotifications(notifications);
      setNotifBadge(response.data.total);
    })();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        width: "auto",
      }}
    >
      <AppBar
        enableColorOnDark
        position="static"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <IconButton
              size="small"
              aria-label="notif"
              aria-haspopup="true"
              color="inherit"
              aria-controls={notifMenuId}
              onClick={(event) => handleNotifMenuOpen(event)}
            >
              <Badge badgeContent={notifBadge} color="default">
                <FontAwesomeIcon icon={faBell} />
              </Badge>
            </IconButton>
            <IconButton
              size="small"
              edge="end"
              aria-label="user"
              color="default"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={(event) => handleProfileMenuOpen(event)}
            >
              <FontAwesomeIcon icon={faUser} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderUserMenu}
      {renderNotifMenu}
    </Box>
  );
};
