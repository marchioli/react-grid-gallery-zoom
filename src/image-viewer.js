import React, { PureComponent } from "react";
import Hammer from "hammerjs";

import Carousel, { Modal, ModalGateway } from "react-images";

import CloseIcon from "material-ui/svg-icons/content/clear";
import DeleteIcon from "material-ui/svg-icons/action/delete";
import EditIcon from "material-ui/svg-icons/image/edit";
import InfoIcon from "material-ui/svg-icons/action/info";
import ZoomInIcon from "material-ui/svg-icons/action/zoom-in";
import ZoomOutIcon from "material-ui/svg-icons/action/zoom-out";

import View from "./View";
import "./styles.css";

function getAltText({ data, index }) {
  if (data.caption) return data.caption;

  return `Image ${index + 1}`;
}

export default class ImageViewer extends PureComponent {
  constructor() {
    super();

    this.zoom = 1;
    this.posX = 0;
    this.posY = 0;
    this.scale = 1;
    this.last_scale = 1;
    this.last_posX = 0;
    this.last_posY = 0;
    this.max_pos_x = 0;
    this.max_pos_y = 0;
    this.transform = "";
    this.elem = null;
  }

  action(ev) {
    this.transform = "";

    if (ev.type == "doubletap") {
      this.transform = `translate3d(0, 0, 0) ` + "scale3d(2, 2, 1) ";
      this.scale = 2;
      this.last_scale = 2;
      try {
        const val = window
          .getComputedStyle(this.elem, null)
          .getPropertyValue("-webkit-transform")
          .toString();
        if (val != "matrix(1, 0, 0, 1, 0, 0)" && val !== "none") {
          this.transform = "translate3d(0, 0, 0) " + "scale3d(1, 1, 1) ";
          this.scale = 1;
          this.last_scale = 1;
        }
      } catch (err) {}

      if (!this.transition) {
        this.transition = true;
        this.elem.style.transition = "transform 0.5s";
      }

      this.elem.style.transform = this.transform;
      this.transform = "";
    }

    if (ev.type == "pan") {
      if (this.transition) {
        this.transition = false;
        this.elem.style.transition = "unset";
      }
    }

    //pan
    if (this.scale != 1) {
      this.posX = this.last_posX + ev.deltaX;
      this.posY = this.last_posY + ev.deltaY;
      this.max_pos_x = Math.ceil(
        ((this.scale - 1) * this.elem.clientWidth) / 2
      );
      this.max_pos_y = Math.ceil(
        ((this.scale - 1) * this.elem.clientHeight) / 2
      );
      if (this.posX > this.max_pos_x) {
        this.posX = this.max_pos_x;
      }
      if (this.posX < -this.max_pos_x) {
        this.posX = -this.max_pos_x;
      }
      if (this.posY > this.max_pos_y) {
        this.posY = this.max_pos_y;
      }
      if (this.posY < -this.max_pos_y) {
        this.posY = -this.max_pos_y;
      }
    }

    //pinch
    if (ev.type == "pinch") {
      this.scale = Math.max(0.999, Math.min(this.last_scale * ev.scale, 4));

      if (this.transition) {
        this.transition = false;
        this.elem.style.transition = "unset";
      }
    }
    if (ev.type == "pinchend") {
      this.last_scale = this.scale;

      if (this.transition) {
        this.transition = false;
        this.elem.style.transition = "unset";
      }
    }

    //panend
    if (ev.type == "panend") {
      this.last_posX = this.posX < this.max_pos_x ? this.posX : this.max_pos_x;
      this.last_posY = this.posY < this.max_pos_y ? this.posY : this.max_pos_y;

      if (this.transition) {
        this.transition = false;
        this.elem.style.transition = "unset";
      }
    }

    if (this.scale != 1) {
      this.transform =
        "translate3d(" +
        this.posX +
        "px," +
        this.posY +
        "px, 0) " +
        "scale3d(" +
        this.scale +
        ", " +
        this.scale +
        ", 1)";
    }

    //zoom
    if (ev.type == "zoom") {
      this.scale = Math.max(0.999, Math.min(ev.scale, 4));
      this.last_scale = this.scale;

      if (this.scale == 1) {
        this.posX = 0;
        this.posY = 0;
      }

      if (this.scale) {
        this.transform =
          "translate3d(" +
          this.posX +
          "px," +
          this.posY +
          "px, 0) " +
          "scale3d(" +
          this.scale +
          ", " +
          this.scale +
          ", 1)";
      }

      if (!this.transition) {
        this.transition = true;
        this.elem.style.transition = "transform 0.5s";
      }
    }

    if (this.transform) {
      this.elem.style.transform = this.transform;
    }

    // if (this.scale != 1 && this.state.swipe) {
    //     this.setState({ swipe: false });
    // }
    // else if (this.scale == 1 && !this.state.swipe) {
    //     this.setState({ swipe: true });
    // }
  }

  onSwipe(event) {
    if (this.scale !== 1) {
      this.preventEvent(event);
    }
  }

  preventEvent(event) {
    event.preventDefault();
  }

  handleChangeZoom(type = -1) {
    let zoom;
    zoom = this.zoom + type;

    if (zoom >= 1 && zoom <= 4) this.zoom = zoom;

    this.action({
      type: "zoom",
      deltaX: 0,
      deltaY: 0,
      scale: this.zoom
    });
  }

