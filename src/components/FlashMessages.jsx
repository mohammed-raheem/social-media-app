import React, { useContext } from "react";

import StateContext from "../StateContext";

function FlashMessages() {
  const { flashMessagesArray } = useContext(StateContext);

  return (
    <div className="floating-alerts">
      {flashMessagesArray.map((msg, index) => {
        return (
          <div
            key={index}
            className={`alert ${
              msg.type === "danger" ? "alert-danger" : "alert-success"
            } text-center floating-alert`}
          >
            {msg.text}
          </div>
        );
      })}
    </div>
  );
}

export default FlashMessages;
