import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostComponent = () => {
  interface PostRecord {
    id: number;
    userId: number;
    title: string;
    body: string;
  }
  const [posts, setPosts] = useState<PostRecord[]>([]);

  useEffect(() => {
    axios
      .get('http://jsonplaceholder.typicode.com/posts')
      .then((response: any) => setPosts(response.data));
  }, []);

  return <div>{posts?.map((post: PostRecord) => <div>{post.title}</div>)}</div>;
};

export default PostComponent;
