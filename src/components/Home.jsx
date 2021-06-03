import React, { useContext, useEffect } from "react";
import {useImmer} from 'use-immer'
import Axios from "axios"
import {Link} from "react-router-dom"

import StateContext from "../StateContext";
import Page from "./Page";
import LoadingIcon from "./LoadingIcon";

function Home() {
  const { user } = useContext(StateContext);
  
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.post('/getHomeFeed',
          { token: user.token },
          { cancelToken: ourRequest.token }
        );
        setState((draft) => {
          draft.isLoading = false
          draft.feed = response.data;
        });
      } catch (e) {
        console.log(e.response.data);
      }
    }
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingIcon />
  }

  return (
    <Page title="Home">
    {state.feed.length > 0 && (
      <>
        <h2 className="text-center mb-4">Latest post from your community</h2>
        <div className="list-group">
          {state.feed.map((result) => {
                  const date = new Date();
                  const formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

                  return (
                    <Link
                      to={`/post/${result._id}`}
                      key={result._id}
                      className="list-group-item list-group-item-action"
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
      </>
    )}
      {state.feed.length === 0 && (
        <>
          <div className="container container--narrow py-md-5">
        <h2 className="text-center">
          Hello <strong>{user.username}</strong>, your feed is empty.
        </h2>
        <p className="lead text-muted text-center">
          Your feed displays the latest posts from the people you follow. If you
          don&rsquo;t have any friends to follow that&rsquo;s okay; you can use
          the &ldquo;Search&rdquo; feature in the top menu bar to find content
          written by people with similar interests and then follow them.
        </p>
      </div>
        </>
      )}
    </Page>
  );
}

export default Home;
