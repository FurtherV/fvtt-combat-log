export const MODULE_ID = "%config.id%";

export const MODULE_ABBREVIATION = MODULE_ID.split("-").map((x) => x.substring(0, 1)).join("");

export const MODULE_TITLE = "%config.title%";

export const LANG_ID = MODULE_ID.toUpperCase();

export const TEMPLATES_FOLDER = `modules/${MODULE_ID}/templates`;

export const ICONS_FOLDER = `modules/${MODULE_ID}/static/icons`;
