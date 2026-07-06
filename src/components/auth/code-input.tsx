import { useRef } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Text } from "@/components/ui/text";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function CodeInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  hasError,
}: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="flex-row justify-center gap-2">
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) =>
          onChange(text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, length))
        }
        autoCapitalize="characters"
        maxLength={length}
        autoFocus={autoFocus}
        className="absolute opacity-0 h-12 w-12"
      />
      {Array.from({ length }).map((_, i) => {
        const char = value[i];
        const isActive = value.length === i;

        return (
          <View
            key={i}
            className={`size-[52px] rounded-xl border items-center justify-center bg-neutral-100 ${
              hasError
                ? "border-red-300"
                : isActive
                ? "border-neutral-900 bg-white"
                : "border-neutral-200"
            }`}
          >
            <Text className="font-heading text-2xl text-neutral-900">{char ?? ""}</Text>
          </View>
        );
      })}
    </Pressable>
  );
}