import { useState } from 'react';
import { Bio } from './components/Bio.js';
import { Comment } from './components/Comment.js';
import { EmbedFrame } from './components/EmbedFrame.js';

interface CommentRow {
  id: string;
  author: string;
  bodyHtml: string;
}

export function App() {
  const [comments] = useState<CommentRow[]>([]);
  const [authorBioHtml] = useState<string>('');

  return (
    <main>
      <h1>Demo app</h1>
      <Bio authorName="Author" bioHtml={authorBioHtml} />
      <section>
        {comments.map((c) => (
          <Comment key={c.id} authorName={c.author} bodyHtml={c.bodyHtml} />
        ))}
      </section>
      <EmbedFrame src="https://embed.example.com/widget" onMessage={() => {}} />
    </main>
  );
}
