import { useEffect } from 'react';

const TRUSTED_ORIGINS = ['https://embed.example.com'];

interface EmbedFrameProps {
  src: string;
  onMessage: (payload: unknown) => void;
}

/**
 * Safe iframe embed with origin-checked postMessage.
 * Rejects messages from any window that is not in TRUSTED_ORIGINS.
 */
export function EmbedFrame({ src, onMessage }: EmbedFrameProps) {
  useEffect(() => {
    function handler(event: MessageEvent) {
      if (!TRUSTED_ORIGINS.includes(event.origin)) {
        return;
      }
      onMessage(event.data);
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return <iframe src={src} sandbox="allow-scripts allow-same-origin" title="embed" />;
}
