import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WifiOff, Store, Copy, RefreshCw, Trash2, UserCheck } from "lucide-react-native";

// ── Mock data (swap with Dexie/Supabase later) ──────────────────────────────
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
  { profile_user_id: "usr_001", profile_full_name: "Lyda Conley", role_name: "OWNER" },
  { profile_user_id: "usr_002", profile_full_name: "Brian Mwangi", role_name: "CASHIER" },
  { profile_user_id: "usr_003", profile_full_name: "Amara Osei", role_name: "CASHIER" },
];

const MOCK_IS_ONLINE = true;

// ── Sub-components ────────────────────────────────────────────────────────────

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

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  keyboardType = "default",
  prefix,
}: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-secondary">
        {label}
      </Text>
      <View
        className={`flex-row items-center h-11 rounded-xl border bg-card px-3.5 ${
          error ? "border-destructive" : "border-border"
        } ${disabled ? "bg-muted opacity-60" : ""}`}
      >
        {prefix && (
          <Text className="text-sm font-semibold text-muted-foreground mr-1.5 font-secondary">
            {prefix}
          </Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          className="flex-1 text-sm text-foreground font-primary"
          style={{ paddingVertical: 0 }}
        />
      </View>
    </View>
  );
}

function AvatarCircle({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  // Derive a stable hue from the name
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue}, 45%, 78%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.35,
          fontWeight: "700",
          color: `hsl(${hue}, 45%, 28%)`,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ShopSettings() {
  const isOnline = MOCK_IS_ONLINE;

  const [shopName, setShopName] = useState(MOCK_SHOP.shop_name);
  const [phone, setPhone] = useState(
    MOCK_SHOP.shop_phone_number.replace("+254", "")
  );
  const [email, setEmail] = useState(MOCK_SHOP.shop_business_email);
  const [street, setStreet] = useState(MOCK_SHOP.shop_location_street);
  const [city, setCity] = useState(MOCK_SHOP.shop_location_city);
  const [county, setCounty] = useState(MOCK_SHOP.shop_location_county);
  const [taxPin, setTaxPin] = useState(MOCK_SHOP.shop_tax_pin);
  const [saving, setSaving] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null);
  const [staffList, setStaffList] = useState(MOCK_STAFF);

  const isPhoneValid = !phone || /^[17]\d{8}$/.test(phone.trim());
  const isEmailValid =
    !email || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isTaxPinValid = !taxPin || /^[AP]\d{9}[A-Z]$/i.test(taxPin.trim());

  const handleSave = async () => {
    if (!isPhoneValid || !isEmailValid || !isTaxPinValid) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    Alert.alert("Saved", "Shop settings updated successfully.");
  };

  const handleGenerateInvite = () => {
    if (!isOnline) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    setInviteCode(code);
    setInviteExpiry(expiry.toISOString());
    Alert.alert("Code Generated", `Invite code: ${code}\nValid for 24 hours.`);
  };

  const handleRemoveStaff = (id: string, role: string) => {
    if (role.toUpperCase() === "OWNER") {
      Alert.alert("Not Allowed", "The owner account cannot be removed.");
      return;
    }
    Alert.alert("Remove Staff?", "This will end their access immediately.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setStaffList((prev) => prev.filter((s) => s.profile_user_id !== id)),
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <View className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 mb-5">
          <WifiOff size={16} color="#92400e" />
          <Text className="text-xs font-semibold text-amber-900 font-secondary flex-1">
            You're offline. Connect to update shop settings.
          </Text>
        </View>
      )}

      {/* ── Shop Header ── */}
      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-11 h-11 rounded-2xl bg-muted border border-border items-center justify-center">
          <Store size={20} color="#374151" strokeWidth={1.8} />
        </View>
        <View>
          <Text className="text-base font-bold text-foreground font-heading">{shopName}</Text>
          <Text className="text-xs text-muted-foreground font-primary">
            Shop · {MOCK_SHOP.shop_id}
          </Text>
        </View>
      </View>

      {/* ── Form Fields ── */}
      <View className="gap-4">
        <Field
          label="Shop Name"
          value={shopName}
          onChange={setShopName}
          placeholder="Enter shop name"
          disabled={!isOnline}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              label="Business Email"
              value={email}
              onChange={setEmail}
              placeholder="sales@shop.com"
              keyboardType="email-address"
              disabled={!isOnline}
              error={!isEmailValid}
            />
          </View>
          <View className="flex-1">
            <Field
              label="Phone"
              value={phone}
              onChange={(t) => setPhone(t.replace(/\D/g, ""))}
              placeholder="712345678"
              keyboardType="phone-pad"
              disabled={!isOnline}
              error={!isPhoneValid}
              prefix="+254"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="Street" value={street} onChange={setStreet} placeholder="Mombasa Rd" disabled={!isOnline} />
          </View>
          <View className="flex-1">
            <Field label="City" value={city} onChange={setCity} placeholder="Nairobi" disabled={!isOnline} />
          </View>
          <View className="flex-1">
            <Field label="County" value={county} onChange={setCounty} placeholder="Nairobi" disabled={!isOnline} />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              label="KRA Tax PIN"
              value={taxPin}
              onChange={setTaxPin}
              placeholder="A00XXXXXX"
              disabled={!isOnline}
              error={!isTaxPinValid}
            />
          </View>
          <View className="flex-1">
            <Field label="Currency" value="KES (Shilling)" onChange={() => {}} disabled />
          </View>
        </View>
      </View>

      {/* ── Save Button ── */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={!isOnline || saving || !isPhoneValid || !isEmailValid || !isTaxPinValid}
        activeOpacity={0.8}
        className={`h-11 rounded-xl items-center justify-center mt-5 ${
          !isOnline || saving ? "bg-muted" : "bg-primary"
        }`}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text
            className={`text-sm font-semibold font-secondary ${
              !isOnline ? "text-muted-foreground" : "text-primary-foreground"
            }`}
          >
            Save Changes
          </Text>
        )}
      </TouchableOpacity>

      {/* ── Divider ── */}
      <View className="border-t border-border my-7" />

      {/* ── Staff Onboarding ── */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-base font-bold text-foreground font-heading">
            Staff Onboarding
          </Text>
          <Text className="text-xs text-muted-foreground font-primary mt-0.5">
            Share an invite code to connect cashiers.
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleGenerateInvite}
          disabled={!isOnline}
          activeOpacity={0.8}
          className={`flex-row items-center gap-2 px-4 h-9 rounded-xl ${
            !isOnline ? "bg-muted" : "bg-primary"
          }`}
        >
          <RefreshCw size={14} color={!isOnline ? "#9ca3af" : "#ffffff"} />
          <Text
            className={`text-xs font-semibold font-secondary ${
              !isOnline ? "text-muted-foreground" : "text-primary-foreground"
            }`}
          >
            Add Operator
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invite Code Card */}
      {inviteCode && (
        <View className="p-4 bg-muted border border-border rounded-2xl flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-secondary mb-1">
              Invite Code
            </Text>
            <Text className="text-2xl tracking-[0.3em] font-bold text-foreground font-heading">
              {inviteCode}
            </Text>
          </View>
          <View className="items-end gap-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-secondary">
              Expires
            </Text>
            <Text className="text-xs font-semibold text-muted-foreground font-primary">
              {inviteExpiry
                ? new Date(inviteExpiry).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "24h"}
            </Text>
            <TouchableOpacity className="mt-1">
              <Copy size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Staff List */}
      <View className="gap-1">
        {staffList.map((member, idx) => {
          const isOwner = member.role_name.toUpperCase() === "OWNER";
          const isLast = idx === staffList.length - 1;

          return (
            <View
              key={member.profile_user_id}
              className={`flex-row items-center justify-between py-3.5 ${
                !isLast ? "border-b border-border" : ""
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1 min-w-0">
                <AvatarCircle name={member.profile_full_name} size={40} />
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-sm font-semibold text-foreground font-secondary truncate"
                    numberOfLines={1}
                  >
                    {member.profile_full_name}
                  </Text>
                  <Text className="text-xs text-muted-foreground font-primary" numberOfLines={1}>
                    {member.profile_user_id}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="bg-secondary border border-border rounded-lg px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-secondary-foreground font-secondary">
                    {member.role_name}
                  </Text>
                </View>

                {!isOwner && (
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveStaff(member.profile_user_id, member.role_name)
                    }
                    disabled={!isOnline}
                    className="w-8 h-8 items-center justify-center rounded-xl"
                    activeOpacity={0.7}
                  >
                    <Trash2 size={15} color={!isOnline ? "#d1d5db" : "#ef4444"} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}