  setHammerListener(ref) {
    if (this.hammer) {
      this.hammer.destroy();
    }
    // Set default view of image
    if (this.elem) {
      this.elem.style.transform = "translate3d(0, 0, 0) " + "scale3d(1, 1, 1) ";
    }
    if (ref) {
      this.elem = ref;
      this.hammer = new Hammer(ref);
      this.hammer.get("pinch").set({ enable: true });
      this.hammer.on("doubletap pan panend pinch pinchend", event =>
        this.action(event)
      );
    }
  }

  render() {
    const props = this.props;

    const HeaderClose = () => {
      return (
        <button
          className="imageViewerHeaderButton"
          onClick={() => props.handleClose()}
        >
          <CloseIcon style={{ width: "32px", height: "32px" }} color="#fff" />
        </button>
      );
    };

    const HeaderDelete = innerProps => {
      return (
        <button
          className="imageViewerHeaderButton"
          onClick={() => props.handleDelete(innerProps.index)}
        >
          <DeleteIcon style={{ width: "32px", height: "32px" }} color="#fff" />
        </button>
      );
    };

    const HeaderEdit = innerProps => {
      return (
        <button
          className="imageViewerHeaderButton"
          onClick={() => props.handleEdit(innerProps.index)}
        >
          <EditIcon style={{ width: "32px", height: "32px" }} color="#fff" />
        </button>
      );
    };

    const HeaderZoomIn = props => {
      return (
        <button
          className={`imageViewerHeaderButton ${props.className}`}
          onClick={() => this.handleChangeZoom(1)}
        >
          <ZoomInIcon style={{ width: "32px", height: "32px" }} color="#fff" />
        </button>
      );
    };

    const HeaderZoomOut = props => {
      return (
        <button
          className={`imageViewerHeaderButton ${props.className}`}
          onClick={() => this.handleChangeZoom(-1)}
        >
          <ZoomOutIcon style={{ width: "32px", height: "32px" }} color="#fff" />
        </button>
      );
    };

    const Header = defaultProps => {
      return (
        <div
          style={{
            padding: "10px 10px",
            height: "44px",
            display: "flex",
            position: "fixed",
            top: "20px",
            left: "0px",
            width: "100%",
            alignItems: "center",
            zIndex: 1103
          }}
        >
          <span style={{ marginLeft: "auto" }}>
            <HeaderZoomOut className="desktop__only__button" />
            <HeaderZoomIn className="desktop__only__button" />
            {props.showEdit &&
            props.handleEdit &&
            typeof props.handleEdit === "function" ? (
              <HeaderEdit index={defaultProps.currentIndex} />
            ) : null}
            {props.showDelete &&
            props.handleDelete &&
            typeof props.handleDelete === "function" ? (
              <HeaderDelete index={defaultProps.currentIndex} />
            ) : null}
            {props.showClose &&
            props.handleClose &&
            typeof props.handleClose === "function" ? (
              <HeaderClose />
            ) : null}
          </span>
        </div>
      );
    };

    const FooterRejectionMessage = props => {
      const { currentView } = props;
      const { rejection_comment } = currentView;

      if (!rejection_comment) return null;

      return (
        <div
          style={{
            display: "flex",
            border: `1px solid grey`,
            borderRadius: "5px",
            margin: "0px 5%",
            width: "90%",
            backgroundColor: "white",
            alignItems: "center",
            padding: "8px"
          }}
        >
          <InfoIcon color="#FF9800" style={{ marginRight: "10px" }} />
          <div style={{ wordBreak: "break-all" }}>{rejection_comment}</div>
        </div>
      );
    };

    const FooterCaption = props => {
      const { currentView, interactionIsIdle } = props;
      const { caption } = currentView;

      if (interactionIsIdle || !caption) {
        return null;
      }
      return (
        <div
          style={{
            color: "#ffffffe6",
            backgroundColor: "rgb(0, 0, 0, 0.45)",
            padding: "10px 5%"
          }}
        >
          {caption}
        </div>
      );
    };

    const Footer = props => {
      if (!props.currentView) return null;

      return (
        <div
          className="imageViewerFooter"
          style={{ zIndex: 1103 }}
          ref={el => {
            this.footer = el;
          }}
        >
          <FooterRejectionMessage {...props} />
          <div style={{ marginTop: "10px" }}>
            <FooterCaption {...props} />
          </div>
        </div>
      );
    };

    const ViewObj = innerProps => {
      const { index, currentIndex } = innerProps;

      return (
        <View
          innerRef={el => {
            if (currentIndex === index && this.currentIndex !== currentIndex) {
              if (typeof props.onIndexChange === "function") {
                props.onIndexChange(currentIndex);
              }

              this.currentIndex = currentIndex;
              this.setHammerListener(el);
            }
          }}
          {...innerProps}
        />
      );
    };

    return (
      <ModalGateway>
        <Modal
          styles={{
            blanket: base => ({
              ...base,
              zIndex: 1101,
              backgroundColor: "rgb(0, 0, 0, 0.55)"
            }),
            dialog: base => ({
              ...base,
              zIndex: 1102
            }),
            positioner: base => ({
              ...base,
              zIndex: 1102
            })
          }}
          closeOnBackdropClick={false}
          onClose={() => props.handleClose()}
        >
          <Carousel
            components={{ Footer: Footer, Header: Header, View: ViewObj }}
            currentIndex={props.currentIndex || 0}
            formatters={{ getAltText }}
            // frameProps={{ autoSize: 'height' }}
            views={props.images}
            trackProps={{ swipe: props.images.length === 1 ? false : "touch" }}
            // hideControlsWhenIdle={false}
          />
        </Modal>
      </ModalGateway>
    );
  }

  componentWillUnmount() {
    if (this.hammer) {
      this.hammer.destroy();
    }
  }
}
