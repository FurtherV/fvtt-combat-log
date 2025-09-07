import { MODULE_ID, TEMPLATES_FOLDER } from "../constants.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CombatLog extends HandlebarsApplicationMixin(ApplicationV2) {
  /* ===== STATICS ===== */

  static DEFAULT_OPTIONS = {
    tag: "form",
    id: MODULE_ID,
    classes: [MODULE_ID],
    window: {
      title: "Combat Log",
    },
    actions: {
      refresh: CombatLog.refreshAction,
    },
  };
  static PARTS = {
    log: {
      template: `${TEMPLATES_FOLDER}/combat-log.hbs`,
    },
    footer: {
      template: `${TEMPLATES_FOLDER}/combat-log-footer.hbs`,
    },
  };

  static MAX_MESSAGE_HISTORY = 100;

  static refreshAction(event, target) {
    this.render({ force: false });
  }

  /** ===== PROPERTIES ===== */
  autoRefresh = true;

  /** ===== METHODS ===== */
  _triggerAutoRefresh = foundry.utils.debounce(() => {
    if (!this.autoRefresh) return;
    this.render({ force: false });
  });

  _getVerbFromRollInfo(rollType, damageTypes, hasTarget) {
    if (rollType === "attack") return "attacks";
    if (rollType === "damage") {
      if (!damageTypes.includes("healing"))
        return hasTarget ? "damages" : "deals damage";

      return "heals";
    }
    if (rollType === "save") return "saves";

    return "rolls";
  }

  _getDifficultyClassFromMessage(message, rollType) {
    if (message.rolls[0]?.options?.target == null) return undefined;

    let prefix = "";

    if (rollType === "attack") {
      prefix = "AC";
    }

    if (rollType === "save") {
      prefix = "DC";
    }

    if (prefix !== "") {
      const value = message.rolls[0].options.target;
      return `${prefix} ${value}`;
    }

    return undefined;
  }

  _getStatusFromMessage(message) {
    const rollType = message.getFlag("dnd5e", "roll.type");
    if (!rollType) return undefined;
    const primaryRoll = message.rolls[0];
    if ((!primaryRoll.options.target) && (rollType !== "damage")) return undefined;

    if (rollType === "save") {
      return primaryRoll.isSuccess ? { cssClass: "good", text: "SUCC" } : { cssClass: "bad", text: "FAIL" };
    }

    if (rollType === "attack") {
      if (primaryRoll.isCritical) return { cssClass: "good", text: "C.HIT" };
      if (primaryRoll.isFumble) return { cssClass: "bad", text: "C.MISS" };
      return primaryRoll.isSuccess ? { cssClass: "good", text: "HIT" } : { cssClass: "bad", text: "MISS" };
    }

    if (rollType === "damage") {
      return primaryRoll.isCritical ? { cssClass: "good", text: "CRIT" } : { text: "NORMAL" };
    }

    return undefined;
  }

  _preprocessRolls(rolls) {
    return rolls.flatMap((roll) => {
      const total = roll.total;
      const d20 = roll.d20;
      if (d20 != null) {
        if (d20 != null) {
          const results = d20.results;
          const activeResult = results.find((x) => x.active);
          const bonus = total - activeResult.result;
          return results.map((x) => ({ total: x.result + bonus, formula: `${x.result} + ${bonus}`, cssClass: x.discarded ? "discarded" : undefined }));
        }
      }
      if (roll.options?.type) {
        return ({ total: total, formula: roll.result, type: { icon: `systems/dnd5e/icons/svg/damage/${roll.options.type}.svg`, label: CONFIG.DND5E.damageTypes[roll.options.type]?.label } });
      }
      return ({ total: total });
    });
  }

  /**
   * @inheritdoc
   */
  async _prepareContext(options) {
    const messages = game.messages.contents.slice(-CombatLog.MAX_MESSAGE_HISTORY).filter((x) => x.isRoll && x.visible);
    messages.reverse();

    const entries = [];
    for (const message of messages) {
      const targets = [...(message.getFlag("dnd5e", "targets") ?? [])];
      const rollType = message.getFlag("dnd5e", "roll.type");
      if (!targets.length) {
        targets.push(null);
      }
      for (const target of targets) {
        const targetActor = target ? fromUuidSync(target.uuid) : undefined;
        const entry = {};
        entry.primaryActor = message.getAssociatedActor();
        if (entry.primaryActor == null) continue; // skip messages where the speaker has no actor

        entry.verb = this._getVerbFromRollInfo(rollType, message.rolls.flatMap((x) => x.options.types), target != null);
        if (rollType === "save") {
          entry.saveType = message.getFlag("dnd5e", "roll.ability");
        }
        entry.secondaryActor = targetActor;
        entry.item = message.getAssociatedItem() || null;
        if (entry.item != null) {
          entry.prepositional = "using";
        }
        entry.versus = "VS";
        entry.dc = this._getDifficultyClassFromMessage(message, rollType);
        entry.rolls = this._preprocessRolls(message.rolls);
        entry.status = this._getStatusFromMessage(message);
        entries.push(entry);
      }
    }

    const context = { entries, autoRefresh: this.autoRefresh };
    return context;
  }
  /**
   * Brainstorm
   * ATTACKER_NAME attacks TARGET_NAME using ITEM_NAME: ROLLS vs AC: C.HIT / HIT / MISS / C.MISS
   * ATTACKER_NAME attacks using ITEM_NAME: ROLLS
   *
   * ATTACKER_NAME damages TARGET_NAME using ITEM_NAME: ROLLS: C.HIT / NORMAL
   * ATTACKER_NAME deals damage using ITEM_NAME: ROLLS: C.HIT / NORMAL
   *
   * TARGET_NAME saves (SAVE_NAME) against ITEM_NAME: ROLLS: SUCCESS / FAILURE
   * TARGET_NAME saves (SAVE_NAME): ROLLS
   *
   * ATTACKER_NAME uses ITEM_NAME: ROLLS
   *
   * ATTACKER_NAME rolls: ROLLS
   */

  /**
   * @inheritdoc
   */
  _onRender(context, options) {
    const autoRefreshInput = this.element.querySelector(`input[name="autoRefresh"]`);
    autoRefreshInput.addEventListener("change", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.autoRefresh = e.currentTarget.checked;
    });
  }
}
