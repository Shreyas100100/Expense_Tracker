import React from "react";
import MuiAlert from "@mui/material/Alert";

function Alert(props) {
  const { onClose, severity, children, ...other } = props;

  return (
    <MuiAlert
      elevation={6}
      variant="filled"
      {...other}
      onClose={(event, reason) => {
        if (onClose) {
          onClose(event, reason);
        }
      }}
      // Add a check for null before accessing scrollTop
      sx={{ overflow: "auto", marginTop: 64, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}
    >
      {children}
    </MuiAlert>
  );
}

export default Alert;
