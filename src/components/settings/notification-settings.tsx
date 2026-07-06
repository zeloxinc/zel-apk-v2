import React, { useState } from "react";
import { View, Text, Switch } from "react-native";

// TODO: Crucial; enable push notifications

const mockSettings: Record<string, boolean> = {
  notif_sales: true,
  notif_stock: true,
  notif_team: false,
};

function useSettingsMock() {
  const [settings, setSettings] = useState(mockSettings);
  const getSetting = (key: string, fallback: boolean) =>
    settings[key] !== undefined ? settings[key] : fallback;
  const saveSetting = (key: string, value: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const isOwner = true;
  return { getSetting, saveSetting, isOwner };
}

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}

function ToggleRow({ label, description, value, onChange, isLast }: ToggleRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between py-4 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <View className="flex-1 pr-4">
        <Text className="text-sm font-semibold text-foreground font-secondary">{label}</Text>
        <Text className="text-xs text-muted-foreground font-primary mt-0.5">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#e5e7eb", true: "#111827" }}
        thumbColor="#ffffff"
        ios_backgroundColor="#e5e7eb"
      />
    </View>
  );
}

export function NotificationSettings() {
  const { getSetting, saveSetting, isOwner } = useSettingsMock();

  const salesNotif = getSetting("notif_sales", true);
  const stockNotif = getSetting("notif_stock", true);
  const teamNotif = getSetting("notif_team", false);

  return (
    <View className="bg-card rounded-2xl  mb-1">
      <View className="p-5 pb-3">
        <Text className="text-base text-foreground font-heading">Alert Triggers</Text>
        <Text className="text-xs text-muted-foreground font-primary mt-0.5">
          Adjust runtime system sound signals and event alerts.
        </Text>
      </View>

      <View className="px-5 pb-5">
        <ToggleRow
          label="Sales Transactions"
          description="Flash indicator on successful cache completion."
          value={salesNotif}
          onChange={(v) => saveSetting("notif_sales", v)}
        />
        <ToggleRow
          label="Low Stock Indicators"
          description="Trigger warnings when variants sit at 5 items or below."
          value={stockNotif}
          onChange={(v) => saveSetting("notif_stock", v)}
        />
        {isOwner && (
          <ToggleRow
            label="New Staff Registry Flags"
            description="Signal alerts when new terminal registers connect."
            value={teamNotif}
            onChange={(v) => saveSetting("notif_team", v)}
            isLast
          />
        )}
      </View>
    </View>
  );
}