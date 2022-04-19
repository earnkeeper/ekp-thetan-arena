export function calculateRevenue(
  rarity: number,
  level: number,
  battles: number,
  winRate: number,
): number {
  const winReward = 6;

  const lossReward = 1;

  let winBonus = 0;

  switch (rarity) {
    case 0:
      switch (level) {
        case 11:
        case 10:
        case 9:
          winBonus = 4.032;
          break;
        case 8:
        case 7:
          winBonus = 3.739;
          break;
        case 6:
        case 5:
          winBonus = 3.511;
          break;
        case 4:
        case 3:
          winBonus = 3.348;
          break;
        default:
          winBonus = 3.25;
          break;
      }
      break;
    case 1:
      switch (level) {
        case 11:
        case 10:
        case 9:
          winBonus = 8.06;
          break;
        case 8:
        case 7:
          winBonus = 7.475;
          break;
        case 6:
        case 5:
          winBonus = 7.02;
          break;
        case 4:
        case 3:
          winBonus = 6.695;
          break;
        default:
          winBonus = 6.5;
          break;
      }
      break;
    case 2:
      switch (level) {
        case 11:
          winBonus = 31.795;
          break;
        case 10:
        case 9:
          winBonus = 29.204;
          break;
        case 8:
        case 7:
          winBonus = 27.084;
          break;
        case 6:
        case 5:
          winBonus = 25.435;
          break;
        case 4:
        case 3:
          winBonus = 24.257;
          break;
        default:
          winBonus = 23.55;
          break;
      }
      break;
  }

  // Use shorter non standard variables here to make the maths easier to read
  const w_pc = winRate / 100; // percent of matches won
  const w_thc = winReward + winBonus; // thc earned for a win
  const l_thc = lossReward; // thc earned for a loss
  const b = battles; // battles available

  // Revenue at the user entered win rate
  return (w_pc * w_thc + (1 - w_pc) * l_thc) * b;
}

function forLater(
  rarity: number,
  battles: number,
  winRate: number,
  winReward: number,
  lossReward: number,
  winBonus: number,
  cost: number,
) {
  // Use shorter non standard variables here to make the maths easier to read
  const w_pc = winRate / 100; // percent of matches won
  const w_thc = winReward + winBonus; // thc earned for a win
  const l_thc = lossReward; // thc earned for a loss
  const b = battles; // battles available

  let battlesPerDay = 0;

  switch (rarity) {
    case 0:
      battlesPerDay = 8;
      break;
    case 1:
      battlesPerDay = 10;
      break;
    case 2:
      battlesPerDay = 12;
      break;
  }
  // Battles needed to pay back the nft (might be more than available battles)
  const battlesToRoi = cost / (w_pc * w_thc + (1 - w_pc) * l_thc);

  // Days of play to pay back the nft (set this to undefined if the nft does not have enough battles)
  let breakEvenDays = undefined;
  if (battles >= battlesToRoi) {
    breakEvenDays = battlesToRoi / battlesPerDay;
  }

  // Ignoring user entered win rate, which win rate would pay back the nft (could be more than 100% if the nft is not profitable)
  // Needed to do some arithmatic to get this formula, can discuss in discord if interested
  const breakEvenWinRate = (cost / b - l_thc) / (w_thc - l_thc);
}
