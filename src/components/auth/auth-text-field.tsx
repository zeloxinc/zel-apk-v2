import { useState } from "react";
import { View, TextInput, TextInputProps, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Eye, EyeOff } from "lucide-react-native";

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  secureToggle?: boolean;
}

export function AuthTextField({
  label,
  error,
  secureToggle,
  secureTextEntry,
  ...props
}: AuthTextFieldProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-xs font-heading uppercase tracking-wide text-neutral-500">
          {label}
        </Text>
      ) : null}

      <View className="relative justify-center">
        <TextInput
          {...props}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor="#a3a3a3"
          className={`h-12 px-4 rounded-xl border bg-neutral-50 text-sm font-primary text-neutral-900 ${
            error ? "border-red-400" : "border-neutral-200"
          } ${secureToggle ? "pr-11" : ""}`}
        />
        {secureToggle && (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8} className="absolute right-3">
            {hidden ? <Eye size={18} color="#a3a3a3" /> : <EyeOff size={18} color="#a3a3a3" />}
          </Pressable>
        )}
      </View>

      {error && <Text className="text-[11px] text-red-500 font-heading">{error}</Text>}
    </View>
  );
}