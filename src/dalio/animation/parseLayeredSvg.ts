import { PART_IDS, type PartId } from './types';

export interface ParsedPart {
  readonly id: PartId;
  /** Live DOM Nodes — consumer clones them via cloneNode(true) and appendChild. */
  readonly childNodes: ReadonlyArray<Node>;
  readonly pivot: { x: number; y: number };
}

export interface ParsedLayeredSvg {
  readonly viewBox: { width: number; height: number };
  /** Top-level child nodes that are NOT a recognised body-part group.
   *  These are background, silhouette and "carve" paths that must render
   *  flat at the back to preserve the artist's z-order. */
  readonly backgroundNodes: ReadonlyArray<Node>;
  readonly parts: ReadonlyArray<ParsedPart>;
}

const PART_SET = new Set<string>(PART_IDS);

export function parseLayeredSvg(svgText: string): ParsedLayeredSvg {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement;

  const vbAttr = root.getAttribute('viewBox') ?? '0 0 0 0';
  const vbParts: number[] = vbAttr.split(/\s+/).map(Number);
  const vw = vbParts[2] ?? 0;
  const vh = vbParts[3] ?? 0;

  const result: ParsedPart[] = [];
  const background: Node[] = [];

  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType !== 1) continue;
    const el = child as Element;
    if (el.tagName.toLowerCase() === 'g') {
      const id = el.getAttribute('id') ?? '';
      if (PART_SET.has(id)) {
        result.push({
          id: id as PartId,
          childNodes: Array.from(el.childNodes),
          pivot: extractPivot(el),
        });
        continue;
      }
    }
    background.push(child);
  }

  return {
    viewBox: { width: vw, height: vh },
    backgroundNodes: background,
    parts: result,
  };
}

function extractPivot(g: Element): { x: number; y: number } {
  const px = g.getAttribute('data-pivot-x');
  const py = g.getAttribute('data-pivot-y');
  if (px !== null && py !== null) {
    return { x: Number(px), y: Number(py) };
  }
  return bboxFromChildAttrs(g);
}

function bboxFromChildAttrs(g: Element): { x: number; y: number } {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  g.querySelectorAll('[x][y]').forEach((el) => {
    const x = Number(el.getAttribute('x'));
    const y = Number(el.getAttribute('y'));
    const w = Number(el.getAttribute('width') ?? 0);
    const h = Number(el.getAttribute('height') ?? 0);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  });
  if (!Number.isFinite(minX)) return { x: 0, y: 0 };
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}
