import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface CommentProps {
  authorName: string;
  bodyHtml: string;
}

/**
 * Safe comment renderer.
 * User-controlled HTML is sanitized through DOMPurify before being
 * injected via dangerouslySetInnerHTML — script/iframe/onerror handlers
 * are stripped.
 */
export function Comment({ authorName, bodyHtml }: CommentProps) {
  const safeHtml = useMemo(
    () => DOMPurify.sanitize(bodyHtml, { USE_PROFILES: { html: true } }),
    [bodyHtml],
  );

  return (
    <article className="comment">
      <header>{authorName}</header>
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </article>
  );
}
