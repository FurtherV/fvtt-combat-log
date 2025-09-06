import "./less/furtherv-combat-log.less";
import { CombatLog } from "./scripts/applications/combat-log.mjs";
import { TEMPLATES_FOLDER } from "./scripts/constants.mjs";

/* -------------------------------------------- */
/*            Module Initialization             */
/* -------------------------------------------- */

Hooks.once("init", onInit);
Hooks.on("createChatMessage", onCreateChatMessage);
Hooks.on("updateChatMessage", onUpdateChatMessage);
Hooks.on("deleteChatMessage", onDeleteChatMessage);

function onInit() {
  CONFIG.ui.combatlog = CombatLog;
  foundry.applications.handlebars.loadTemplates(["combat-log.hbs", "combat-log-footer.hbs"].map((x) => `${TEMPLATES_FOLDER}/${x}`));
}
function onCreateChatMessage(message, options, userId) {
  /** @type {CombatLog} */
  const combatlog = ui.combatlog;
  combatlog._triggerAutoRefresh();
}

function onUpdateChatMessage() {
  /** @type {CombatLog} */
  const combatlog = ui.combatlog;
  combatlog._triggerAutoRefresh();
}

function onDeleteChatMessage() {
  /** @type {CombatLog} */
  const combatlog = ui.combatlog;
  combatlog._triggerAutoRefresh();
}
