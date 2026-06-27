import { Popover } from "@mui/material";
import React from "react";
import { Column, FilterItems } from "../../types/table";
import FilterPanel from "./FilterPanel";

interface Props {
  open: boolean;
  handlePopoverClose: () => void;
  columns: Column[];
  anchorEl: HTMLButtonElement | null;
  fetchData: (data: FilterItems[]) => Promise<void>;
  data: FilterItems[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

const FilterPanelPopUp: React.FC<Props> = ({
  open,
  handlePopoverClose,
  columns,
  anchorEl,
  fetchData,
  data,
  setData,
}) => {
  const formStyle: React.CSSProperties = {
    display: "flex",
    minWidth: "550px",
    minHeight: "300px",
    overflow: "auto",
    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    flexDirection: "column",
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      onClose={handlePopoverClose}
    >
      <div style={formStyle}>
        <FilterPanel
          columns={columns}
          fetchData={fetchData}
          data={data}
          setData={setData}
        />
      </div>
    </Popover>
  );
};

export default FilterPanelPopUp;
