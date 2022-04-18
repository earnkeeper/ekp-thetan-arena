import { MarketBuyDto } from './market-buy.dto';

export type MarketRentDto = Readonly<{
  rentOutInfo: RentOutInfoDto;
}> &
  MarketBuyDto;

export type RentOutInfoDto = Readonly<{
  rentBattles: number;
  thcBonus: number;
  winRateTHC: Record<string, number>;
  periodHours: number;
  price: {
    type: number;
    name: string;
    value: number;
    decimals: number;
  };
}>;
