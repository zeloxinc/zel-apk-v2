import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ShieldCheck } from "lucide-react-native";

interface PinInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function PinInput({ label, value, onChange }: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  return (
    <View className="gap-2">
      <Text className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-secondary">
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        className="flex-row gap-1.5"
      >
        {digits.map((digit, i) => {
          const isFilled = i < value.length;
          const isCurrent = i === value.length;
          return (
            <View
              key={i}
              className={`w-10 h-12 rounded-xl border items-center justify-center ${
                isCurrent
                  ? "border-foreground bg-card"
                  : isFilled
                  ? "border-border bg-muted"
                  : "border-border bg-muted"
              }`}
            >
              {isFilled ? (
                <View className="w-2.5 h-2.5 rounded-full bg-foreground" />
              ) : (
                <View className="w-1 h-1 rounded-full bg-muted-foreground opacity-30" />
              )}
            </View>
          );
        })}
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        className="absolute opacity-0 w-full h-full"
        style={{ position: "absolute", opacity: 0 }}
      />
    </View>
  );
}

export function SecuritySettings() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const pinsMatch = pin.length === 6 && pin === confirmPin;
  const isDisabled = !pinsMatch;

  const handlePinUpdate = () => {
    if (!pinsMatch) return;
    Alert.alert("PIN Updated", "Your 6-digit authentication PIN has been saved securely.");
    setPin("");
    setConfirmPin("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="bg-card rounded-2xl border border-border mx-4 mb-1">
        <View className="p-5 pb-3 flex-row items-start gap-3">
          <View className="w-9 h-9 rounded-xl bg-muted border border-border items-center justify-center mt-0.5">
            <ShieldCheck size={18} color="#6b7280" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground font-heading">
              Terminal Auth Vault
            </Text>
            <Text className="text-xs text-muted-foreground font-primary mt-0.5">
              Set your 6-digit PIN to unlock quick-access cash drawers.
            </Text>
          </View>
        </View>

        <View className="px-5 pb-5 gap-5">
          <PinInput label="New 6-Digit PIN" value={pin} onChange={setPin} />
          <PinInput label="Confirm Secret PIN" value={confirmPin} onChange={setConfirmPin} />

          {pin.length === 6 && confirmPin.length === 6 && !pinsMatch && (
            <View className="bg-destructive/10 border border-destructive/20 rounded-xl px-3.5 py-2.5">
              <Text className="text-xs font-semibold text-destructive font-secondary">
                PINs don't match. Please re-enter both fields.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handlePinUpdate}
            disabled={isDisabled}
            activeOpacity={0.8}
            className={`h-11 rounded-xl items-center justify-center ${
              isDisabled ? "bg-muted" : "bg-primary"
            }`}
          >
            <Text
              className={`text-sm font-semibold font-secondary ${
                isDisabled ? "text-muted-foreground" : "text-primary-foreground"
              }`}
            >
              Update Authentication PIN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}