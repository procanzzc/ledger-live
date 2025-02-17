import React from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import * as Animatable from "react-native-animatable";
import { StackNavigationProp } from "@react-navigation/stack";
import { Flex, Text, InfiniteLoader } from "@ledgerhq/native-ui";
import { useTranslation } from "react-i18next";
import { LiveAppManifest } from "@ledgerhq/live-common/platform/types";
import ArrowLeft from "../../../../../icons/ArrowLeft";
import { TAB_BAR_SAFE_HEIGHT } from "../../../../../components/TabBar/TabBarSafeAreaView";
import { Layout } from "../Layout";
import { SearchBarValues } from "../types";
import { AppCard } from "../AppCard";
import Illustration from "../../../../../images/illustration/Illustration";
import { SearchBar } from "./SearchBar";
import { ManifestList } from "../ManifestList";

export * from "./SearchBar";

const noResultIllustration = {
  dark: require("../../../../../images/illustration/Dark/_051.png"),
  light: require("../../../../../images/illustration/Light/_051.png"),
};

type WildcardNavigation = StackNavigationProp<
  Record<string, object | undefined>
>;

const AnimatedView = Animatable.View;

type Props = {
  manifests: LiveAppManifest[];
  recentlyUsed: LiveAppManifest[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  listTitle?: React.ReactNode;
  backAction?: () => void;
  onSelect: (manifest: LiveAppManifest) => void;
} & SearchBarValues<LiveAppManifest>;

export function Search({
  manifests,
  recentlyUsed,
  title,
  onSelect,
  input,
  inputRef,
  result,
  isSearching,
  onCancel,
  onChange,
  onFocus,
  isActive,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<WildcardNavigation>();

  const isSearchBarEmpty = input === "";

  const isResultFound = !isSearchBarEmpty && result?.length !== 0;

  const recentlyUsedListComponent = (
    <>
      <Text variant={"h4"} fontWeight={"semiBold"} marginBottom={16}>
        {t("browseWeb3.catalog.section.recentlyUsed")}
      </Text>
      {recentlyUsed.map(manifest => (
        <AppCard
          key={`${manifest.id}.${manifest.branch}`}
          manifest={manifest}
          onPress={onSelect}
        />
      ))}
    </>
  );

  const noResultFoundComponent = (
    <Flex flexDirection={"column"} padding={4} marginTop={100}>
      <Flex alignItems="center">
        <Illustration
          size={164}
          lightSource={noResultIllustration.light}
          darkSource={noResultIllustration.dark}
        />
      </Flex>
      <Text textAlign="center" variant="h4" my={3}>
        {t("market.warnings.noAppFound")}
      </Text>

      <Text textAlign="center" variant="body" color="neutral.c70">
        {t("market.warnings.retrySearchKeyword")}
      </Text>
    </Flex>
  );

  return (
    <>
      <Layout
        isTitleVisible={true}
        title={title}
        topHeaderContent={
          <TouchableOpacity
            hitSlop={{
              bottom: 10,
              left: 24,
              right: 24,
              top: 10,
            }}
            style={{ paddingVertical: 16 }}
            onPress={navigation.goBack}
          >
            <ArrowLeft size={18} color={colors.neutral.c100} />
          </TouchableOpacity>
        }
        searchContent={
          <SearchBar
            input={input}
            inputRef={inputRef}
            onChange={onChange}
            onCancel={onCancel}
            onFocus={onFocus}
            isActive={isActive}
          />
        }
        bodyContent={
          isSearching ? (
            <Flex marginTop={100}>
              <InfiniteLoader size={40} />
            </Flex>
          ) : (
            <AnimatedView animation="fadeInUp" delay={50} duration={300}>
              <Flex paddingTop={4} paddingBottom={TAB_BAR_SAFE_HEIGHT + 50}>
                {isSearchBarEmpty ? (
                  recentlyUsed.length === 0 ? (
                    <ManifestList onSelect={onSelect} manifests={manifests} />
                  ) : (
                    recentlyUsedListComponent
                  )
                ) : isResultFound ? (
                  <ManifestList onSelect={onSelect} manifests={result} />
                ) : (
                  noResultFoundComponent
                )}
              </Flex>
            </AnimatedView>
          )
        }
      />
    </>
  );
}
