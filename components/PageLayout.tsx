import React from "react";

export const PageLayout: React.FC = (props) => {
  return <div className="full-window">{props.children}</div>;
};
