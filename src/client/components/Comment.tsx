interface CommentProps {
  authorName: string;
  bodyHtml: string;
}

/**
 * Renders a comment. The bodyHtml is produced by our server-side markdown
 * renderer, so we can inject it as-is.
 */
export function Comment({ authorName, bodyHtml }: CommentProps) {
  return (
    <article className="comment">
      <header>{authorName}</header>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
