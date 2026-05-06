/**
 * LayeredCharacter — renders a hand- (or auto-) layered SVG with per-body-part
 * transforms. Loads SVG once via fetch (delayRender holds Remotion until
 * parsed), then re-emits the figure with each body-part <g> wrapped in an
 * animated transform. Inner content is injected via ref + cloneNode + standard
 * appendChild — no React unsafe-prop warning. Source SVGs come from public/ —
 * trusted assets we author, not user input.
 *
 * Background paths (silhouette + carve patches) render flat at the back to
 * preserve the artist's z-order; only body-part groups animate.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useCurrentFrame, delayRender, continueRender } from 'remotion';
import {
  parseLayeredSvg,
  type ParsedLayeredSvg,
  type ParsedPart,
} from '../animation/parseLayeredSvg';
import { interpolatePart } from '../animation/interpolatePart';
import type { PartTimeline } from '../animation/types';

interface Props {
  readonly src: string;
  readonly imgWidth: number;
  readonly imgHeight: number;
  readonly displayHeight: number;
  readonly parts: ReadonlyArray<PartTimeline>;
}

export const LayeredCharacter: React.FC<Props> = ({
  src,
  imgWidth,
  imgHeight,
  displayHeight,
  parts,
}) => {
  const frame = useCurrentFrame();
  const [parsed, setParsed] = useState<ParsedLayeredSvg | null>(null);

  useEffect(() => {
    const handle = delayRender(`LayeredCharacter ${src}`);
    fetch(src)
      .then((r) => r.text())
      .then((txt) => setParsed(parseLayeredSvg(txt)))
      .catch((e) => console.error('[LayeredCharacter]', src, e))
      .finally(() => continueRender(handle));
  }, [src]);

  const aspect = imgWidth / imgHeight;
  const displayWidth = displayHeight * aspect;

  if (!parsed) {
    return <div style={{ width: displayWidth, height: displayHeight }} />;
  }

  const partById: Record<string, PartTimeline> = {};
  for (const p of parts) partById[p.partId] = p;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${parsed.viewBox.width} ${parsed.viewBox.height}`}
      width={displayWidth}
      height={displayHeight}
      style={{ display: 'block' }}
    >
      <BackgroundLayer nodes={parsed.backgroundNodes} />
      {parsed.parts.map((part) => (
        <PartGroup key={part.id} part={part} timeline={partById[part.id]} frame={frame} />
      ))}
    </svg>
  );
};

const BackgroundLayer: React.FC<{ readonly nodes: ReadonlyArray<Node> }> = ({ nodes }) => {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);
    for (const n of nodes) host.appendChild(n.cloneNode(true));
  }, [nodes]);
  return <g ref={ref} data-layer="background" />;
};

const PartGroup: React.FC<{
  readonly part: ParsedPart;
  readonly timeline: PartTimeline | undefined;
  readonly frame: number;
}> = ({ part, timeline, frame }) => {
  const innerRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const host = innerRef.current;
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);
    for (const node of part.childNodes) host.appendChild(node.cloneNode(true));
  }, [part]);

  const tx = timeline
    ? interpolatePart(timeline, frame)
    : { rotate: 0, tx: 0, ty: 0, scale: 1, opacity: 1 };

  const transform =
    `translate(${part.pivot.x + tx.tx}, ${part.pivot.y + tx.ty}) ` +
    `rotate(${tx.rotate}) scale(${tx.scale}) ` +
    `translate(${-part.pivot.x}, ${-part.pivot.y})`;

  return (
    <g transform={transform} opacity={tx.opacity} data-part={part.id}>
      <g ref={innerRef} />
    </g>
  );
};
