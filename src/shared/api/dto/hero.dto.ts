export type HeroDto = Readonly<{
  id: string;
  created: string;
  lastModified: string;
  ownerId: string;
  ownerAddress: string;
  userUsingId: string;
  heroTypeId: number;
  heroInfo: Readonly<{
    name: string;
    rarity: number;
    role: number;
    dmg: number;
    hp: number;
    atkSpeed: number;
    speed: number;
    furyRequired: number;
  }>;
  skinId: number;
  skinInfo: Readonly<{
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
  rarity: number;
  status: number;
  skinRarity: number;
  season: number;
  level: number;
  trophy: number;
  source: number;
  refId: string;
  tokenId: string;
  nftId: string;
  sale: Readonly<{
    price: Readonly<{
      type: number;
      name: string;
      value: number;
      decimals: number;
    }>;
    paymentToken: Readonly<{
      id: string;
      created: string;
      lastModified: string;
      name: string;
      symbol: string;
      decimals: number;
      contractAddress: string;
      enabled: boolean;
    }>;
  }>;
  lastPrice: Readonly<{
    type: number;
    name: string;
    value: number;
    decimals: number;
  }>;
  heroRanking: Readonly<{
    lastBattleTimestamp: number;
    trophyInRank: number;
    trophyClass: number;
    trophyRequired: number;
    totalBattleCapTHC: number;
    totalBattleCapTHCLV1: number;
    battleCapTHC: number;
    dailyTHCBattleCap: number;
    dailyPPBattleCap: number;
  }>;
  thcBonus: number;
  dailyTHCBattleConfig: number;
}>;
