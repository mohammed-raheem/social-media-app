import React, { useContext, useEffect } from "react";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

import Page from "./Page";
import LoadingIcon from "./LoadingIcon";
import NotFound from "./NotFound";

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const postId = useParams().id;

  const initialState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: postId,
    sendCount: 0,
    notFound: false,
  };
  const ourReducer = function (draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        break;
      case "titleChange":
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        break;
      case "bodyChange":
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        break;
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        break;
      case "saveRequestStarted":
        draft.isSaving = true;
        break;
      case "saveRequestFinished":
        draft.isSaving = false;
        props.history.push(`/post/${postId}`);
        break;
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "This field should not be empty!";
        } else {
          draft.title.hasErrors = false;
          draft.title.message = "";
        }
        break;
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "This field should not be empty!";
        } else {
          draft.body.hasErrors = false;
          draft.body.message = "";
        }
        break;
      case "notFound":
        draft.notFound = true;
        break;

      default:
        return draft;
    }
  };
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  const handleSubmit = function (e) {
    e.preventDefault();
    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    dispatch({ type: "submitRequest" });
  };

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const request = Axios.CancelToken.source();
      const fetchPost = async function () {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            {
              cancelToken: request.token,
            }
          );
          dispatch({ type: "saveRequestFinished" });
          appDispatch({
            type: "flashMessage",
            message: { type: "success", text: "The post has updated!" },
          });
        } catch (e) {
          console.log("Catched an error or the request cancelled");
        }
      };

      fetchPost();

      return () => {
        request.cancel();
      };
    }
  }, [state.sendCount]);

  useEffect(() => {
    const request = Axios.CancelToken.source();

    const fetchPost = async function () {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: request.token,
        });
        if (response.data) {
          if (appState.user.username === response.data.author.username) {
            dispatch({ type: "fetchComplete", value: response.data });
          } else {
            appDispatch({
              type: "flashMessage",
              message: {
                type: "danger",
                text: "You do not have permission to edit that post!",
              },
            });
            props.history.push("/");
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (e) {
        console.log("Catched an error or the request cancelled");
      }
    };

    fetchPost();

    return () => {
      request.cancel();
    };
  }, [dispatch, state.id]);

  if (state.notFound) return <NotFound />;

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );

  return (
    <Page title="Create Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to the post
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
            onChange={(e) =>
              dispatch({ type: "titleChange", value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: "titleRules", value: e.target.value })
            }
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onChange={(e) =>
              dispatch({ type: "bodyChange", value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: "bodyRules", value: e.target.value })
            }
          />
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
