import { Composition } from 'remotion';
import { CaptionComposition } from './CaptionComposition';
import transcription from './transcription.json';

export const RemotionRoot: React.FC = () => {
    const words = transcription.segments.flatMap(s => s.words);
    const durationInSeconds = Math.ceil(words[words.length - 1].end);

    return (
        <Composition
            id="CaptionComposition"
            component={CaptionComposition}
            durationInFrames={durationInSeconds * 30} // 30 fps
            fps={30}
            width={1920}
            height={1080}
            defaultProps={{ words }}
        />
    );
};
