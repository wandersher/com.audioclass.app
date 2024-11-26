import { Image, StyleSheet, Platform } from "react-native";

import { Text, Dimensions, View } from "react-native";
import { SwiperFlatListWithGestureHandler } from "react-native-swiper-flatlist/WithGestureHandler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ReactElement, useRef, useState } from "react";
import { SwiperFlatListRefProps } from "react-native-swiper-flatlist/src/components/SwiperFlatList/SwiperFlatListProps";

const SWIPE_SPEED = 1000;
const SWIPE_RATIO = 2;

type SwiperProps<T> = {
  list: T[];
  render: (props: { item: T; index: number }) => ReactElement;
  onSwipe?: (props: { page: number; direction: "up" | "down" }) => any;
  onPageChange?: (props: { page: number; item: T }) => any;
};

export default function Swiper<T>(props: SwiperProps<T>) {
  const { list, render, onSwipe, onPageChange } = props;
  const ref = useRef<SwiperFlatListRefProps | null>(null);

  const [page, setPage] = useState(0);

  const gesture = Gesture.Pan()
    .minDistance(1)
    .onEnd(({ translationX, translationY, velocityX, velocityY }) => {
      if (Math.abs(velocityX) > SWIPE_SPEED || Math.abs(velocityY) > SWIPE_SPEED) {
        if (Math.abs(translationY) > Math.abs(translationX * SWIPE_RATIO)) {
          // Вертикальний свайп
          if (translationY < 0) {
            if (onSwipe) onSwipe({ page, direction: "up" });
          } else {
            if (onSwipe) onSwipe({ page, direction: "down" });
          }
        }
        if (Math.abs(translationX) > Math.abs(translationY * SWIPE_RATIO)) {
          // Горизонтальний свайп
          if (translationX < 0) {
            setPage((current) => {
              const index = current + 1 < list.length ? current + 1 : current;
              ref.current?.scrollToIndex({ index });
              if (onPageChange) onPageChange({ page: index, item: list[index] });
              return index;
            });
          } else {
            setPage((current) => {
              const index = current > 0 ? current - 1 : current;
              ref.current?.scrollToIndex({ index });
              if (onPageChange) onPageChange({ page: index, item: list[index] });
              return index;
            });
          }
        }
      }
    })
    .runOnJS(true);
  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <SwiperFlatListWithGestureHandler
          ref={ref}
          index={page}
          showPagination
          data={list}
          disableGesture
          paginationDefaultColor="rgba(0,0,0,0.2)"
          paginationStyleItem={{ width: 12, height: 12 }}
          useReactNativeGestureHandler
          renderItem={render}
        />
      </View>
    </GestureDetector>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
});
