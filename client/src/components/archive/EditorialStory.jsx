import MuseumFrame from './MuseumFrame.jsx';
import { Link } from 'react-router-dom';

export default function EditorialStory({ story }) {
  return (
    <section className="editorial-story" aria-labelledby="editorial-title" data-reveal>
      <div className="editorial-story__inner">
        <div className="editorial-story__media">
          <MuseumFrame>
            <img
              src={story.image.url}
              alt={story.image.alt}
              width={story.image.width}
              height={story.image.height}
              loading="lazy"
            />
          </MuseumFrame>
        </div>
        <div>
          <p className="meta">{story.type}</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="editorial-title">{story.title}</h2>
          <p>{story.excerpt}</p>
          <p style={{ marginTop: '1.75rem' }}>
            <Link className="btn btn--soft" to={story.href}>
              {story.cta || 'Continue reading'}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
