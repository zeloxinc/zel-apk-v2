import React, { useState } from "react";
import { View, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { WifiOff, Store, Copy, RefreshCw, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";

// RNR components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SHOP = {
  shop_id: "shop_001",
  shop_name: "Zelshop Mega Mart",
  shop_phone_number: "+254712345678",
  shop_business_email: "sales@zelshop.com",
  shop_location_street: "Mombasa Rd",
  shop_location_city: "Nairobi",
  shop_location_county: "Nairobi",
  shop_tax_pin: "A123456789Z",
};

const MOCK_STAFF = [
  { profile_user_id: "usr_001", profile_full_name: "Lyda Conley",  role_name: "OWNER"   },
  { profile_user_id: "usr_002", profile_full_name: "Brian Mwangi", role_name: "CASHIER" },
  { profile_user_id: "usr_003", profile_full_name: "Amara Osei",   role_name: "CASHIER" },
];

const MOCK_IS_ONLINE = true;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function nameHue(name: string) {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

// ── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  prefix?: string;
}

function Field({ label, value, onChange, placeholder, disabled, error, keyboardType = "default", prefix }: FieldProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Explicit theme-aware colors — avoids relying on CSS vars that don't resolve
  // in RN TextInput (which isn't a web element)
  const inputTextColor     = isDark ? "#f9fafb" : "#111827";
  const placeholderColor   = isDark ? "#6b7280" : "#9ca3af";
  const borderColor        = error
    ? "#ef4444"
    : isDark ? "#27272a" : "#e5e7eb";
  const bgColor            = isDark ? "#18181b" : "#ffffff";
  const prefixColor        = isDark ? "#a1a1aa" : "#6b7280";

  return (
    <View className="gap-2">
      <Label nativeID={label} className="text-[11px] font-heading uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>

      {prefix ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor,
            backgroundColor: bgColor,
            paddingHorizontal: 14,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: prefixColor, marginRight: 4 }}>
            {prefix}
          </Text>
          <TextInput
            aria-labelledby={label}
            value={value}
            onChangeText={onChange}
            editable={!disabled}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            keyboardType={keyboardType}
            style={{ flex: 1, fontSize: 14, color: inputTextColor, paddingVertical: 0 }}
          />
        </View>
      ) : (
        <Input
          aria-labelledby={label}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          style={{
            borderColor,
            backgroundColor: bgColor,
            color: inputTextColor,
            opacity: disabled ? 0.5 : 1,
          }}
          className="h-11 rounded-xl"
        />
      )}
    </View>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-4">
      <Text className="text-base font-heading text-foreground">{title}</Text>
      {subtitle && (
        <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
      )}
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ShopSettings() {
  const isOnline = MOCK_IS_ONLINE;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [shopName, setShopName]   = useState(MOCK_SHOP.shop_name);
  const [phone, setPhone]         = useState(MOCK_SHOP.shop_phone_number.replace("+254", ""));
  const [email, setEmail]         = useState(MOCK_SHOP.shop_business_email);
  const [street, setStreet]       = useState(MOCK_SHOP.shop_location_street);
  const [city, setCity]           = useState(MOCK_SHOP.shop_location_city);
  const [county, setCounty]       = useState(MOCK_SHOP.shop_location_county);
  const [taxPin, setTaxPin]       = useState(MOCK_SHOP.shop_tax_pin);
  const [saving, setSaving]       = useState(false);
  const [inviteCode, setInviteCode]   = useState<string | null>(null);
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null);
  const [staffList, setStaffList] = useState(MOCK_STAFF);

  const isPhoneValid  = !phone  || /^[17]\d{8}$/.test(phone.trim());
  const isEmailValid  = !email  || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isTaxPinValid = !taxPin || /^[AP]\d{9}[A-Z]$/i.test(taxPin.trim());
  const canSave = isOnline && !saving && isPhoneValid && isEmailValid && isTaxPinValid;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
  };

  const handleGenerateInvite = () => {
    if (!isOnline) return;
    const code   = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    setInviteCode(code);
    setInviteExpiry(expiry.toISOString());
  };

  const removeStaff = (id: string) =>
    setStaffList((prev) => prev.filter((s) => s.profile_user_id !== id));

  const cardBg      = isDark ? "#18181b" : "#ffffff";
  const cardBorder  = isDark ? "#27272a" : "#e5e7eb";
  const mutedBg     = isDark ? "#27272a" : "#f4f4f5";

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* ── Offline Banner ── */}
      {!isOnline && (
        <View className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mb-5">
          <WifiOff size={16} color="#92400e" />
          <Text className="text-xs font-secondary text-amber-900 dark:text-amber-200 flex-1">
            You're offline. Connect to update shop settings.
          </Text>
        </View>
      )}

      {/* ── Shop Identity ── */}
      <View
        style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
        className="flex-row items-center gap-3 p-4 rounded-2xl mb-6"
      >
        
        <View className="flex-1 min-w-0">
          <Text className="text-base font-heading text-foreground" numberOfLines={1}>{shopName}</Text>
          <Text className="text-xs text-muted-foreground">{MOCK_SHOP.shop_id}</Text>
        </View>
      </View>

      {/* ── Shop Details Section ── */}
      <SectionHeading title="Shop Details" subtitle="Basic info shown on receipts and invoices." />

      <View className="gap-4 mb-6">
        <Field label="Shop Name" value={shopName} onChange={setShopName} placeholder="Enter shop name" disabled={!isOnline} />
        <Field label="Business Email" value={email} onChange={setEmail} placeholder="sales@shop.com" keyboardType="email-address" disabled={!isOnline} error={!isEmailValid} />
        <Field label="Phone" value={phone} onChange={(t) => setPhone(t.replace(/\D/g, ""))} placeholder="712345678" keyboardType="phone-pad" disabled={!isOnline} error={!isPhoneValid} prefix="+254" />
      </View>

      {/* ── Location Section ── */}
      <SectionHeading title="Location" subtitle="Physical address of your shop." />

      <View className="gap-4 mb-6">
        <Field label="Street" value={street} onChange={setStreet} placeholder="Mombasa Rd" disabled={!isOnline} />
        <Field label="City" value={city} onChange={setCity} placeholder="Nairobi" disabled={!isOnline} />
        <Field label="County" value={county} onChange={setCounty} placeholder="Nairobi" disabled={!isOnline} />
      </View>

      {/* ── Tax & Currency Section ── */}
      <SectionHeading title="Tax & Currency" />

      <View className="gap-4 mb-6">
        <Field label="KRA Tax PIN" value={taxPin} onChange={setTaxPin} placeholder="A00XXXXXX" disabled={!isOnline} error={!isTaxPinValid} />
        <Field label="Currency" value="KES — Kenyan Shilling" onChange={() => {}} disabled />
      </View>

      {/* ── Save ── */}
      <Button onPress={handleSave} disabled={!canSave} className="h-11 rounded-xl mb-2">
        {saving
          ? <ActivityIndicator color={isDark ? "#000000" : "#ffffff"} size="small" />
          : <Text>Save Changes</Text>
        }
      </Button>

      {/* ── Divider ── */}
      <Separator className="my-8" />

      {/* ── Staff Onboarding ── */}
      <SectionHeading title="Staff Onboarding" subtitle="Generate a code for cashiers to join your shop." />

      <Button
        onPress={handleGenerateInvite}
        disabled={!isOnline}
        variant="outline"
        className="h-11 rounded-xl flex-row items-center gap-2 mb-5"
      >
        <RefreshCw size={15} color={isDark ? "#ffffff" : "#111827"} />
        <Text>Generate Invite Code</Text>
      </Button>

      {/* ── Invite Code Card ── */}
      {inviteCode && (
        <View
          style={{ backgroundColor: mutedBg, borderColor: cardBorder, borderWidth: 1 }}
          className="p-4 rounded-2xl mb-6"
        >
          <Text className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground mb-2">
            Active Invite Code
          </Text>

          <View className="flex-row items-end justify-between">
            <Text
              style={{ letterSpacing: 10, fontSize: 28, fontWeight: "800" }}
              className="text-foreground"
            >
              {inviteCode}
            </Text>
            <View className="items-end gap-1 pb-0.5">
              <Text className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">
                Expires
              </Text>
              <Text className="text-xs font-secondary text-muted-foreground">
                {inviteExpiry
                  ? new Date(inviteExpiry).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "24h"}
              </Text>
              <View className="mt-1">
                <Copy size={13} color={isDark ? "#a1a1aa" : "#6b7280"} />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── Staff List ── */}
      <SectionHeading title="Team Members" subtitle={`${staffList.length} operator${staffList.length !== 1 ? "s" : ""} on this terminal.`} />

      <View
        style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
        className="rounded-2xl overflow-hidden"
      >
        {staffList.map((member, idx) => {
          const isOwner = member.role_name.toUpperCase() === "OWNER";
          const isLast  = idx === staffList.length - 1;
          const hue     = nameHue(member.profile_full_name);

          return (
            <View
              key={member.profile_user_id}
              style={!isLast ? { borderBottomWidth: 1, borderBottomColor: cardBorder } : undefined}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              {/* Avatar + name */}
              <View className="flex-row items-center gap-3 flex-1 min-w-0">
                <Avatar alt={member.profile_full_name} style={{ width: 38, height: 38 }}>
                  <AvatarFallback style={{ backgroundColor: `hsl(${hue}, 40%, ${isDark ? "30%" : "78%"})` }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: `hsl(${hue}, 40%, ${isDark ? "80%" : "28%"})` }}>
                      {getInitials(member.profile_full_name)}
                    </Text>
                  </AvatarFallback>
                </Avatar>

                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-secondary text-foreground" numberOfLines={1}>
                    {member.profile_full_name}
                  </Text>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {member.profile_user_id}
                  </Text>
                </View>
              </View>

              {/* Badge + remove */}
              <View className="flex-row items-center gap-2.5 ml-2">
                <Badge variant="secondary" className="rounded-lg px-2.5 py-1">
                  <Text className="text-[11px] font-heading">{member.role_name}</Text>
                </Badge>

                {!isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={!isOnline} className="w-8 h-8 rounded-xl">
                        <Trash2 size={15} color={!isOnline ? (isDark ? "#52525b" : "#d1d5db") : "#ef4444"} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove staff member?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will immediately end access for {member.profile_full_name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          <Text>Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onPress={() => removeStaff(member.profile_user_id)}
                          className="bg-destructive"
                        >
                          <Text className="text-destructive-foreground">Remove</Text>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </View>
            </View>
          );
        })}
      </View>

    </ScrollView>
  );
}