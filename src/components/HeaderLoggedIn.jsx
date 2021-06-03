import React, { useContext } from "react";
import { Link, withRouter } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function HeaderLoggedIn(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const handleLoggingOut = function () {
    props.history.push("/");
    appDispatch({ type: "logout" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    appDispatch({ type: "openSearch" });
  };
  return (
    <div className="flex-row my-3 my-md-0">
      <a
        href="#"
        data-tip="Search"
        data-for="search"
        className="text-white mr-3 header-search-icon"
        onClick={handleSearch}
      >
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />
      <span
        data-tip="Chat"
        data-for="chat"
        className={`mr-3 header-chat-icon ${
          appState.unreadChatCount ? "text-danger" : "text-white"
        }`}
        onClick={() => appDispatch({ type: "toggleChat" })}
      >
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount ? (
          <span className="chat-count-badge text-white">
            {appState.unreadChatCount > 9 ? "9+" : appState.unreadChatCount}
          </span>
        ) : (
          ""
        )}
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />
      <Link
        to={`/profile/${appState.user.username}`}
        data-tip="My profile"
        data-for="profile"
        className="mr-3"
      >
        <img
          className="small-header-avatar"
          src={appState.user.avatar}
          alt=""
        />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      <button onClick={handleLoggingOut} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default withRouter(HeaderLoggedIn);
