import React, { useState, useEffect, useCallback } from 'react';
import { $api } from '../../../api/api';
import { IFollowItem } from '../../../interfaces/follow.interface';
import HomePostModal from '../homePagePostModal/HomePagePostModal';
import styles from './HomePagePosts.module.css';
import PostItem from '../postItem/PostItem';
import { useAppSelector } from '../../../redux/hooks';
import type { IPost } from '../../../interfaces/post.interface';
import { getAuthorInfo } from '../../../utils/author';

const HomePagePosts: React.FC = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const myId = currentUser?._id ?? '';

  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({});
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [followingList, setFollowingList] = useState<string[] | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await $api.get<IPost[]>('/posts');

      const filtered = data.filter((p) => {
        const { id: authorId } = getAuthorInfo(p.author);
        return authorId !== myId;
      });

      const initialLikesCounts = filtered.reduce<Record<string, number>>((acc, p) => {
        acc[p._id] = p.likesCount ?? 0;
        return acc;
      }, {});

      setPosts(filtered);
      setLikesCounts(initialLikesCounts);
      setLoading(false);
    } catch {
      setError('Error loading feed');
      setLoading(false);
    }
  }, [myId]);

  const fetchFollowing = useCallback(async () => {
    if (!myId) return;
    try {
      const { data } = await $api.get<IFollowItem[]>(`/follows/${myId}/following`);
      setFollowingList(data.map((u) => u._id));
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Following fetch error:', err.message);
    }
  }, [myId]);

  useEffect(() => {
    fetchPosts();
    fetchFollowing();
  }, [fetchPosts, fetchFollowing]);

  const handleLikesCountChange = useCallback((postId: string, newCount: number) => {
    setLikesCounts((prev) => ({ ...prev, [postId]: newCount }));
  }, []);

  const openModal = useCallback((post: IPost) => {
    setSelectedPost(post);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPost(null);
  }, []);

  const handleRemoveSomeFollow = useCallback((userId: string) => {
    setFollowingList((prev) => prev ? prev.filter((id) => id !== userId) : prev);
  }, []);

  const handleAddSomeFollow = useCallback((userId: string) => {
    setFollowingList((prev) => prev ? [...prev, userId] : [userId]);
  }, []);

  if (loading) return <p>loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <ul className={styles.postsContainer}>
          {posts.map((post) => (
            <PostItem
              key={post._id}
              item={post}
              likesCount={likesCounts[post._id] || 0}
              setLikesCount={handleLikesCountChange}
              onClick={() => openModal(post)}
              listFollowing={followingList}
              handleRemoveSomeFollow={handleRemoveSomeFollow}
              handleAddSomeFollow={handleAddSomeFollow}
            />
          ))}
        </ul>

        {selectedPost && (
          <HomePostModal post={selectedPost} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default HomePagePosts;
