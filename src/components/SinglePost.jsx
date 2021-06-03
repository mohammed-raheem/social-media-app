import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import ReactMarkDown from "react-markdown";
import ReactToolTip from "react-tooltip";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

import Page from "./Page";
import LoadingIcon from "./LoadingIcon";
import NotFound from "./NotFound";

function SinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState([]);

  useEffect(() => {
    const request = Axios.CancelToken.source();

    const fetchPost = async function () {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: request.token,
        });
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("Catched an error or the request cancelled");
      }
    };

    fetchPost();

    return () => {
      request.cancel();
    };
  }, [id]);

  const date = new Date(post.createdDate);
  const formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

  if (isLoading)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );

  if (!isLoading && !post) return <NotFound />;

  const isOwner = () => {
    if (appState.user.username === post.author.username) {
      return true;
    } else {
      return false;
    }
  };

  const handleDelete = async () => {
    const deleteConfirm = window.confirm("Do you want to delete this post?");
    if (deleteConfirm) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        });

        if (response.data === "Success") {
          appDispatch({
            type: "flashMessage",
            message: { type: "success", text: "Post deleted successfully." },
          });
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("Catched an error while trying to delete this post!");
      }
    }
  };

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactToolTip id="edit" />{" "}
            <button
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
              onClick={handleDelete}
            >
              <i className="fas fa-trash"></i>
            </button>
            <ReactToolTip id="delete" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} alt="" />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on {formattedDate}
      </p>

      <div className="body-content">
        <ReactMarkDown children={post.body} />
      </div>
    </Page>
  );
}

export default withRouter(SinglePost);
