// @flow
import { getAccountUnit, getMainAccount } from "@ledgerhq/live-common/account/index";
import type { Account, AccountLike } from "@ledgerhq/types-live";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "~/renderer/actions/modals";
import { formatCurrencyUnit } from "@ledgerhq/live-common/currencies/index";
import IconCoins from "~/renderer/icons/Coins";
import { localeSelector } from "~/renderer/reducers/settings";
import { BigNumber } from "bignumber.js";

type Props = {
  account: AccountLike,
  parentAccount: ?Account,
};

const AccountHeaderManageActionsComponent = ({ account, parentAccount }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const locale = useSelector(localeSelector);
  const unit = getAccountUnit(account);
  const mainAccount = getMainAccount(account, parentAccount);
  const minAmount = 10 ** unit.magnitude;

  const { tronResources, spendableBalance } = mainAccount;
  const tronPower = tronResources?.tronPower ?? 0;
  const earnRewardDisabled = tronPower === 0 && spendableBalance.lt(minAmount);

  const onClick = useCallback(() => {
    if (earnRewardDisabled) {
      dispatch(
        openModal("MODAL_NO_FUNDS_STAKE", {
          account,
          parentAccount,
        }),
      );
    } else if (tronPower > 0) {
      dispatch(
        openModal("MODAL_MANAGE_TRON", {
          parentAccount,
          account,
        }),
      );
    } else {
      dispatch(
        openModal("MODAL_TRON_REWARDS_INFO", {
          parentAccount,
          account,
        }),
      );
    }
  }, [account, earnRewardDisabled, tronPower, dispatch, parentAccount]);

  if (parentAccount) return null;

  const formattedMinAmount = formatCurrencyUnit(unit, BigNumber(minAmount), {
    disableRounding: true,
    alwaysShowSign: false,
    showCode: true,
    locale,
  });

  const disabledLabel = earnRewardDisabled
    ? `${t("tron.voting.warnEarnRewards", { amount: formattedMinAmount })}`
    : undefined;

  return [
    {
      key: "Stake",
      onClick: onClick,
      icon: IconCoins,
      label: t("account.stake"),
      tooltip: disabledLabel,
      event: "button_clicked",
      eventProperties: {
        button: "stake",
      },
    },
  ];
};

const AccountHeaderManageActions = ({ account, parentAccount }: Props) => {
  const mainAccount = getMainAccount(account, parentAccount);
  const { tronResources } = mainAccount;

  if (!tronResources) return null;

  return AccountHeaderManageActionsComponent({ account, parentAccount });
};

export default AccountHeaderManageActions;
