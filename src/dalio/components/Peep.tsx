/**
 * Peep — Open Peeps (Pablo Stanley, CC0) 角色包装器
 *
 * 不通过 Effigy（其动态 require 不能被 webpack 打包）；改为静态 import
 * 只 import 我们 5 个角色实际用到的 body/head/face/accessory 模块。
 */
import React from 'react';

// === 静态 import 用到的 5 种 body ===
import ShirtColorPants from '@opeepsfun/open-peeps/build/body/standing/ShirtColorPants';
import EasingColorPants from '@opeepsfun/open-peeps/build/body/standing/EasingColorPants';
import EasingColorTee from '@opeepsfun/open-peeps/build/body/standing/EasingColorTee';
import BlazerColorPants from '@opeepsfun/open-peeps/build/body/standing/BlazerColorPants';

// === 5 种 head ===
import BangsTwo from '@opeepsfun/open-peeps/build/head/BangsTwo';
import Bun from '@opeepsfun/open-peeps/build/head/Bun';
import LongBangs from '@opeepsfun/open-peeps/build/head/LongBangs';
import FlatTop from '@opeepsfun/open-peeps/build/head/FlatTop';
import GrayShort from '@opeepsfun/open-peeps/build/head/GrayShort';

// === 4 种 face ===
import Calm from '@opeepsfun/open-peeps/build/face/Calm';
import Smile from '@opeepsfun/open-peeps/build/face/Smile';
import Cheeky from '@opeepsfun/open-peeps/build/face/Cheeky';
import Driven from '@opeepsfun/open-peeps/build/face/Driven';

// === 2 种 accessory ===
import Glasses from '@opeepsfun/open-peeps/build/accessory/Glasses';
import GlassesTwo from '@opeepsfun/open-peeps/build/accessory/GlassesTwo';

import { COLORS, FONTS } from '../theme';

export type PeepCharacter = 'joshua' | 'wife' | 'family-female' | 'family-male' | 'business' | 'generic';

interface CharacterDef {
  Body: React.FC<Record<string, string | undefined>>;
  bodyProps: Record<string, string>;
  Head: React.FC<Record<string, string | undefined>>;
  headProps: Record<string, string>;
  Face: React.FC<Record<string, string | undefined>>;
  faceProps: Record<string, string>;
  Accessory?: React.FC<Record<string, string | undefined>>;
  accessoryProps?: Record<string, string>;
  /** Hair group offset — 部分 head 类型在 Effigy 里有特定 transform 校正 */
  hairTransform?: string;
}

const SKIN = '#D08B5B';
const INK = COLORS.ink;

const PEEPS: Record<PeepCharacter, CharacterDef> = {
  joshua: {
    Body: ShirtColorPants,
    bodyProps: { skinColor: SKIN, shirtColor: COLORS.accent.teal, pantsColor: COLORS.accent.blue, shoesColor: '#fff', outlineColor: INK },
    Head: BangsTwo,
    headProps: { skinColor: SKIN, hairColor: INK, outlineColor: INK },
    hairTransform: 'translate(20 0)',
    Face: Calm,
    faceProps: { outlineColor: INK },
    Accessory: Glasses,
    accessoryProps: { outlineColor: INK },
  },
  wife: {
    Body: EasingColorPants,
    bodyProps: { skinColor: SKIN, shirtColor: COLORS.accent.red, pantsColor: INK, shoesColor: '#fff', outlineColor: INK },
    Head: Bun,
    headProps: { skinColor: SKIN, outlineColor: INK },
    hairTransform: 'translate(-20 -30)',
    Face: Smile,
    faceProps: { outlineColor: INK },
  },
  'family-female': {
    Body: EasingColorTee,
    bodyProps: { skinColor: SKIN, shirtColor: COLORS.accent.yellow, outlineColor: INK },
    Head: LongBangs,
    headProps: { skinColor: SKIN, hairColor: INK, outlineColor: INK },
    hairTransform: 'translate(-25 0)',
    Face: Cheeky,
    faceProps: { outlineColor: INK },
  },
  'family-male': {
    Body: ShirtColorPants,
    bodyProps: { skinColor: SKIN, shirtColor: COLORS.accent.blue, pantsColor: INK, shoesColor: '#fff', outlineColor: INK },
    Head: FlatTop,
    headProps: { skinColor: SKIN, hairColor: INK, outlineColor: INK },
    hairTransform: 'translate(50 0)',
    Face: Calm,
    faceProps: { outlineColor: INK },
  },
  business: {
    Body: BlazerColorPants,
    bodyProps: { skinColor: SKIN, jacketColor: INK, pantsColor: INK, shoesColor: '#fff', outlineColor: INK },
    Head: GrayShort,
    headProps: { skinColor: SKIN, hairColor: '#777', outlineColor: INK },
    hairTransform: 'translate(40 0)',
    Face: Driven,
    faceProps: { outlineColor: INK },
    Accessory: GlassesTwo,
    accessoryProps: { outlineColor: INK },
  },
  generic: {
    Body: ShirtColorPants,
    bodyProps: { skinColor: SKIN, shirtColor: COLORS.accent.teal, pantsColor: COLORS.accent.blue, shoesColor: '#fff', outlineColor: INK },
    Head: BangsTwo,
    headProps: { skinColor: SKIN, hairColor: INK, outlineColor: INK },
    Face: Calm,
    faceProps: { outlineColor: INK },
  },
};

interface PeepProps {
  readonly character?: PeepCharacter;
  readonly label?: string;
  readonly size?: number;
}

export const Peep: React.FC<PeepProps> = ({ character = 'generic', label, size = 360 }) => {
  const def = PEEPS[character];
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="184.21621621621625 210.7874999999999 940.2702702702704 1130.5875"
        overflow="visible"
        style={{
          width: size * (940 / 1130),
          height: size,
        }}
      >
        <g id="Bust">
          <g id="Body" transform="translate(147, 639) scale(1 1)">
            <def.Body {...def.bodyProps} />
          </g>
          <g id="Hair" transform={`translate(342, 190) scale(1 1) ${def.hairTransform ?? ''}`}>
            <def.Head {...def.headProps} />
          </g>
          <g id="Face" transform="translate(531, 366) scale(1 1)">
            <def.Face {...def.faceProps} />
          </g>
          {def.Accessory && (
            <g id="Accessories" transform="translate(419, 421) scale(1 1)">
              <def.Accessory {...(def.accessoryProps ?? {})} />
            </g>
          )}
        </g>
      </svg>
      {label && (
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: Math.max(14, size / 18),
            color: COLORS.ink,
            opacity: 0.85,
            marginTop: 4,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
