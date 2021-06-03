import React, { useContext, useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import io from "socket.io-client";
import { Link } from "react-router-dom";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

const socket = io(
  process.env.BACKENDURL || "https://mohammed-social-media.herokuapp.com"
);

function Chat() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: [],
  });

  const chatField = useRef(null);
  const chatLog = useRef(null);

  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "clearUnreadChatCount" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    socket.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });
  }, []);

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementChatCount" });
    }
  }, [state.chatMessages]);

  const handleField = function (e) {
    const value = e.target.value;
    setState((draft) => {
      draft.fieldValue = value;
    });
  };

  const handleSubmit = function (e) {
    e.preventDefault();

    socket.emit("chatFromBrowser", {
      message: state.fieldValue,
      token: appState.user.token,
    });

    setState((draft) => {
      draft.chatMessages.push({
        message: draft.fieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.fieldValue = "";
    });
  };

  return (
    <div
      id="chat-wrapper"
      className={`chat-wrapper ${
        appState.isChatOpen && "chat-wrapper--is-visible"
      } shadow border-top border-left border-right`}
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: "closeChat" })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div ref={chatLog} id="chat" className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img
                  alt=""
                  className="chat-avatar avatar-tiny"
                  src={message.avatar}
                />
              </div>
            );
          } else {
            return (
              <div key={index} className="chat-other">
                <Link to={`/profile/${message.username}`}>
                  <img alt="" className="avatar-tiny" src={message.avatar} />
                </Link>
                <div className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username}: </strong>
                    </Link>

                    {message.message}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
          value={state.fieldValue}
          onChange={handleField}
        />
      </form>
    </div>
  );
}

export default Chat;
