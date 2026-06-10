/**
 * Accept Healing - A Foundry VTT Module
 * Allows healers to offer healing via interactive chat buttons.
 * System agnostic: works with any system that uses actor.system.attributes.hp
 * or the standard hp derivation path.
 *
 * Usage (from any macro):
 *   game.acceptHealing.offerHeal(healerActor, healAmount, label)
 *
 * Example macro:
 *   const healer = game.user.character;
 *   game.acceptHealing.offerHeal(healer, 15, "Cure Light Wounds");
 */

// ─── HP resolution ────────────────────────────────────────────────────────────
// Tries common HP paths used by popular systems. Falls back gracefully.
function getHP(actor) {
    const hp =
          actor.system?.attributes?.hp ??   // PF1, PF2, DnD5e, most systems
          actor.system?.hp ??                // Some simpler systems
          actor.system?.health;              // Alternative naming
  if (!hp) return null;
    return {
          value: hp.value ?? 0,
          max:   hp.max   ?? hp.value ?? 0,
          path:  actor.system?.attributes?.hp ? "system.attributes.hp.value"
                     : actor.system?.hp             ? "system.hp.value"
                     :                                "system.health.value"
    };
}

// ─── Post a healing offer to chat ─────────────────────────────────────────────
async function offerHeal(healerActor, healAmount, label = "Healing") {
    if (!healerActor) {
          ui.notifications.warn("Accept Healing: No healer actor provided.");
          return;
    }
    if (typeof healAmount !== "number" || healAmount <= 0) {
          ui.notifications.warn("Accept Healing: healAmount must be a positive number.");
          return;
    }

  const content = `
      <div class="accept-healing-card" style="text-align:center; padding:4px 0;">
            <h3 style="margin:0 0 4px 0;">${label}</h3>
                  <p style="margin:0 0 8px 0;">
                          <b>${healerActor.name}</b> offers <b>${healAmount}hp</b> of healing.
                                </p>
                                      <button
                                              class="accept-heal-btn"
                                                      data-heal="${healAmount}"
                                                              data-label="${label}"
                                                                      data-healer="${healerActor.name}"
                                                                              style="width:100%; margin-top:4px;">
                                                                                      <i class="fas fa-heart"></i> Accept Healing (${healAmount}hp)
                                                                                            </button>
                                                                                                </div>`;

  await ChatMessage.create({
        user:    game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: healerActor }),
        content: content,
        flavor:  `${label} — offering ${healAmount}hp`
  });
}

// ─── Persistent hook: wire up button for ALL clients on every render ──────────
Hooks.on("renderChatMessage", (message, html, data) => {
    html.find(".accept-heal-btn").on("click", async (ev) => {
          ev.preventDefault();

                                         const btn        = ev.currentTarget;
          const healAmount = parseInt(btn.dataset.heal, 10);
          const label      = btn.dataset.label   ?? "Healing";
          const healer     = btn.dataset.healer  ?? "Unknown";

                                         if (isNaN(healAmount) || healAmount <= 0) {
                                                 ui.notifications.warn("Accept Healing: Invalid heal amount on button.");
                                                 return;
                                         }

                                         // The clicking player must have a token selected
                                         const targets = canvas?.tokens?.controlled ?? [];
          if (targets.length === 0) {
                  ui.notifications.warn("Accept Healing: Select your token first.");
                  return;
          }

                                         for (const token of targets) {
                                                 const actor = token.actor;
                                                 if (!actor) continue;

            // Permission check: player must own this actor
            if (!actor.isOwner) {
                      ui.notifications.warn(`Accept Healing: You do not own ${actor.name}.`);
                      continue;
            }

            const hp = getHP(actor);
                                                 if (!hp) {
                                                           ui.notifications.warn(`Accept Healing: Could not find HP for ${actor.name}.`);
                                                           continue;
                                                 }

            const newHP = Math.min(hp.value + healAmount, hp.max);
                                                 await actor.update({ [hp.path]: newHP });

            // Confirm in chat
            ChatMessage.create({
                      user:    game.user.id,
                      speaker: ChatMessage.getSpeaker({ actor }),
                      content: `<p><b>${actor.name}</b> accepted <b>${healAmount}hp</b> of healing from <b>${healer}</b> (${label}). <em>[${hp.value} → ${newHP} / ${hp.max}]</em></p>`
            });
                                         }
    });
});

// ─── Expose public API ────────────────────────────────────────────────────────
Hooks.once("init", () => {
    game.acceptHealing = { offerHeal };
    console.log("Accept Healing | Module loaded.");
});
