import './NotFoundPage.css';
import notFoundImage from '../../assets/not-found-page.png';
const NotFoundPage = () => {
  return (
    <div className="matrix-background">
      <img src={notFoundImage} />
      <div className="content">
        <h1>Oops! Page Not Found (404 Error)</h1>
        <h5>
          We're sorry, but the page you're looking for doesn't seem to exist. If
          you typed the URL manually, please double-check the spelling. If you
          clicked on a link, it may be outdated or broken.
        </h5>
      </div>
    </div>
  );
};

export default NotFoundPage;
