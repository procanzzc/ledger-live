// @flow

import { BigNumber } from "bignumber.js";
import invariant from "invariant";
import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import type { Unit } from "@ledgerhq/types-cryptoassets";
import { formatCurrencyUnit } from "@ledgerhq/live-common/currencies/index";
import { localeSelector, discreetModeSelector } from "~/renderer/reducers/settings";
import { getMarketColor } from "~/renderer/styles/helpers";
import Box from "~/renderer/components/Box";
import FlipTicker from "~/renderer/components/FlipTicker";
import IconBottom from "~/renderer/icons/ArrowDownRight";
import IconTop from "~/renderer/icons/ArrowUpRight";
import Ellipsis from "~/renderer/components/Ellipsis";

import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

const T: ThemedComponent<{ color?: string, inline?: boolean, ff?: string }> = styled(Box).attrs(
  p => ({
    ff: p.ff || "Inter|Medium",
    horizontal: true,
    color: p.color,
  }),
)`
  white-space: pre;
  text-overflow: ellipsis;
  display: ${p => (p.inline ? "inline-block" : "block")};
  flex-shrink: ${p => (p.noShrink ? "0" : "1")};
  width: ${p => (p.inline ? "" : "100%")};
  overflow: hidden;
`;

const I = ({ color, children }: { color?: string, children: any }) => (
  <Box color={color}>{children}</Box>
);

I.defaultProps = {
  color: undefined,
};

type OwnProps = {
  unit?: Unit,
  val: BigNumber | number,
  alwaysShowSign?: boolean,
  showCode?: boolean,
  withIcon?: boolean,
  color?: string,
  animateTicker?: boolean,
  disableRounding?: boolean,
  isPercent?: boolean,
  subMagnitude?: number,
  prefix?: string,
  ellipsis?: boolean,
  suffix?: string,
  showAllDigits?: boolean,
  alwaysShowValue?: boolean, // overrides discreet mode
  dynamicSignificantDigits?: number,
  staticSignificantDigits?: number,
};

const mapStateToProps = createStructuredSelector({
  discreet: discreetModeSelector,
  locale: localeSelector,
});

type Props = OwnProps & {
  discreet: boolean,
  locale: string,
};

function FormattedVal(props: Props) {
  const {
    animateTicker,
    disableRounding,
    unit,
    isPercent,
    alwaysShowSign,
    showCode,
    withIcon,
    locale,
    color,
    ellipsis,
    subMagnitude,
    prefix,
    suffix,
    showAllDigits,
    alwaysShowValue,
    discreet,
    dynamicSignificantDigits,
    staticSignificantDigits,
    ...p
  } = props;
  const valProp = props.val;
  let val: BigNumber = valProp instanceof BigNumber ? valProp : BigNumber(valProp);

  invariant(val, "FormattedVal require a `val` prop. Received `undefined`");

  const isZero = val.isZero();
  const isNegative = val.isNegative() && !isZero;

  let text = "";

  if (isPercent) {
    // FIXME move out the % feature of this component... totally unrelated to currency & annoying for flow type.
    text = `${alwaysShowSign ? (isNegative ? "- " : "+ ") : ""}${(isNegative
      ? val.negated()
      : val
    ).toString()} %`;
  } else {
    invariant(unit, "FormattedVal require a `unit` prop. Received `undefined`");

    if (withIcon && isNegative) {
      val = val.negated();
    }

    text = formatCurrencyUnit(unit, val, {
      alwaysShowSign,
      disableRounding,
      showCode,
      locale,
      subMagnitude,
      discreet: alwaysShowValue ? false : discreet,
      showAllDigits,
      dynamicSignificantDigits,
      staticSignificantDigits,
    });
  }

  if (prefix) text = prefix + text;
  if (suffix) text += suffix;

  if (animateTicker) {
    text = <FlipTicker value={text} />;
  } else if (ellipsis) {
    text = <Ellipsis>{text}</Ellipsis>;
  }

  const marketColor = getMarketColor({
    isNegative,
  });

  return (
    <T {...p} color={color || marketColor} withIcon={withIcon}>
      {withIcon ? (
        <Box horizontal alignItems="center">
          <Box mr={1}>
            <I color={marketColor}>
              {isNegative ? <IconBottom size={24} /> : isZero ? null : <IconTop size={24} />}
            </I>
          </Box>
          <Box horizontal alignItems="center">
            {text}
          </Box>
        </Box>
      ) : (
        text
      )}
    </T>
  );
}

FormattedVal.defaultProps = {
  subMagnitude: 0,
};

const m: React$ComponentType<OwnProps> = connect(mapStateToProps)(FormattedVal);

export default m;
