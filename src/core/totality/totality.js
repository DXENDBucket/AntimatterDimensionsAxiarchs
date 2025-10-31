import { Currency } from "../currency";
import { GameStorage } from "../storage/storage";
import { GameUI } from "../ui";
import { NG } from "../new-game";

const TOTALITY_REQUIREMENT = Decimal.pow10(9e15);
let isProcessing = false;

export const Totality = {
  requirement: TOTALITY_REQUIREMENT,

  tryTrigger(bestAntimatter) {
    if (isProcessing) return false;
    if (!bestAntimatter || bestAntimatter.lt(this.requirement)) return false;
    this.performReset();
    return true;
  },

  performReset() {
    if (isProcessing) return;
    isProcessing = true;
    try {
      const machines = Currency.totalityMachines.value.plus(1);
      const totalities = (player.records.totalities ?? 0) + 1;

      NG.restartWithCarryover();

      Currency.totalityMachines.value = machines;
      player.totality.count = totalities;
      player.totality.unlocked = true;
      player.records.totalities = totalities;

      GameUI.notify.success("You have transcended into Totality and gained a Totality Machine!", 10000);
      GameStorage.save(true);
      GameUI.update();
    } finally {
      isProcessing = false;
    }
  }
};
