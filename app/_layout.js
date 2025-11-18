import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      {/* Root stack controls screen transitions for the whole app */}
      <StatusBar style="auto" />
      <Stack>
        {/* The (tabs) group is one Stack screen with its own tab navigator */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        {/* This screen is pushed on top of tabs when you navigate to /details */}
        <Stack.Screen
          name="details"
          options={{ title: "Details" }}
        />
        {/* Video viewer screen for playing recorded videos */}
        <Stack.Screen
          name="video-viewer"
          options={{ 
            title: "影片播放",
            headerShown: false 
          }}
        />
      </Stack>
    </>
  );
}
