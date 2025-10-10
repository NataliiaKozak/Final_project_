import React from 'react';
import { $api } from '../../../api/api';
import { IFollowItem } from '../../../interfaces/follow.interface';
import HomePostModal from '../homePagePostModal/HomePagePostModal';
import styles from './HomePagePosts.module.css';
import PostItem from '../postItem/PostItem';
import type { IPost } from '../../../interfaces/post.interface';

type State = {
  posts: IPost[];
  loading: boolean;
  error: string | null;
  likesCounts: Record<string, number>;
  selectedPost: IPost | null;
  followingList: string[] | null; // массив userId, на кого я подписан
};

class HomePagePosts extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      error: null,
      likesCounts: {},
      followingList: null,
      selectedPost: null,
    };
  }

  componentDidMount() {
    this.getAllPosts();
  }

  getAllPosts = async () => {
    try {
      // бэк: GET /posts — лента
      const { data } = await $api.get<IPost[]>('/posts');

      // если исключать свои — достанем userId из localStorage.user
      const meId = (() => {
        try {
          const raw = localStorage.getItem('user');
          if (!raw) return '';
          const parsed = JSON.parse(raw) as { _id?: string };
          return parsed?._id ?? '';
        } catch {
          return '';
        }
      })();

      const filtered = data.filter(p => {
        const authorId = typeof p.author === 'string' ? p.author : p.author?._id;
        return authorId !== meId;
      });

      const initialLikesCounts = filtered.reduce<Record<string, number>>((acc, p) => {
        acc[p._id] = p.likesCount ?? 0;
        return acc;
      }, {});

      this.setState({
        posts: filtered,
        likesCounts: initialLikesCounts,
        loading: false,
      });
    } catch (error) {
      this.setState({ error: 'Error loading feed', loading: false });
    }
  };

  handleLikesCountChange = (postId: string, newCount: number) => {
    this.setState(prev => ({
      likesCounts: { ...prev.likesCounts, [postId]: newCount },
    }));
  };

  openModal = (post: IPost) => {
    this.setState({ selectedPost: post });
  };

  closeModal = () => {
    this.setState({ selectedPost: null });
  };

  handleCheckMyFollowing = async () => {
    // токен несёт юзера; 
    const meId = (() => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) return '';
        const parsed = JSON.parse(raw) as { _id?: string };
        return parsed?._id ?? '';
      } catch {
        return '';
      }
    })();

    if (!meId) return;

    try {
      // бэк: GET /follows/:userId/following → IFollowItem[]
      const { data } = await $api.get<IFollowItem[]>(`/follows/${meId}/following`);
      const ids = data.map(u => u._id);
      this.setState({ ...this.state, followingList: ids });
    } catch (error) {
      console.error('Ошибка при проверке подписки:', error);
    }
  };

  handleRemoveSomeFollow = (userId: string) => {
    if (this.state.followingList) {
      this.setState({
        ...this.state,
        followingList: this.state.followingList.filter(id => id !== userId),
      });
    }
  };

  handleAddSomeFollow = (userId: string) => {
    if (this.state.followingList) {
      this.setState({
        ...this.state,
        followingList: [...this.state.followingList, userId],
      });
    }
  };

  render() {
    const { posts, loading, error, likesCounts, selectedPost } = this.state;

    if (this.state.followingList === null) {
      // однократная инициализация списка подписок
      this.handleCheckMyFollowing();
    }

    if (loading) return <p>loading...</p>;
    if (error) return <p>{error}</p>;

    return (
      <div style={{ display: 'flex' }}>
        <div>
          <ul className={styles.postsContainer}>
            {posts.map(post => (
              <PostItem
                key={post._id}
                item={post}
                likesCount={likesCounts[post._id] || 0}
                setLikesCount={this.handleLikesCountChange}
                onClick={() => this.openModal(post)}
                listFollowing={this.state.followingList}
                handleRemoveSomeFollow={this.handleRemoveSomeFollow}
                handleAddSomeFollow={this.handleAddSomeFollow}
              />
            ))}
          </ul>

          {selectedPost && (
            <HomePostModal post={selectedPost} onClose={this.closeModal} />
          )}
        </div>
      </div>
    );
  }
}

export default HomePagePosts;
