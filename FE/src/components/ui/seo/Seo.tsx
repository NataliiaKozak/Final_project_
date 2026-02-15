import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  ogImage?: string;
}

const SITE_NAME = 'ICHGRAMM';
const DEFAULT_DESCRIPTION = 'Share photos, follow friends, and explore the world on ICHGRAMM — an Instagram-like social platform.';

const Seo: React.FC<SeoProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = '/og-preview.png',
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;
