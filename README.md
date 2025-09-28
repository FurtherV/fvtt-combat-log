# FurtherV's Combat Log

## Description

This module provides with nicely styled and easily readable combat log, giving you direct knowledge of WHO rolled WHAT against WHO with WHAT.
It shows attack rolls, damage rolls, saving throws and manual rolls, including targets and AC / DC where possible.

**Do note that the combat log is currently quite wide, at least 900px. A future version will include a variant that can be less wide.**

![Preview](./.github/images/Preview-1.png)

## How To Use

The combat log can be opened from the button in the left sidebar. You can also open it through scripts, such as macros, using `ui.combatlog.render({ force: true })`.

## Roadmap

- Allow target selection and damage application from Combat Log
- Allow font size adjustments of the Combat Log
- Allow user CSS overwrite
- Use i18n instead of hard coded strings
- Handle ability and skill checks
- On damage rolls with available targets, show reduced damage as well
- Add button to scroll to chat message
  - Might be difficult because we would have to load a lot of history