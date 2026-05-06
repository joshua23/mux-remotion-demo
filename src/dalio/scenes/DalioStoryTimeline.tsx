/**
 * DalioStoryTimeline — sequences all 8 chapters via Remotion <Series>.
 * Each chapter sees its own local frame (0..durationFrames) thanks to Series.
 */
import React from 'react';
import { Series, Audio, staticFile } from 'remotion';

import { CHAPTERS } from './chapters';
import { ChapterScene } from './ChapterScene';

export const DalioStoryTimeline: React.FC = () => {
  return (
    <>
      <Series>
        {CHAPTERS.map((chapter) => (
          <Series.Sequence
            key={chapter.id}
            durationInFrames={chapter.durationFrames}
            name={`${chapter.chapterNumber}.${chapter.title}`}
          >
            <ChapterScene chapter={chapter} />
            <Audio src={staticFile(`narration/${chapter.id}.mp3`)} />
          </Series.Sequence>
        ))}
      </Series>
    </>
  );
};
