import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";

import LoadingIcon from "./LoadingIcon";

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const { username } = useParams();

  useEffect(() => {
    const request = Axios.CancelToken.source();

    const fetchedPosts = async function () {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
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
      {posts.map((post) => {
        const date = new Date(post.createdDate);
        const formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
        return (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="list-group-item list-group-item-action"
          >
            <img alt="" className="avatar-tiny" src={post.author.avatar} />{" "}
            <strong>{post.title}</strong>
            <span className="text-muted small"> on {formattedDate} </span>
          </Link>
        );
      })}
    </div>
  );
}

export default ProfilePosts;
