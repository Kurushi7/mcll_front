import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";

const RecursiveMenu = ({ items }: { items: any[] }) => {
  const [open, setOpen] = React.useState<{ [key: string]: boolean }>({});

  const navigate = useNavigate();

  const handleClick = (code: string, navigateTo: string) => {
    setOpen((prevOpen) => ({ ...prevOpen, [code]: !prevOpen[code] }));
    navigate(navigateTo);
  };

  return (
    <List
      component="nav"
      sx={{ width: 300, bgcolor: "background.paper", fontSize: "0.875rem" }}
    >
      {items.map((item: any) => (
        <div key={item.code}>
          <ListItemButton
            onClick={() => handleClick(item.code, item.to ?? null)}
            sx={{
              "&:hover": {
                backgroundColor: "#f3cef5",
              },
            }}
          >
            {Object.prototype.hasOwnProperty.call(item, "icon") &&
              item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} sx={{ fontSize: "0.875rem" }} />
            {item.children ? (
              open[item.code] ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )
            ) : null}
          </ListItemButton>

          {item.children && (
            <Collapse in={open[item.code]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 4 }}>
                <RecursiveMenu items={item.children} />
              </List>
            </Collapse>
          )}
        </div>
      ))}
    </List>
  );
};

const menuItems = [
  {
    code: "supplier",
    label: "Supplier",
    to: "/supplier-list",
  },
  {
    code: "consignee",
    label: "Consignee",
    to: "/consignee-list",
  },
  {
    code: "agent",
    label: "Agent",
    to: "/agent-list",
  },
  {
    code: "product",
    label: "Product",
    to: "/product-list",
  },
  {
    code: "ports",
    label: "Ports",
    to: "/port-list",
  },
  {
    code: "shipment-group",
    label: "Shipment",
    children: [
      {
        code: "shipment",
        label: "Shipment",
        to: "/shipment-list",
      },
      {
        code: "vessel",
        label: "Vessel",
        to: "/vessel-list",
      },
      {
        code: "liners",
        label: "Liners",
        to: "/liner-list",
      },
      {
        code: "rates",
        label: "Rates",
        to: "/rate-list",
      },
      {
        code: "reports",
        label: "Reports",
        to: "/report/shipment-list",
      },
    ],
  },
  {
    code: "rates",
    label: "Rates",
    to: "/freight-quote-staging",
  },
  {
    code: "other_services",
    label: "Other Services",
  },
  {
    code: "records",
    label: "Records",
  },
];

const SidebarMenuList = () => {
  return <RecursiveMenu items={menuItems} />;
};

export default SidebarMenuList;
