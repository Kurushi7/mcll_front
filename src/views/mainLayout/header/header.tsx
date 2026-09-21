import {
  AppBar,
  Badge,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { getNotificationList } from "../../../composables/notifications/notifications.tsx";
import { FilterItem, ListFilter } from "../../../types/table.ts";
import ListConstants from "../../../composables/constants/table.ts";
import {
  Notification,
  UpdateNotification,
} from "../../../types/notification.ts";
import { NotificationsNone } from "@mui/icons-material";
import {
  markAllNotifsAsRead,
  updateNotifications,
} from "../../../store/notifications/notification.ts";
import { useAppDispatch } from "../../../store/store.ts";

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
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const dispatch = useAppDispatch();

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

  const handleMarkAllAsRead = async () => {
    const result = await dispatch(markAllNotifsAsRead());
    if (!markAllNotifsAsRead.fulfilled.match(result)) {
      return false;
    }
  };

  const markAsRead = async (notification_id: number | undefined) => {
    if (!notification_id) return false;

    // setNotifications(()=> notifications.map((notification)=> (
    //   if(notification.notification_id === notification_id){
    //     return {...notification,}
    //   }
    // )))

    const notif: UpdateNotification = {
      is_read: true,
    };

    const result = await dispatch(
      updateNotifications({ notification_id, data: notif }),
    );
    if (!updateNotifications.fulfilled.match(result)) {
      return false;
    }
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
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 450,
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
          }}
        >
          Notifications
        </Typography>

        {notifications && notifications.length > 0 && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Typography>
        )}
      </Box>
      {notifications &&
        notifications.map((item) => (
          <MenuItem
            sx={{
              px: 2,
              py: 1.5,
              alignItems: "flex-start",
              whiteSpace: "normal",
              borderBottom: "1px solid",
              borderColor: "divider",

              backgroundColor: item.is_read ? "transparent" : "action.hover",

              "&:hover": {
                backgroundColor: "action.hover",
              },

              "&:last-child": {
                borderBottom: "none",
              },
            }}
            key={item.notification_id}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: item.is_read ? "grey.400" : "success.main",
                mt: 1,
                mr: 1.5,
                flexShrink: 0,
              }}
            />

            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <NotificationsNone
                color="primary"
                sx={{
                  fontSize: 22,
                  color: item.is_read ? "action.disabled" : "primary.main",
                }}
              />
            </ListItemIcon>

            <ListItemText
              onClick={() => markAsRead(item.notification_id)}
              secondary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.5,
                    whiteSpace: "normal",
                  }}
                >
                  {item.message}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      ;
    </Menu>
  );

  useEffect(() => {
    (async () => {
      const filterItem: FilterItem[] = [
        {
          field: "is_read",
          value: "false",
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

      const notifications: Notification[] = response?.data?.data;

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
