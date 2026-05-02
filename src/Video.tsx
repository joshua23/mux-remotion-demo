import "./style.css";

import { Composition } from 'remotion';
import { Timeline } from './Timeline';
import { DalioTimeline } from './dalio/Timeline.generated';
import {
  Preview_PaperBackground,
  Preview_StickFigureGallery,
  Preview_DrawPath,
  Preview_DrawArrow,
  Preview_CountUp,
  Preview_GrowBarTrio,
  Preview_SnapIcon,
  Preview_TitleSpotlight,
  Preview_ConceptReveal,
  Preview_Comparison,
  Preview_Cycle,
  Preview_TimeSeries,
} from './dalio/StudioPreviews';

const FPS = 30;
const W = 1920;
const H = 1080;

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="Timeline"
        component={Timeline}
        durationInFrames={1180}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="DalioFinanceVideo"
        component={DalioTimeline}
        durationInFrames={2400}
        fps={FPS}
        width={W}
        height={H}
      />

      {/* === Studio-only previews for visual QA === */}
      <Composition id="A-PaperBackground" component={Preview_PaperBackground} durationInFrames={60} fps={FPS} width={W} height={H} />
      <Composition id="A-StickFigureGallery" component={Preview_StickFigureGallery} durationInFrames={90} fps={FPS} width={W} height={H} />
      <Composition id="A-DrawPath" component={Preview_DrawPath} durationInFrames={90} fps={FPS} width={W} height={H} />
      <Composition id="A-DrawArrow" component={Preview_DrawArrow} durationInFrames={90} fps={FPS} width={W} height={H} />
      <Composition id="A-CountUp" component={Preview_CountUp} durationInFrames={90} fps={FPS} width={W} height={H} />
      <Composition id="A-GrowBarTrio" component={Preview_GrowBarTrio} durationInFrames={90} fps={FPS} width={W} height={H} />
      <Composition id="A-SnapIcon" component={Preview_SnapIcon} durationInFrames={60} fps={FPS} width={W} height={H} />
      <Composition id="A-TitleSpotlight" component={Preview_TitleSpotlight} durationInFrames={150} fps={FPS} width={W} height={H} />

      <Composition id="B-ConceptReveal" component={Preview_ConceptReveal} durationInFrames={120} fps={FPS} width={W} height={H} />
      <Composition id="B-Comparison" component={Preview_Comparison} durationInFrames={120} fps={FPS} width={W} height={H} />
      <Composition id="B-Cycle" component={Preview_Cycle} durationInFrames={120} fps={FPS} width={W} height={H} />
      <Composition id="B-TimeSeries" component={Preview_TimeSeries} durationInFrames={120} fps={FPS} width={W} height={H} />
    </>
  );
};
