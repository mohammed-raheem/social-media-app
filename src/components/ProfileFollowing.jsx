import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";

import LoadingIcon from "./LoadingIcon";

function ProfileFollowing() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const { username } = useParams();

  useEffect(() => {
    const request = Axios.CancelToken.source();

    const fetchedPosts = async function () {
      try {
        const response = await Axios.get(`/profile/${username}/following`, {
          cancelToken: request.token,
        });
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("catched an error in profile posts");
      }
    };
    fetchedPosts();

    return () => {
      request.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingIcon />;

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img alt="" className="avatar-tiny" src={follower.avatar} />{" "} {follower.username}
            
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollowing;
