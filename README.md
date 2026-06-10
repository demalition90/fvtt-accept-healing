# Accept Healing

A **Foundry VTT** module that lets any healer post an interactive chat card offering HP to nearby players. Recipients click a button to accept the healing — it applies automatically to their selected token.

**System agnostic** — works with any game system that uses a standard HP attribute path (PF1, PF2e, DnD5e, and most others).

---

## Features

- Any player can post a healing offer to chat via a simple macro call
- - An "Accept Healing" button appears in chat for all players
  - - The button works for **all connected clients** (not just the one who triggered it)
    - - Works even after browser refresh or reconnect
      - - Applies healing to the player's currently selected token
        - - Confirms healing in chat with a before/after HP readout
          - - Permission check — players can only heal tokens they own
            - - System agnostic HP detection with fallback paths
             
              - ---

              ## Installation

              ### Method 1 — Manifest URL (recommended)

              1. In Foundry VTT, go to **Add-on Modules → Install Module**
              2. 2. Paste the following manifest URL into the search box at the bottom:
                 3.    ```
                          https://raw.githubusercontent.com/demalition90/fvtt-accept-healing/main/module.json
                          ```
                       3. Click **Install**
                       4. 4. Enable the module in your world via **Game Settings → Manage Modules**
                         
                          5. ### Method 2 — Manual
                         
                          6. 1. Download the latest release zip from the [Releases page](https://github.com/demalition90/fvtt-accept-healing/releases)
                             2. 2. Extract the `fvtt-accept-healing` folder into your Foundry `Data/modules/` directory
                                3. 3. Enable the module in your world
                                  
                                   4. ---
                                  
                                   5. ## Usage
                                  
                                   6. ### From a Macro
                                  
                                   7. The module exposes a simple API once loaded:
                                  
                                   8. ```js
                                      game.acceptHealing.offerHeal(healerActor, healAmount, label)
                                      ```

                                      **Parameters:**
                                      - `healerActor` — the Actor object doing the healing (usually `game.user.character`)
                                      - - `healAmount` — a number (can be the result of a dice roll)
                                        - - `label` — a string label shown in the chat card (e.g. `"Cure Light Wounds"`)
                                         
                                          - ### Example Macros
                                         
                                          - **Simple fixed heal:**
                                          - ```js
                                            const healer = game.user.character;
                                            game.acceptHealing.offerHeal(healer, 10, "Lay on Hands");
                                            ```

                                            **With a dice roll:**
                                            ```js
                                            const healer = game.user.character;
                                            const roll = await new Roll("2d8 + 3").evaluate();
                                            game.acceptHealing.offerHeal(healer, roll.total, "Cure Moderate Wounds");
                                            ```

                                            **Accepting Healing (as a recipient):**
                                            1. Select your token on the canvas
                                            2. 2. Click the **Accept Healing** button in the chat card
                                               3. 3. Your HP updates automatically and a confirmation appears in chat
                                                 
                                                  4. ---
                                                 
                                                  5. ## Compatibility
                                                 
                                                  6. | Foundry Version | Status |
                                                  7. |---|---|
                                                  8. | v13 | ✅ Verified |
                                                  9. | v12 | ✅ Should work |
                                                  10. | v11 | ❓ Untested |
                                                 
                                                  11. Tested with **Pathfinder 1e (pf1 v11.11)**. Should work with DnD5e, PF2e, and most other systems.
                                                 
                                                  12. ---
                                                 
                                                  13. ## License
                                                 
                                                  14. MIT — see [LICENSE](LICENSE)
