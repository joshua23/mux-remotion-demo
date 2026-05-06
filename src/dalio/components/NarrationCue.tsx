import React from 'react';
import { Sequence, Audio } from 'remotion';

interface ManifestEntry {
  readonly index: number;
  readonly mp3: string;
  readonly durationMs: number;
  readonly narration: string;
}

interface NarrationCueProps {
  readonly manifest: ManifestEntry[];
  readonly fps?: number;
  readonly audioBaseUrl?: string;
}

export const NarrationCue: React.FC<NarrationCueProps> = ({
  manifest,
  fps = 30,
  audioBaseUrl = '/audio',
}) => {
  let accumulatedFrames = 0;

  return (
    <>
      {manifest.map((entry) => {
        const durationInFrames = Math.ceil((entry.durationMs / 1000) * fps);
        const from = accumulatedFrames;
        accumulatedFrames += durationInFrames;

        const mp3Src = entry.mp3.startsWith('/')
          ? entry.mp3
          : `${audioBaseUrl}/${entry.mp3.split('/').pop()}`;

        return (
          <Sequence key={entry.index} from={from} durationInFrames={durationInFrames}>
            <Audio src={mp3Src} />
          </Sequence>
        );
      })}
    </>
  );
};
