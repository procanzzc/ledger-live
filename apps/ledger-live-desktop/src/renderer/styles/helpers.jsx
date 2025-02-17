// @flow

import React from "react";
import Color from "color";
import uniqueId from "lodash/uniqueId";

import { colors, fontFamilies } from "./theme";

export const rgba = (c: string, a: number) =>
  Color(c)
    .alpha(a)
    .rgb()
    .toString();

export const darken = (c: string, a: number) =>
  Color(c)
    .darken(a)
    .toString();

export const lighten = (c: string, a: number) =>
  Color(c)
    .lighten(a)
    .toString();

export const mix = (c: string, b: string, a: number) =>
  Color(c)
    .mix(Color(b), a)
    .toString();

export const ff = (v: string) => {
  const [font, type = "Regular"] = v.split("|");
  const { style, weight } = fontFamilies[font][type];
  const fallback = fontFamilies[font].fallback || "Arial";

  return {
    fontFamily: `${font}, ${fallback}`,
    fontWeight: weight,
    fontStyle: style,
  };
};

export const multiline = (str: string): React$Node[] =>
  str.split("\n").map(line => <p key={uniqueId()}>{line}</p>);

export const centerEllipsis = (str: string, maxLength: number = 25) =>
  str?.length > maxLength
    ? `${str.substr(0, Math.floor(maxLength / 2))}...${str.substr(Math.floor(-maxLength / 2))}`
    : str;

export function getMarketColor({ isNegative }: { isNegative: boolean }) {
  return isNegative ? colors.marketDown_western : colors.marketUp_western;
}
