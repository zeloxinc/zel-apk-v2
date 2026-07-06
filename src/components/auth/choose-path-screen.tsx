import { View, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Store, Users } from "lucide-react-native";
import { Images } from "@/assets";

interface PathOption {
  Icon: typeof Store;
  title: string;
  desc: string;
  image: any;
  href: string;
}

const paths: PathOption[] = [
  {
    Icon: Store,
    title: "Create a Shop",
    desc: "Set up a new shop and become the owner",
    image: Images.createShop,
    href: "/create-shop",
  },
  {
    Icon: Users,
    title: "Join a Shop",
    desc: "You have an invite code from your manager or shop owner",
    image: Images.joinShop,
    href: "/join-shop",
  },
];

export function ChoosePathScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 pt-16 pb-12 gap-6">
      <View className="gap-1">
        <Image
          source={Images.zelWordBlack}
          contentFit="contain"
          style={{ width: 120, height: 40 }}
        />
      </View>

      <View className="gap-1">
        <Text className="font-heading text-[26px] leading-tight text-neutral-900">
          How would you like to get started?
        </Text>
        <Text className="text-sm font-primary text-neutral-500 mt-1">
          Create a new shop and start managing sales, stock, and staff, or join an
          existing shop using an invite code
        </Text>
      </View>

      <View className="gap-4">
        {paths.map(({ Icon, title, desc, image, href }) => (
          <View
            key={title}
            className="rounded-2xl border border-neutral-200 bg-white overflow-hidden"
          >
            <View className="relative">
              <Image
                source={image}
                contentFit="cover"
                style={{ width: "100%", aspectRatio: 16 / 9 }}
              />
              <View className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/10 to-transparent" />
            </View>

            <View className="p-4 gap-1">
              <View className="flex-row items-center gap-2">
                <Icon size={16} color="#171717" />
                <Text className="font-heading text-base text-neutral-900">{title}</Text>
              </View>
              <Text className="text-[13px] text-neutral-500 font-primary" numberOfLines={2}>
                {desc}
              </Text>
            </View>

            <View className="px-4 pb-4">
              <Button onPress={() => router.push(href as any)} className="h-11 rounded-xl bg-neutral-900">
                <Text className="text-white font-heading text-sm">{title}</Text>
              </Button>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}