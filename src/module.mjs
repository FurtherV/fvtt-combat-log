import "./less/furtherv-combat-log.less";
import { CombatLog } from "./scripts/applications/combat-log.mjs";
import { LANG_ID, TEMPLATES_FOLDER } from "./scripts/constants.mjs";

/* -------------------------------------------- */
/*            Module Initialization             */
/* -------------------------------------------- */

Hooks.once("init", onInit);
Hooks.once("renderPlayers", onRenderPlayers);
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

/**
 * Hook function for injecting an element on the hotbar.
 * @param {Players} players       The Players application.
 * @param {HTMLElement} element   The aside element.
 * @param {object} context        Rendering context.
 * @param {object} options        Rendering options.
 */
function onRenderPlayers(players, element, context, options) {
  const button = foundry.utils.parseHTML(`
  <button id="view-combat-log" class="faded-ui" type="button" data-action="viewCombatLog">
    <i class="fa-solid fa-sword"></i>
    ${game.i18n.localize(LANG_ID + ".viewCombatLog")}
  </button>`);
  button.addEventListener("click", () => ui.combatlog.render({ force: true }));
  element.insertAdjacentElement("beforebegin", button);
}
