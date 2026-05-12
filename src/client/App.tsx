import { useState } from 'react';
import { Comment } from './components/Comment.js';
import { EmbedFrame } from './components/EmbedFrame.js';

interface CommentRow {
  id: string;
  author: string;
  bodyHtml: string;
}

export function App() {
  const [comments] = useState<CommentRow[]>([]);

  return (
    <main>
      <h1>Demo app</h1>
      <section>
        {comments.map((c) => (
          <Comment key={c.id} authorName={c.author} bodyHtml={c.bodyHtml} />
        ))}
      </section>
      <EmbedFrame src="https://embed.example.com/widget" onMessage={() => {}} />
    </main>
  );
}
