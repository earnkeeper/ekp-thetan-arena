export type SkinConfigDto = Readonly<{
  id: number;
  heroTypeId: number;
  heroRarity: number;
  skinRarity: number;
  imageAvatar: string;
  imageSmallAvatar: string;
  imageFull: string;
  cost: number;
  name: string;
  isListMarket: boolean;
  isSellNonNFTShop: boolean;
}>;
