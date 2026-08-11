import { JoinShopScreen } from "@/components/auth/join-shop-screen";

// TODO(ndege): route guard only allow reaching this screen if the user has created an account and is not an owner and no active shops under their account
export default function JoinShopRoute() {
  return <JoinShopScreen />;
}