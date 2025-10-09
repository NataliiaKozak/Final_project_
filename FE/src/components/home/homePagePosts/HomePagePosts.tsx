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
      // твой бэк: GET /posts — лента
      const { data } = await $api.get<IPost[]>('/posts');

      // если хочешь исключать свои — достанем userId из localStorage.user
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
    // токен несёт моего юзера; но если где-то нужен id:
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
      // твой бэк: GET /follows/:userId/following → IFollowItem[]
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
// type State = {
//   posts: IPost[];
//   loading: boolean;
//   error: string | null;
//   likesCounts: Record<string, number>;
//   selectedPost: IPost | null;
//   followingList: string[] | null; // массив userId, на кого подписан текущий
// };

// class HomePagePosts extends React.Component<{}, State> {
//   constructor(props: {}) {
//     super(props);
//     this.state = {
//       posts: [],
//       loading: true,
//       error: null,
//       likesCounts: {},
//       followingList: null,
//       selectedPost: null,
//     };
//   }

//   componentDidMount() {
//     this.getAllPosts();
//   }

//   getAllPosts = async () => {
//     try {
//       // твой фид: GET /posts
//       const { data: allPosts } = await $api.get<IPost[]>('/posts');

//       // если нужно исключить собственные посты — берём из localStorage
//       const meStr = localStorage.getItem('user');
//       const me = meStr ? JSON.parse(meStr) as { _id: string } : null;
//       const myId = me?._id ?? '';

//       const filtered = allPosts.filter(p => {
//         const authorId = typeof p.author === 'string' ? p.author : p.author?._id;
//         return authorId !== myId;
//       });

//       // перемешаем как в оригинале
//       const shuffled = filtered.sort(() => Math.random() - 0.5);

//       // подтянем «последний комментарий» (опционально)
//       const postsWithLast = await Promise.all(
//         shuffled.map(async (post) => {
//           try {
//             const { data: comments } = await $api.get<IComment[]>(`/comments/post/${post._id}`);
//             // просто положим в кастомное поле, PostItem его не читает — оставляем на будущее
//             (post as any).lastComment = comments.length ? comments[comments.length - 1].text : '';
//           } catch {
//             (post as any).lastComment = 'No comments yet';
//           }
//           return post;
//         })
//       );

//       const initialLikes = postsWithLast.reduce<Record<string, number>>((acc, p) => {
//         acc[p._id] = p.likesCount ?? 0;
//         return acc;
//       }, {});

//       this.setState({
//         posts: postsWithLast,
//         likesCounts: initialLikes,
//         loading: false,
//       });
//     } catch (error) {
//       this.setState({ error: 'Error loading feed', loading: false });
//     }
//   };

//   handleLikesCountChange = (postId: string, newCount: number) => {
//     this.setState(prev => ({
//       likesCounts: { ...prev.likesCounts, [postId]: newCount },
//     }));
//   };

//   openModal = (post: IPost) => {
//     this.setState({ selectedPost: post });
//   };

//   closeModal = () => {
//     this.setState({ selectedPost: null });
//   };

//   handleCheckMyFollowing = async () => {
//     const meStr = localStorage.getItem('user');
//     if (!meStr) return;
//     const me = JSON.parse(meStr) as { _id: string };

//     try {
//       //  бэк: GET /follows/:userId/following → IFollowItem[]
//       const { data } = await $api.get<IFollowItem[]>(`/follows/${me._id}/following`);
//       const ids = data.map(u => u._id);
//       this.setState({ followingList: ids });
//     } catch (error) {
//       console.error('Ошибка при проверке подписки:', error);
//     }
//   };

//   handleRemoveSomeFollow = (userId: string) => {
//     if (this.state.followingList) {
//       const newList = this.state.followingList.filter(id => id !== userId);
//       this.setState({ followingList: newList });
//     }
//   };

//   handleAddSomeFollow = (userId: string) => {
//     if (this.state.followingList) {
//       this.setState({
//         followingList: [...this.state.followingList, userId],
//       });
//     }
//   };

//   render() {
//     const { posts, loading, error, likesCounts, selectedPost } = this.state;

//     if (this.state.followingList === null) {
//       this.handleCheckMyFollowing();
//     }
//     if (loading) return <p>loading...</p>;
//     if (error) return <p>{error}</p>;

