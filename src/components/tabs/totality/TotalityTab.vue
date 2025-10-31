<script>
import { Totality } from "@/core/totality/totality";

export default {
  name: "TotalityTab",
  data() {
    return {
      requirement: Totality.requirement,
      totalityCount: 0,
      totalityMachines: new Decimal(0),
      totalitiesRecorded: 0,
      hasUnlockedTotality: false,
    };
  },
  computed: {
    requirementText() {
      return formatPostBreak(this.requirement, 2, 0);
    },
    machinesString() {
      const machines = this.totalityMachines;
      return `${format(machines, 2, 0)} ${pluralize("Totality Machine", machines.floor())}`;
    },
  },
  methods: {
    update() {
      this.totalityCount = player.totality.count;
      this.totalityMachines.copyFrom(Currency.totalityMachines.value);
      this.totalitiesRecorded = player.records.totalities ?? 0;
      this.hasUnlockedTotality = player.totality.unlocked;
    }
  }
};
</script>

<template>
  <div class="l-totality-tab">
    <div class="c-totality-tab__header">
      <div class="c-totality-tab__title">
        Totality
      </div>
      <div class="c-totality-tab__subtitle">
        Transcend the Celestials by mastering the Doomed Reality and embracing absolute collapse.
      </div>
    </div>
    <div class="c-totality-tab__body">
      <div class="c-totality-tab__requirement">
        Reach {{ requirementText }} antimatter in a Doomed Reality to trigger Totality and reset your entire progress.
      </div>
      <div class="c-totality-tab__stats">
        <div>You have completed {{ quantifyInt("Totality", totalityCount) }}.</div>
        <div>{{ machinesString }} are stored outside of your realities.</div>
        <div>
          Your save file has recorded {{ quantifyInt("Totality", totalitiesRecorded) }} overall.
        </div>
      </div>
      <div
        v-if="!hasUnlockedTotality"
        class="c-totality-tab__hint"
      >
        Survive Pelle's final challenge and surpass the antimatter limit to discover this new layer.
      </div>
      <div
        v-else
        class="c-totality-tab__hint"
      >
        Every Totality restart awards another machine.<br>
        It returns you to the very beginning with the Totality layer preserved.
      </div>
    </div>
  </div>
</template>

<style scoped>
.l-totality-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.c-totality-tab__header {
  text-align: center;
  margin-bottom: 2rem;
}

.c-totality-tab__title {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-totality);
}

.c-totality-tab__subtitle {
  font-size: 1.6rem;
  color: var(--color-text);
}

.c-totality-tab__body {
  max-width: 60rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  font-size: 1.5rem;
}

.c-totality-tab__requirement {
  padding: 1.5rem;
  border: 0.2rem solid var(--color-totality);
  border-radius: var(--var-border-radius, 0.5rem);
  background-color: var(--color-totality-light);
  color: var(--color-totality-dark);
}

.c-totality-tab__stats {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.c-totality-tab__hint {
  font-style: italic;
  color: var(--color-totality-dark);
}
</style>
