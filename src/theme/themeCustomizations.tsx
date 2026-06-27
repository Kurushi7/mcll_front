import type {} from "@mui/material/themeCssVarsAugmentation";
import { ThemeOptions } from "@mui/material/styles";
import {
  inputsCustomizations,
  dataDisplayCustomizations,
  dialogueCustomizations,
  navigationCustomizations,
  surfacesCustomizations,
} from "./customizations";
import { getDesignTokens } from "./customizations/themePrimitives";

export default function getTheme(): ThemeOptions {
  return {
    ...getDesignTokens(),
    components: {
      ...inputsCustomizations,
      ...dataDisplayCustomizations,
      ...dialogueCustomizations,
      ...navigationCustomizations,
      ...surfacesCustomizations,
    },
  };
}