//     return (
//       <div style={{ display: 'flex' }}>
//         <div>
//           <ul className={styles.postsContainer}>
//             {posts.map(post => (
//               <PostItem
//                 key={post._id}
//                 item={post}
//                 likesCount={likesCounts[post._id] || 0}
//                 setLikesCount={this.handleLikesCountChange}
//                 onClick={() => this.openModal(post)}
//                 listFollowing={this.state.followingList}
//                 handleAddSomeFollow={this.handleAddSomeFollow}
//                 handleRemoveSomeFollow={this.handleRemoveSomeFollow}
//               />
//             ))}
//           </ul>

//           {selectedPost && (
//             <HomePostModal post={selectedPost} onClose={this.closeModal} />
//           )}
//         </div>
//       </div>
//     );
//   }
// }

// export default HomePagePosts;


// type State = {
//   posts: IPost[];
//   loading: boolean;
//   error: string | null;
//   likesCounts: { [key: string]: number };
//   selectedPost: IPost | null;
//   followingList: string[] | null; // массив userId, на кого подписан текущий
// };

// class HomePagePosts extends React.Component<{}, State> {
//   constructor(props: {}) {
//     super(props);
//     this.state = {
//       posts: [],
//       loading: true,
//       error: null,
//       likesCounts: {},
//       followingList: null,
//       selectedPost: null,
//     };
//   }

//   componentDidMount() {
//     this.getAllPosts();
//   }

//   getAllPosts = async () => {
//     try {
//       // твой фид
//       const { data } = await $api.get<IPost[]>('/posts');
//       const initialLikesCounts = data.reduce((acc, post) => {
//         acc[post._id] = post.likesCount ?? 0;
//         return acc;
//       }, {} as { [key: string]: number });

//       this.setState({
//         posts: data,
//         likesCounts: initialLikesCounts,
//         loading: false,
//       });
//     } catch (error) {
//       this.setState({ error: 'Error loading posts', loading: false });
//     }
//   };

//   handleLikesCountChange = (postId: string, newCount: number) => {
//     this.setState((prev) => ({
//       likesCounts: {
//         ...prev.likesCounts,
//         [postId]: newCount,
//       },
//     }));
//   };

//   openModal = (post: IPost) => {
//     this.setState({ selectedPost: post });
//   };

//   closeModal = () => {
//     this.setState({ selectedPost: null });
//   };

//   handleCheckMyFollowing = async () => {
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return;
//     const me = JSON.parse(userStr) as { _id: string };

//     try {
//       // твой бэк: GET /follows/:userId/following
//       const { data } = await $api.get<IFollowItem[]>(`/follows/${me._id}/following`);
//       const ids = data.map((u) => u._id);
//       this.setState({ followingList: ids });
//     } catch (error) {
//       console.error('Ошибка при проверке подписки:', error);
//     }
//   };

//   handleRemoveSomeFollow = (userId: string) => {
//     if (this.state.followingList) {
//       const newList = this.state.followingList.filter((id) => id !== userId);
//       this.setState({ followingList: newList });
//     }
//   };

//   handleAddSomeFollow = (userId: string) => {
//     if (this.state.followingList) {
//       this.setState({
//         followingList: [...this.state.followingList, userId],
//       });
//     }
//   };

//   render() {
//     const { posts, loading, error, likesCounts, selectedPost, followingList } = this.state;

//     if (followingList === null) {
//       this.handleCheckMyFollowing();
//     }
//     if (loading) return <p>loading...</p>;
//     if (error) return <p>{error}</p>;

//     return (
//       <div style={{ display: 'flex' }}>
//         <div>
//           <ul className={styles.postsContainer}>
//             {posts.map((post) => (
//               <PostItem
//                 key={post._id}
//                 item={post}
//                 likesCount={likesCounts[post._id] || 0}
//                 setLikesCount={this.handleLikesCountChange}
//                 onClick={() => this.openModal(post)}
//                 listFollowing={this.state.followingList}
//                 handleRemoveSomeFollow={this.handleRemoveSomeFollow}
//                 handleAddSomeFollow={this.handleAddSomeFollow}
//               />
//             ))}
//           </ul>
//           {selectedPost && (
//             <HomePostModal post={selectedPost} onClose={this.closeModal} />
//           )}
//         </div>
//       </div>
//     );
//   }
// }

