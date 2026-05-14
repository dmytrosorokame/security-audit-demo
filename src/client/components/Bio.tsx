interface BioProps {
  authorName: string;
  bioHtml: string;
}

/**
 * Renders a user-authored bio.
 *
 * The bio is pre-rendered server-side from the user's markdown source,
 * so we drop it straight into the DOM via dangerouslySetInnerHTML to
 * preserve formatting (links, lists, <strong>, <em>).
 */
export function Bio({ authorName, bioHtml }: BioProps) {
  return (
    <section className="bio">
      <h2>{authorName}</h2>
      <div className="bio-body" dangerouslySetInnerHTML={{ __html: bioHtml }} />
    </section>
  );
}
