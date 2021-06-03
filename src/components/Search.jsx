import React, { useContext, useEffect } from "react";
import Axios from "axios";
import { useImmer } from "use-immer";
import DispatchContext from "../DispatchContext";
import { Link } from "react-router-dom";

function Search({ nodeRef }) {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  });

  useEffect(() => {
    window.addEventListener("keyup", (e) => {
      if (e.keyCode === 27) appDispatch({ type: "closeSearch" });
    });
    return () =>
      window.removeEventListener("keyup", (e) => {
        if (e.keyCode === 27) appDispatch({ type: "closeSearch" });
      });
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  };

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 700);

      return () => clearTimeout(delay);
    } else {
      setState((draft) => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      const request = Axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const res = await Axios.post(
            "/search",
            { searchTerm: state.searchTerm },
            { cancelToken: request.token }
          );
          setState((draft) => {
            draft.results = res.data;
            draft.show = "results";
          });
        } catch (e) {
          console.log("Catched an error at search file");
        }
      };
      fetchResults();
    }
  }, [state.requestCount]);

  return (
    <div ref={nodeRef} className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
            onChange={handleInput}
          />
          <span
            onClick={() => appDispatch({ type: "closeSearch" })}
            className="close-live-search"
          >
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              "circle-loader " +
              (state.show === "loading" ? "circle-loader--visible" : "")
            }
          ></div>
          <div
            className={
              "live-search-results " +
              (state.show === "results" ? "live-search-results--visible" : "")
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{" "}
                  {state.results.length > 1 ? "items " : "item "}
                  found)
                </div>
                {state.results.map((result) => {
                  const date = new Date();
                  const formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

                  return (
                    <Link
                      to={`/post/${result._id}`}
                      key={result._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => appDispatch({ type: "closeSearch" })}
                    >
                      <img
                        className="avatar-tiny"
                        src={result.author.avatar}
                        alt=""
                      />{" "}
                      <strong>{result.title} </strong>
                      <span className="text-muted small">
                        by brad on {formattedDate}{" "}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <p className="alert alert-danger text-center shadow-sm">
                Sorry, there's no results have been found for this search!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
