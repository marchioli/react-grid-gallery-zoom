import React, { Component } from "react";
import ImageViewer from "./image-viewer";
import "./styles.css";

const image_data = [
  {
    url:
      "https://images.unsplash.com/photo-1542359562-ed883d6b2ae5?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  },
  {
    url:
      "https://images.unsplash.com/photo-1542608660-4ae68832767a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  },
  {
    url:
      "https://images.unsplash.com/photo-1551022345-84679f5d61d5?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  },
  {
    url:
      "https://images.unsplash.com/photo-1562528327-8ee383a1fdc8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  },
  {
    url:
      "https://images.unsplash.com/photo-1551716540-533e037c88f8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  },
  {
    url:
      "https://images.unsplash.com/photo-1568413963456-0e839db6b558?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  },
  {
    url:
      "https://images.unsplash.com/flagged/photo-1561023368-e096c0febd85?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=max&ixid=eyJhcHBfaWQiOjIxMTg3fQ",
    title: ""
  }
];

function Image(props) {
  return (
    <div
      key={props.tile}
      style={{ margin: "5px" }}
      onClick={() => props.openImageViewer(props.image_data, props.index)}
    >
      <img
        id="image"
        src={props.url + "&w=150"}
        style={{
          borderRadius: "3px",
          width: "80px",
          height: "80px",
          border: "1px solid rgb(199, 199, 199)"
        }}
        alt=""
      />
    </div>
  );
}

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      open_image_viewer: false
    };

    this.images = [];
    this.selected_image_index = null;
  }

  handleHashChange = () => {
    if (window.location.hash === "")
      this.setState({ open_image_viewer: false });
    else if (window.location.hash === "#showImage" && this.images.length !== 0)
      this.setState({ open_image_viewer: true });
  };

  componentDidMount() {
    if (this.media_div) {
      const image_block_width = 90; //  width of each image to be rendered
      const outer_div_width = this.media_div.offsetWidth;
      if (outer_div_width) {
        const recommeneded_no_of_images = parseInt(
          outer_div_width / image_block_width,
          10
        );
        if (recommeneded_no_of_images !== this.state.no_of_image) {
          this.setState({ no_of_image: recommeneded_no_of_images });
        }
      }
    }

    if (window.location.hash === "#showImage") {
      this.removeHash();
    }

    window.addEventListener("hashchange", this.handleHashChange, false);
  }

  openImageViewer(images, index) {
    let images_arr = [];

    if (index) this.selected_image_index = index;

    let crop_size;
    if (window && window.innerWidth) {
      let innerWidth = window.innerWidth;
      if (innerWidth <= 400) {
        crop_size = "w=400";
      } else if (innerWidth <= 600) {
        crop_size = "w=600";
      } else {
        crop_size = "w=800";
      }
    }
    if (!crop_size) crop_size = "";
    else crop_size = "&" + crop_size;

    images.forEach(image => {
      images_arr.push({
        source: {
          thumbnail: image.url + "&w=150",
          regular: image.url + crop_size,
          download: image.url + crop_size
        },
        caption: image.description || null
      });
    });

    this.images = images_arr;

    this.setHash();
  }

  setHash() {
    if (this.props.history) {
      window.location.hash = "showImage";
    } else {
      this.setState({ open_image_viewer: true });
    }
  }

  removeHash() {
    if (this.props.history) {
      this.props.history.goBack();
    } else {
      this.setState({ open_image_viewer: false });
    }
  }

  closeImageViewer() {
    this.images = [];
    this.removeHash();
  }

  renderImages() {
    return image_data.map((image, i) => {
      return (
        <Image
          key={i}
          {...image}
          index={i}
          image_data={image_data}
          openImageViewer={(images, index) =>
            this.openImageViewer(images, index)
          }
        />
      );
    });
  }

  render() {
    return (
      <div className="App">
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {this.renderImages()}
        </div>
        {this.state.open_image_viewer ? (
          <ImageViewer
            currentIndex={this.selected_image_index}
            images={this.images}
            showClose={true}
            handleClose={() => this.closeImageViewer()}
          />
        ) : null}
      </div>
    );
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.handleHashChange, false);
  }
}