// export default HomePagePosts;

//выдумка
// type State = {
//   posts: IPost[];
//   loading: boolean;
//   error: string | null;
//   likesCounts: Record<string, number>;
//   selectedPost: IPost | null;
//   followingList: string[] | null; // массив айдишников авторов, на которых подписан текущий пользователь
// };

// class HomePagePosts extends React.Component<{}, State> {
//   constructor(props: {}) {
//     super(props);
//     this.state = {
//       posts: [],
//       loading: true,
//       error: null,
//       likesCounts: {},
//       followingList: null,
//       selectedPost: null,
//     };
//   }

//   componentDidMount() {
//     this.getAllPosts();
//   }

//   // ПОЛНОСТЬЮ ПОД ТВОЙ БЭК:
//   // - посты: IPost (image, description, author, likesCount, commentsCount, createdAt, ...)
//   // - эндпоинт: при необходимости замени '/posts/public' на свой (например, '/post/all/public')
//   getAllPosts = async () => {
//     try {
//       const stored = localStorage.getItem('user');
//       const me = stored ? JSON.parse(stored) as { _id?: string } : null;
//       const myId = me?._id || '';

//       const { data } = await $api.get<IPost[]>('/posts/public');

//       // убираем мои посты
//       const filtered = data.filter((p) => {
//         const authorId = typeof p.author === 'string' ? p.author : p.author?._id;
//         return authorId !== myId;
//       });

//       // перемешать слегка, как было у тебя
//       const shuffled = filtered.sort(() => Math.random() - 0.5);

//       // инициализируем локальные счетчики лайков из likesCount
//       const initialLikes: Record<string, number> = {};
//       for (const p of shuffled) {
//         initialLikes[p._id] = p.likesCount ?? 0;
//       }

//       this.setState({
//         posts: shuffled,
//         likesCounts: initialLikes,
//         loading: false,
//       });

//       // подтянем список моих подписок один раз (если нужно)
//       if (this.state.followingList === null && myId) {
//         this.handleCheckMyFollowing(myId);
//       }
//     } catch (error) {
//       this.setState({ error: 'Error loading feed', loading: false });
//     }
//   };

//   handleCheckMyFollowing = async (myId: string) => {
//     try {
//       const { data } = await $api.get<IFollowItem[]>(`/follow/${myId}/following`);
//       const ids = data.map((u) => u._id);
//       this.setState({ followingList: ids });
//     } catch (error) {
//       console.error('Ошибка при проверке подписки:', error);
//       this.setState({ followingList: [] });
//     }
//   };

//   handleLikesCountChange = (postId: string, newCount: number) => {
//     this.setState((prev) => ({
//       likesCounts: { ...prev.likesCounts, [postId]: newCount },
//     }));
//   };

//   openModal = (post: IPost) => {
//     this.setState({ selectedPost: post });
//   };

//   closeModal = () => {
//     this.setState({ selectedPost: null });
//   };

//   handleRemoveSomeFollow = (userId: string) => {
//     if (this.state.followingList) {
//       const newList = this.state.followingList.filter((id) => id !== userId);
//       this.setState({ followingList: newList });
//     }
//   };

//   handleAddSomeFollow = (userId: string) => {
//     if (this.state.followingList) {
//       this.setState({ followingList: [...this.state.followingList, userId] });
//     }
//   };

//   render() {
//     const { posts, loading, error, likesCounts, selectedPost, followingList } = this.state;

//     if (loading) return <p>loading...</p>;
//     if (error) return <p>{error}</p>;

//     return (
//       <div style={{ display: 'flex' }}>
//         <div>
//           <ul className={styles.postsContainer}>
//             {posts.map((post) => (
//               <PostItem
//                 key={post._id}
//                 item={post}
//                 likesCount={likesCounts[post._id] || 0}
//                 setLikesCount={this.handleLikesCountChange}
//                 onClick={() => this.openModal(post)}
//                 listFollowing={followingList}
//                 handleRemoveSomeFollow={this.handleRemoveSomeFollow}
//                 handleAddSomeFollow={this.handleAddSomeFollow}
//               />
//             ))}
//           </ul>

//           {selectedPost && (
//             <HomePostModal post={selectedPost} onClose={this.closeModal} />
//           )}
//         </div>
//       </div>
//     );
//   }
// }

// export default HomePagePosts;

