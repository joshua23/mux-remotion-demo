import "./style.css";

import { Composition } from 'remotion';
import { Timeline } from './Timeline';
import { DalioTimeline } from './dalio/Timeline.generated';

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="Timeline"
        component={Timeline}
        durationInFrames={1180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DalioFinanceVideo"
        component={DalioTimeline}
        durationInFrames={2400}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};