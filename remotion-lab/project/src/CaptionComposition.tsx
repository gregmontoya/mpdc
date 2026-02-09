import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';

const {fontFamily} = loadFont();

export const CaptionComposition: React.FC<{
  words: Array<{word: string; start: number; end: number}>;
}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig(); // useVideoConfig to get the correct FPS
  const currentTime = frame / fps;

  // Chunk words into 4-word segments
  const chunks = [];
  for (let i = 0; i < words.length; i += 4) {
    if (words.slice(i, i + 4).length > 0) {
      chunks.push(words.slice(i, i + 4));
    }
  }

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    }}>
      {chunks.map((chunk, idx) => {
        const chunkStart = chunk[0].start;
        const chunkEnd = chunk[chunk.length - 1].end;

        if (currentTime >= chunkStart && currentTime <= chunkEnd) {
          return (
            <div
              key={idx}
              style={{
                fontFamily,
                fontSize: 72,
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                padding: '20px',
              }}
            >
              {chunk.map(w => cleanWord(w.word)).join(' ')}
            </div>
          );
        }
        return null;
      })}
    </AbsoluteFill>
  );
};

// Clean up punctuation but preserve contractions
function cleanWord(word: string): string {
  return word ? word
    .replace(/[.,!?;:]$/g, '') 
    .replace(/^[.,!?;:]/g, '') : '';
}
