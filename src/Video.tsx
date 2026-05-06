import "./style.css";

import { Composition } from 'remotion';
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
import { Chapter1_OpenLedger } from './dalio/scenes/Chapter1_OpenLedger';
import { Chapter4_NotEngine } from './dalio/scenes/Chapter4_NotEngine';
import { LottieTest } from './dalio/scenes/LottieTest';
import { PoseAnimatorScene } from './dalio/scenes/PoseAnimatorScene';
import { Chapter1_Ledger } from './dalio/scenes/Chapter1_Ledger';
import { Demo_FamilyTalk } from './dalio/scenes/Demo_FamilyTalk';
import { ChapterScene } from './dalio/scenes/ChapterScene';
import { ChapterSceneV2 } from './dalio/scenes/ChapterSceneV2';
import { CH1_V2 } from './dalio/scenes/CH1_V2';
import { DalioStoryTimeline } from './dalio/scenes/DalioStoryTimeline';
import { CHAPTERS, TOTAL_FRAMES } from './dalio/scenes/chapters';
import { staticFile } from 'remotion';

const FPS = 30;
const W = 1920;
const H = 1080;

export const RemotionVideo: React.FC = () => {
  return (
    <>
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

      {/* === C-: Principles 章节场景（新）=== */}
      <Composition id="C-Chapter1-OpenLedger" component={Chapter1_OpenLedger} durationInFrames={180} fps={FPS} width={W} height={H} />
      <Composition id="C-Chapter4-NotEngine" component={Chapter4_NotEngine} durationInFrames={180} fps={FPS} width={W} height={H} />
      <Composition id="Z-LottieTest" component={LottieTest} durationInFrames={150} fps={FPS} width={W} height={H} />
      <Composition
        id="C-Chapter1-Ledger-Pose"
        component={Chapter1_Ledger}
        durationInFrames={210}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="C-Demo-FamilyTalk"
        component={Demo_FamilyTalk}
        durationInFrames={210}
        fps={FPS}
        width={W}
        height={H}
      />

      {/* === Story chapters (data-driven) === */}
      <Composition
        id="DalioStory"
        component={DalioStoryTimeline}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
      {CHAPTERS.map((chapter) => (
        <Composition
          key={chapter.id}
          id={`Story-Ch${chapter.chapterNumber}-${chapter.id}`}
          component={ChapterScene}
          durationInFrames={chapter.durationFrames}
          fps={FPS}
          width={W}
          height={H}
          defaultProps={{ chapter }}
        />
      ))}
      <Composition
        id="Story-Ch1-V2"
        component={ChapterSceneV2}
        durationInFrames={CH1_V2.durationFrames}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ chapter: CH1_V2 }}
      />

      <Composition
        id="Z-PoseAnimator"
        component={PoseAnimatorScene}
        durationInFrames={120}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          svgSrc: staticFile('joshua-tpose-rigged.svg'),
          svgWidth: 1248,
          svgHeight: 1664,
        }}
      />

      <Composition id="B-ConceptReveal" component={Preview_ConceptReveal} durationInFrames={120} fps={FPS} width={W} height={H} />
      <Composition id="B-Comparison" component={Preview_Comparison} durationInFrames={120} fps={FPS} width={W} height={H} />
      <Composition id="B-Cycle" component={Preview_Cycle} durationInFrames={120} fps={FPS} width={W} height={H} />
      <Composition id="B-TimeSeries" component={Preview_TimeSeries} durationInFrames={120} fps={FPS} width={W} height={H} />
    </>
  );
};
