import React, { useEffect, useRef, Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import "./App.css";
import Axios from "axios";
import { CSSTransition } from "react-transition-group";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

import FlashMessages from "./components/FlashMessages";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Search from "./components/Search";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import About from "./components/About";
import Terms from "./components/Terms";
import SinglePost from "./components/SinglePost";
import EditPost from "./components/EditPost";
import Profile from "./components/Profile";
import Chat from "./components/Chat";
import LoadingIcon from "./components/LoadingIcon";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const NotFound = React.lazy(() => import("./components/NotFound"));

Axios.defaults.baseURL =
  process.env.BACKENDURL || "https://mohammed-social-media.herokuapp.com";

function App() {
  const intialStates = {
    loggedIn: Boolean(localStorage.getItem("userToken")),
    flashMessagesArray: [],
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
    user: {
      username: localStorage.getItem("username"),
      token: localStorage.getItem("userToken"),
      avatar: localStorage.getItem("userAvatar"),
    },
  };

  const reducer = function (draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "flashMessage":
        draft.flashMessagesArray.push(action.message);
        break;
      case "openSearch":
        draft.isSearchOpen = true;
        break;
      case "closeSearch":
        draft.isSearchOpen = false;
        break;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        break;
      case "closeChat":
        draft.isChatOpen = false;
        break;
      case "incrementChatCount":
        draft.unreadChatCount++;
        break;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        break;
      default:
        return draft;
    }
  };

  const [state, dispatch] = useImmerReducer(reducer, intialStates);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("userToken", state.user.token);
      localStorage.setItem("userAvatar", state.user.avatar);
      localStorage.setItem("username", state.user.username);
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("username");
    }
  }, [
    state.loggedIn,
    state.user.avatar,
    state.user.token,
    state.user.username,
  ]);

  useEffect(() => {
    if (state.loggedIn) {
      const request = Axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const res = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: request.token }
          );
          if (!res.data) {
            dispatch({ type: "logout" });
            dispatch({
              type: "flashMessage",
              message: {
                type: "danger",
                text: "Your session has expired, login again.",
              },
            });
          }
        } catch (e) {
          console.log("Catched an error at search file");
        }
      };
      fetchResults();
    }
  }, []);

  return (
    <div className="App">
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          <BrowserRouter>
            <FlashMessages />
            <Header />
            <Suspense fallback={<LoadingIcon />}>
              <Switch>
                <Route path="/" exact>
                  {state.loggedIn ? <Home /> : <HomeGuest />}
                </Route>
                <Route path="/about-us" exact>
                  <About />
                </Route>
                <Route path="/terms" exact>
                  <Terms />
                </Route>
                <Route path="/create-post" exact>
                  <CreatePost />
                </Route>
                <Route path="/post/:id" exact>
                  <SinglePost />
                </Route>
                <Route path="/post/:id/edit" exact>
                  <EditPost />
                </Route>
                <Route path="/profile/:username" exact>
                  <Profile />
                </Route>
                <Route path="/profile/:username/followers" exact>
                  <Profile />
                </Route>
                <Route path="/profile/:username/following" exact>
                  <Profile />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </Suspense>
            <CSSTransition
              timeout={330}
              in={state.isSearchOpen}
              nodeRef={nodeRef}
              classNames="search-overlay"
              unmountOnExit
            >
              <Search nodeRef={nodeRef} />
            </CSSTransition>
            <Chat />
            <Footer />
          </BrowserRouter>
        </DispatchContext.Provider>
      </StateContext.Provider>
    </div>
  );
}

export default App;
