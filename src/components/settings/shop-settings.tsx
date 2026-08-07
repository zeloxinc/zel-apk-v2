import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { WifiOff, Store, Copy, RefreshCw, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { db } from "@/lib/sqlite/db";

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
import { supabase } from "@/lib/db/supabase";


interface Shop {
  shop_id: string;
  shop_name: string;
  shop_business_email: string | null;
  shop_phone_number: string | null;
  shop_location_street: string | null;
  shop_location_city: string | null;
  shop_location_county: string | null;
  shop_tax_pin: string | null;
}

interface StaffMember {
  profile_user_id: string;
  profile_full_name: string;
  role_name: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function nameHue(name: string) {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

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
  
  const inputTextColor   = isDark ? "#f9fafb" : "#111827";
  const placeholderColor = isDark ? "#6b7280" : "#9ca3af";
  const borderColor      = error
    ? "#ef4444"
    : isDark ? "#27272a" : "#e5e7eb";
  const bgColor          = isDark ? "#18181b" : "#ffffff";
  const prefixColor      = isDark ? "#a1a1aa" : "#6b7280";

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
            className="font-primary"
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

interface ShopSettingsProps {
  shopId?: string;
  isOnline?: boolean;
}

export function ShopSettings({ shopId, isOnline = true }: ShopSettingsProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const [shopName, setShopName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [street, setStreet]       = useState("");
  const [city, setCity]           = useState("");
  const [county, setCounty]       = useState("");
  const [taxPin, setTaxPin]       = useState("");

  const [inviteCode, setInviteCode]     = useState<string | null>(null);
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null);
  const [staffList, setStaffList]       = useState<StaffMember[]>([]);

  // 1. Fetch Shop & Staff Data from SQLite
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch target shop
        const shopQuery = shopId
          ? `SELECT * FROM shops WHERE shop_id = ? LIMIT 1`
          : `SELECT * FROM shops LIMIT 1`;
        const shopParams = shopId ? [shopId] : [];
        const shops = await db.selectAll<Shop>(shopQuery, shopParams);

        if (shops.length > 0) {
          const s = shops[0];
          if (!cancelled) {
            setActiveShopId(s.shop_id);
            setShopName(s.shop_name || "");
            setEmail(s.shop_business_email || "");
            setPhone((s.shop_phone_number || "").replace(/^\+254/, ""));
            setStreet(s.shop_location_street || "");
            setCity(s.shop_location_city || "");
            setCounty(s.shop_location_county || "");
            setTaxPin(s.shop_tax_pin || "");
          }

          // Fetch team members for this shop
          const staffQuery = `
            SELECT 
              sp.profile_user_id,
              sp.profile_full_name,
              sr.role_name
            FROM staff s
            JOIN staff_profiles sp ON s.staff_user_id = sp.profile_user_id
            JOIN staff_roles sr ON s.staff_role_id = sr.role_id
            WHERE s.staff_shop_id = ? AND (s.staff_is_active = 1 OR s.staff_is_active = TRUE)
          `;
          const staffRows = await db.selectAll<StaffMember>(staffQuery, [s.shop_id]);

          if (!cancelled) {
            setStaffList(staffRows);
          }
        }
      } catch (error) {
        console.error("Failed to load shop settings from SQLite:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const isPhoneValid  = !phone  || /^[17]\d{8}$/.test(phone.trim());
  const isEmailValid  = !email  || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isTaxPinValid = !taxPin || /^[AP]\d{9}[A-Z]$/i.test(taxPin.trim());
  const canSave       = isOnline && !saving && isPhoneValid && isEmailValid && isTaxPinValid && !!activeShopId;

  // 2. Persist Shop Settings to SQLite
  const handleSave = async () => {
    if (!canSave || !activeShopId) return;
    setSaving(true);
    try {
      const fullPhone = phone.trim() ? `+254${phone.trim()}` : null;
      await db.execute(
        `UPDATE shops 
         SET 
           shop_name = ?,
           shop_business_email = ?,
           shop_phone_number = ?,
           shop_location_street = ?,
           shop_location_city = ?,
           shop_location_county = ?,
           shop_tax_pin = ?
         WHERE shop_id = ?`,
        [
          shopName,
          email || null,
          fullPhone,
          street || null,
          city || null,
          county || null,
          taxPin || null,
          activeShopId,
        ]
      );
    } catch (error) {
      console.error("Failed to update shop details in SQLite:", error);
    } finally {
      setSaving(false);
    }
  };


  const handleGenerateInvite = async () => {
      if (!isOnline || !activeShopId) return;
      
      // Generate 6-digit numeric (or alphanumeric) code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
  
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Assuming you have a supabase client initialized in your app
        const { error } = await supabase.from("staff_invites").insert({
          invite_shop_id: activeShopId,
          invite_owner_id: user.id, // Grab from your auth session context
          invite_code: code,
          expires_at: expiry.toISOString(),
        });
  
        if (error) throw error;
  
        setInviteCode(code);
        setInviteExpiry(expiry.toISOString());
      } catch (err) {
        console.error("Failed to generate invite code:", err);
      }
    };
  
  // 3. Deactivate Staff Member in SQLite
  const removeStaff = async (userId: string) => {
    if (!activeShopId) return;
    try {
      await db.execute(
        `UPDATE staff SET staff_is_active = 0 WHERE staff_user_id = ? AND staff_shop_id = ?`,
        [userId, activeShopId]
      );
      setStaffList((prev) => prev.filter((s) => s.profile_user_id !== userId));
    } catch (error) {
      console.error("Failed to remove staff member:", error);
    }
  };

  const cardBg     = isDark ? "#18181b" : "#ffffff";
  const cardBorder = isDark ? "#27272a" : "#e5e7eb";
  const mutedBg    = isDark ? "#27272a" : "#f4f4f5";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#111827"} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {!isOnline && (
        <View className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mb-5">
          <WifiOff size={16} color="#92400e" />
          <Text className="text-xs font-secondary text-amber-900 dark:text-amber-200 flex-1">
            You're offline. Connect to update shop settings.
          </Text>
        </View>
      )}

      <View
        style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 }}
        className="flex-row items-center gap-3 p-4 rounded-2xl mb-6"
      >
        <View className="flex-1 min-w-0">
          <Text className="text-base font-heading text-foreground" numberOfLines={1}>
            {shopName || "Unnamed Shop"}
          </Text>
          <Text className="text-xs text-muted-foreground">{activeShopId}</Text>
        </View>
      </View>

      <SectionHeading title="Shop Details" subtitle="Basic info shown on receipts and invoices." />

      <View className="gap-4 mb-6">
        <Field label="Shop Name" value={shopName} onChange={setShopName} placeholder="Enter shop name" disabled={!isOnline} />
        <Field label="Business Email" value={email} onChange={setEmail} placeholder="sales@shop.com" keyboardType="email-address" disabled={!isOnline} error={!isEmailValid} />
        <Field label="Phone" value={phone} onChange={(t) => setPhone(t.replace(/\D/g, ""))} placeholder="712345678" keyboardType="phone-pad" disabled={!isOnline} error={!isPhoneValid} prefix="+254" />
      </View>

      <SectionHeading title="Location" subtitle="Physical address of your shop." />

      <View className="gap-4 mb-6">
        <Field label="Street" value={street} onChange={setStreet} placeholder="Mombasa Rd" disabled={!isOnline} />
        <Field label="City" value={city} onChange={setCity} placeholder="Nairobi" disabled={!isOnline} />
        <Field label="County" value={county} onChange={setCounty} placeholder="Nairobi" disabled={!isOnline} />
      </View>

      <SectionHeading title="Tax & Currency" />

      <View className="gap-4 mb-6">
        <Field label="KRA Tax PIN" value={taxPin} onChange={setTaxPin} placeholder="A00XXXXXX" disabled={!isOnline} error={!isTaxPinValid} />
        <Field label="Currency" value="KES — Kenyan Shilling" onChange={() => {}} disabled />
      </View>

      <Button onPress={handleSave} disabled={!canSave} className="h-11 rounded-xl mb-2">
        {saving
          ? <ActivityIndicator color={isDark ? "#000000" : "#ffffff"} size="small" />
          : <Text>Save Changes</Text>
        }
      </Button>

      <Separator className="my-8" />

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

      {inviteCode && (
        <View
          style={{ backgroundColor: mutedBg, borderColor: cardBorder, borderWidth: 1 }}
          className="p-4 rounded-2xl mb-6"
        >
          <Text className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground mb-2">
            Active Invite Code
          </Text>

          <View className="flex-row items-end justify-between">
            <View className="flex-row gap-2 items-end">
              <Text className="text-foreground font-secondary text-3xl tracking-[5px]">
                {inviteCode}
              </Text>
              <Copy size={13} color={isDark ? "#a1a1aa" : "#6b7280"} />
            </View>
            <View className="items-end gap-1 bg-red-300 p-2 rounded">
              <Text className="text-[10px] font-heading uppercase tracking-widest text-red-600">
                Expires
              </Text>
              <Text className="text-xs font-secondary text-red-600">
                {inviteExpiry
                  ? new Date(inviteExpiry).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "24h"}
              </Text>
            </View>
          </View>
        </View>
      )}

      <SectionHeading
        title="Team Members"
        subtitle={`${staffList.length} operator${staffList.length !== 1 ? "s" : ""} on this terminal.`}
      />

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
                          This will immediately end access for{" "}
                          <Text className="font-secondary underline">
                            {member.profile_full_name}
                          </Text>
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