import { useRouter } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useGestureHandler,
  withSpring,
} from "react-native-reanimated";

export default function ChatBubble() {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const prevTranslateX = useRef(0);
  const prevTranslateY = useRef(0);

  const panGesture = useGestureHandler({
    onStart: () => {
      prevTranslateX.current = translateX.value;
      prevTranslateY.current = translateY.value;
    },
    onActive: (event: any) => {
      translateX.value = prevTranslateX.current + event.translationX;
      translateY.value = prevTranslateY.current + event.translationY;
    },
    onEnd: (event: any) => {
      // Keep bubble within screen bounds
      const maxX = 300; // Maximum X position
      const maxY = 600; // Maximum Y position
      const minX = 0;   // Minimum X position
      const minY = 0;   // Minimum Y position

      translateX.value = withSpring(
        Math.max(minX, Math.min(maxX, prevTranslateX.current + event.translationX)),
        { damping: 20, stiffness: 100 }
      );
      translateY.value = withSpring(
        Math.max(minY, Math.min(maxY, prevTranslateY.current + event.translationY)),
        { damping: 20, stiffness: 100 }
      );
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={panGesture}>
      <Animated.View style={[styles.chatBubble, animatedStyle]}>
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Ionicons name="chatbubbles-sharp" size={28} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  chatBubble: {
    position: "absolute",
    bottom: 25,
    left: 20,

    backgroundColor: "#29A9F8",
    width: 60,
    height: 60,
    borderRadius: 30,

    justifyContent: "center",
    alignItems: "center",

    elevation: 6,
  },
  touchableArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
