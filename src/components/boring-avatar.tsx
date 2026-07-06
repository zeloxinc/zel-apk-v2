
import React from "react";
import { View } from "react-native";
import Svg, { Rect, Circle, Path } from "react-native-svg";

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pickColor(palette: string[], name: string, offset: number): string {
  const hash = hashCode(name + offset);
  return palette[hash % palette.length];
}

function getBeamData(name: string) {
  const h = hashCode(name);
  return {
    faceX: 65 + (h % 20) - 10,
    faceY: 55 + ((h >> 4) % 16) - 8,
    eyeSpread: 4 + (h % 5),
    mouthCurve: (h >> 8) % 2 === 0 ? "smile" : "frown",
    eyeOpen: (h >> 12) % 3 > 0, 
  };
}

interface BoringAvatarProps {
  size?: number;
  name?: string;
  colors?: string[];
  variant?: "beam"; 
}

export function BoringAvatar({
  size = 40,
  name = "User",
  colors = ["#6f5846", "#a95a52", "#e35b5d", "#f18052", "#ffa446"],
}: BoringAvatarProps) {
  const bg = pickColor(colors, name, 0);
  const fg = pickColor(colors, name, 1);
  const { faceX, faceY, eyeSpread, mouthCurve, eyeOpen } = getBeamData(name);

  const eyeY = faceY - 6;
  const leftEyeX = faceX - eyeSpread;
  const rightEyeX = faceX + eyeSpread;
  const eyeR = eyeOpen ? 2.5 : 1.5;

  const mouthY = faceY + 7;
  const mouthPath =
    mouthCurve === "smile"
      ? `M ${faceX - 7} ${mouthY} Q ${faceX} ${mouthY + 5} ${faceX + 7} ${mouthY}`
      : `M ${faceX - 7} ${mouthY + 4} Q ${faceX} ${mouthY - 1} ${faceX + 7} ${mouthY + 4}`;

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Background */}
        <Rect width="120" height="120" fill={bg} />
        {/* Face circle */}
        <Circle cx={faceX} cy={faceY} r={28} fill={fg} opacity={0.85} />
        {/* Eyes */}
        <Circle cx={leftEyeX} cy={eyeY} r={eyeR} fill={bg} />
        <Circle cx={rightEyeX} cy={eyeY} r={eyeR} fill={bg} />
        {/* Mouth */}
        <Path d={mouthPath} stroke={bg} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}