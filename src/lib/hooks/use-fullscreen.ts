

import { useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!isFullscreen) return;

    const reHide = () => {
      NavigationBar.setVisibilityAsync("hidden");
    };

    const sub = NavigationBar.addVisibilityListener(({ visibility }) => {
      if (visibility === "visible" && isFullscreen) {
        setTimeout(reHide, 1500); 
      }
    });

    return () => sub.remove();
  }, [isFullscreen]);

  const enter = useCallback(async () => {
    try {
      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBackgroundColorAsync("#00000000");
      }
      setStatusBarHidden(true, "fade");
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen enter failed:", err);
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (Platform.OS === "android") {
        await NavigationBar.setVisibilityAsync("visible");
        await NavigationBar.setPositionAsync("relative");
        await NavigationBar.setBackgroundColorAsync("#FFFFFF");
      }
      setStatusBarHidden(false, "fade");
      setIsFullscreen(false);
    } catch (err) {
      console.warn("Fullscreen exit failed:", err);
    }
  }, []);

  return { isFullscreen, enter, exit };
}