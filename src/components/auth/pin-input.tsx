import { useRef } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Text } from "@/components/ui/text";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function PinInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  hasError,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="flex-row justify-center gap-2">
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        className="absolute opacity-0 h-12 w-12"
      />
      {Array.from({ length }).map((_, i) => {
        const digit = value[i];
        const isActive = value.length === i;

        return (
          <View
            key={i}
            className={`size-12 rounded-xl border items-center justify-center bg-neutral-50 ${
              hasError
                ? "border-red-300"
                : isActive
                ? "border-neutral-900 bg-white"
                : "border-neutral-200"
            }`}
          >
            <Text className="font-heading text-xl text-neutral-900">{digit ?? ""}</Text>
          </View>
        );
      })}
    </Pressable>
  );
}