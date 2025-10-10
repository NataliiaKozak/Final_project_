import React from 'react';
import HomePagePostModal from '../../components/home/homePagePostModal/HomePagePostModal';
import type { PostPreview } from '../../interfaces/post.interface';
interface ExplorePostModalProps {
  post: PostPreview;
  isOpen: boolean;
  onClose: () => void;
}

const ExplorePostModal: React.FC<ExplorePostModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return <HomePagePostModal post={post} onClose={onClose} />;
};

export default ExplorePostModal;

