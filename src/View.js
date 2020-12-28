import React from "react";

import { getSource, className } from "./utils";

const View = props => {
  const { data, formatters, getStyles, index, isFullscreen, isModal } = props;
  const innerProps = {
    alt: formatters.getAltText({ data, index }),
    src: getSource(data.source),
    draggable: "false"
  };

  return (
    <div
      style={getStyles("view", props)}
      className={className("view", { isFullscreen, isModal })}
    >
      <img
        ref={el => props.innerRef(el)}
        {...innerProps}
        className={className("view-image", { isFullscreen, isModal })}
        style={{
          height: "auto",
          maxHeight: "100vh",
          maxWidth: "100%",
          userSelect: "none"
        }}
      />
    </div>
  );
};

export default View;
