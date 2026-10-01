import { ZombieEntity } from '../types';

export interface ZombieRenderOptions {
  now: number;
}

/**
 * High-definition 2D top-down renderer for all infected zombie archetypes.
 * Completely replaces simple circles with rich anatomical sprites:
 * Body, head, glowing eyes, decaying clothing, legs with animated walking strides,
 * outstretched arms, attack lunges, damage flinches, and death collapses.
 */
export function renderZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, opts: ZombieRenderOptions) {
  ctx.save();
  ctx.translate(z.x, z.y);

  // If dying or dead, render death collapse animation
  if (z.isDead || z.isDying) {
    renderZombieDeath(ctx, z);
    ctx.restore();
    return;
  }

  // Cloaking transparency for Shadow Zombie
  if (z.type === 'shadow') {
    const cloakAlpha = z.cloakedAlpha !== undefined ? z.cloakedAlpha : 0.35;
    ctx.globalAlpha = cloakAlpha;
  }

  // Shadow under zombie
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  const shadowRadius = z.radius * 0.9;
  ctx.beginPath();
  ctx.ellipse(0, 3, shadowRadius, shadowRadius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Face movement/chase angle
  ctx.rotate(z.angle);

  // Damage flinch effect: slight displacement and color tint
  const isHurt = (z.damageAnimTimer || 0) > 0;
  if (isHurt) {
    ctx.translate(-3, 0);
  }

  // Render specific archetype
  switch (z.type) {
    case 'walker':
      renderWalkerZombie(ctx, z, isHurt);
      break;
    case 'runner':
      renderRunnerZombie(ctx, z, isHurt);
      break;
    case 'brute':
      renderBruteZombie(ctx, z, isHurt);
      break;
    case 'toxic':
      renderToxicZombie(ctx, z, isHurt);
      break;
    case 'shadow':
      renderShadowZombie(ctx, z, isHurt);
      break;
    case 'soldier':
      renderSoldierZombie(ctx, z, isHurt);
      break;
    default:
      if (z.isBoss) {
        renderHulkTitanBoss(ctx, z, isHurt);
      } else {
        renderWalkerZombie(ctx, z, isHurt);
      }
      break;
  }

  // Render health bar if damaged and not at full health
  if (z.health < z.maxHealth && !z.isBoss) {
    renderZombieHealthBar(ctx, z);
  }

  ctx.restore();
}

/**
 * 1. WALKER: Shambling decayed civilian, torn clothes, limping stride, gouged teeth.
 */
function renderWalkerZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, isHurt: boolean) {
  const t = z.walkAnimTimer || 0;
  const attack = z.attackAnimTimer || 0;

  // Asymmetrical limping stride
  const strideLeft = Math.sin(t * 8) * 8;
  const strideRight = Math.sin(t * 8 + 0.4) * 5; // Limping right leg

  const skinColor = isHurt ? '#ef4444' : '#5b7065'; // Rotting grey-green
  const shirtColor = isHurt ? '#f87171' : '#334155'; // Torn civilian shirt
  const pantsColor = isHurt ? '#dc2626' : '#1e293b'; // Tattered dark pants

  // --- LEGS & SHOES ---
  // Left Leg
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(-8 + strideLeft, -9, 8, 5, 2);
  ctx.fill();
  // Left Shoe
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-10 + strideLeft, -9, 3, 5);

  // Right Leg (dragging foot)
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(-8 + strideRight, 4, 8, 5, 2);
  ctx.fill();
  // Right Bare/torn foot
  ctx.fillStyle = skinColor;
  ctx.fillRect(-10 + strideRight, 4, 3, 4);

  // --- TORSO ---
  // Slumped decaying torso
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 9, 11, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Torn clothes showing rotting ribs
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(-3, -3, 4, 6);
  ctx.fillStyle = '#e2e8f0'; // Exposed rib bones
  ctx.fillRect(-2, -2, 2, 1);
  ctx.fillRect(-2, 0, 2, 1);
  ctx.fillRect(-2, 2, 2, 1);

  // Blood stain on torso
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(0, 3, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // --- HEAD ---
  // Rotting skull
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(3, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Missing scalp / exposed bone
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(2, -2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Ripped Jaw & gouged mouth
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(7, -2, 3, 4);
  // Jagged teeth
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(8, -1.5, 1, 1);
  ctx.fillRect(8, 0.5, 1, 1);

  // Glowing pale yellow undead eyes
  ctx.fillStyle = isHurt ? '#ffffff' : '#fef08a';
  ctx.beginPath();
  ctx.arc(6, -3, 1.8, 0, Math.PI * 2);
  ctx.arc(6, 3, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // --- ARMS & CLAWING HANDS ---
  // Lunge forward during attack
  const lunge = attack > 0 ? Math.sin(attack * Math.PI) * 8 : 0;
  const armSway = Math.sin(t * 7) * 3;

  ctx.strokeStyle = skinColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Left Arm reaching forward
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(12 + lunge, -6 + armSway);
  ctx.stroke();

  // Left bloody clawed hand
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(13 + lunge, -6 + armSway, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Right Arm reaching forward
  ctx.beginPath();
  ctx.moveTo(-1, 8);
  ctx.lineTo(11 + lunge, 7 - armSway);
  ctx.stroke();

  // Right bloody clawed hand
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(12 + lunge, 7 - armSway, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 2. RUNNER: Low-hunched ferocious sprinter, crimson flesh, frenzy claw swipes, red rabid eyes.
 */
function renderRunnerZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, isHurt: boolean) {
  const t = z.walkAnimTimer || 0;
  const attack = z.attackAnimTimer || 0;

  // Frantic fast pumping sprint strides
  const strideLeft = Math.sin(t * 18) * 12;
  const strideRight = Math.sin(t * 18 + Math.PI) * 12;

  const skinColor = isHurt ? '#ef4444' : '#831843'; // Bloody crimson/maroon infected flesh
  const clothColor = isHurt ? '#fca5a5' : '#18181b'; // Shredded black athletic wear

  // --- LEGS ---
  ctx.fillStyle = clothColor;
  ctx.beginPath();
  ctx.roundRect(-10 + strideLeft, -8, 10, 4.5, 2);
  ctx.roundRect(-10 + strideRight, 3.5, 10, 4.5, 2);
  ctx.fill();

  // Bare bloody runner feet
  ctx.fillStyle = skinColor;
  ctx.fillRect(-12 + strideLeft, -8, 3, 4.5);
  ctx.fillRect(-12 + strideRight, 3.5, 3, 4.5);

  // --- TORSO (Low hunched forward posture) ---
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(-1, 0, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shreds of athletic top
  ctx.fillStyle = clothColor;
  ctx.fillRect(-4, -6, 6, 12);

  // Exposed spinal cord/sinew
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(2, 0);
  ctx.stroke();

  // --- HEAD (Snarling rabid) ---
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(5, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // Bloody snarling jaw
  ctx.fillStyle = '#4c0519';
  ctx.beginPath();
  ctx.moveTo(7, -3);
  ctx.lineTo(12, 0);
  ctx.lineTo(7, 3);
  ctx.closePath();
  ctx.fill();

  // Glowing rabid red eyes
  ctx.fillStyle = '#ff0033';
  ctx.beginPath();
  ctx.arc(8, -2.5, 2, 0, Math.PI * 2);
  ctx.arc(8, 2.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye glow glare
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8.5, -2.8, 1, 1);
  ctx.fillRect(8.5, 2.2, 1, 1);

  // --- SPRINTING & ATTACKING CLAWS ---
  const lunge = attack > 0 ? Math.sin(attack * Math.PI) * 14 : 0;
  const clawSwipe = Math.sin(t * 18) * 6;

  ctx.strokeStyle = skinColor;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  // Left claw
  ctx.beginPath();
  ctx.moveTo(1, -7);
  ctx.lineTo(15 + lunge + clawSwipe, -5);
  ctx.stroke();

  // Left razor claws
  ctx.fillStyle = '#fecdd3';
  ctx.fillRect(14 + lunge + clawSwipe, -6, 4, 1.5);
  ctx.fillRect(14 + lunge + clawSwipe, -4, 4, 1.5);

  // Right claw
  ctx.beginPath();
  ctx.moveTo(1, 7);
  ctx.lineTo(15 + lunge - clawSwipe, 5);
  ctx.stroke();

  // Right razor claws
  ctx.fillStyle = '#fecdd3';
  ctx.fillRect(14 + lunge - clawSwipe, 4, 4, 1.5);
  ctx.fillRect(14 + lunge - clawSwipe, 6, 4, 1.5);
}

/**
 * 3. BRUTE: Towering muscular mutated giant, massive shoulders, bone spikes, ground-shaking fists.
 */
function renderBruteZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, isHurt: boolean) {
  const t = z.walkAnimTimer || 0;
  const attack = z.attackAnimTimer || 0;

  // Heavy stomping stride
  const stride = Math.sin(t * 6) * 7;

  const skinColor = isHurt ? '#ef4444' : '#334155'; // Slate/ash mutated muscular flesh
  const overallColor = isHurt ? '#f87171' : '#7c2d12'; // Torn prison orange/heavy brown overalls

  // --- HEAVY STOMPING BOOTS & LEGS ---
  ctx.fillStyle = overallColor;
  ctx.beginPath();
  ctx.roundRect(-14 + stride, -16, 14, 9, 3);
  ctx.roundRect(-14 - stride, 7, 14, 9, 3);
  ctx.fill();

  // Massive steel-toe work boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-17 + stride, -16, 5, 9);
  ctx.fillRect(-17 - stride, 7, 5, 9);

  // --- MASSIVE MUTATED TORSO & SPINES ---
  // Huge broad shoulders
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 16, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Overalls & heavy leather straps
  ctx.fillStyle = overallColor;
  ctx.fillRect(-10, -14, 16, 28);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(-10, -14, 16, 28);

  // Protruding sharp bone spikes along back
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(-16, -8);
  ctx.lineTo(-24, -10);
  ctx.lineTo(-15, -6);
  ctx.moveTo(-18, 0);
  ctx.lineTo(-28, 0);
  ctx.lineTo(-18, 2);
  ctx.moveTo(-16, 8);
  ctx.lineTo(-24, 10);
  ctx.lineTo(-15, 6);
  ctx.fill();
  ctx.stroke();

  // --- MASSIVE HEAD ---
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(8, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // Heavy armored bone brow
  ctx.fillStyle = '#64748b';
  ctx.fillRect(8, -8, 6, 16);

  // Glowing fiery orange rage eyes
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(14, -4, 3, 0, Math.PI * 2);
  ctx.arc(14, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // --- COLOSSAL FISTS & HEAVY SLAMS ---
  const slam = attack > 0 ? Math.sin(attack * Math.PI) * 16 : 0;
  const fistSway = Math.sin(t * 6) * 5;

  ctx.fillStyle = skinColor;
  // Left massive arm & fist
  ctx.beginPath();
  ctx.roundRect(0, -22, 20 + slam, 10, 4);
  ctx.fill();
  // Fist knuckles
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(16 + slam, -22, 8, 10);

  // Right massive arm & fist
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.roundRect(0, 12, 20 + slam, 10, 4);
  ctx.fill();
  // Fist knuckles
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(16 + slam, 12, 8, 10);
}

/**
 * 4. TOXIC ZOMBIE: Hazmat suit remnants, pulsing emerald acid pustules, dripping corrosive slime.
 */
function renderToxicZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, isHurt: boolean) {
  const t = z.walkAnimTimer || 0;
  const isSpitting = z.isSpitting || false;

  const stride = Math.sin(t * 7) * 6;

  const hazmatYellow = isHurt ? '#ef4444' : '#ca8a04'; // Chemical hazmat suit
  const slimeGreen = '#22c55e'; // Corrosive biohazard green
  const pustuleGlow = '#4ade80';

  // --- LEGS ---
  ctx.fillStyle = hazmatYellow;
  ctx.beginPath();
  ctx.roundRect(-8 + stride, -9, 8, 5, 2);
  ctx.roundRect(-8 - stride, 4, 8, 5, 2);
  ctx.fill();

  // Rubber hazmat boots with green slime drips
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-10 + stride, -9, 3, 5);
  ctx.fillRect(-10 - stride, 4, 3, 5);

  // --- RUPTURED HAZMAT TORSO ---
  ctx.fillStyle = hazmatYellow;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Biohazard emblem on back
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-4, 0, 3, 0, Math.PI * 2);
  ctx.stroke();

  // Glowing, pulsing acid pustules bubbling on shoulders
  const bubblePulse = Math.sin(t * 10) * 1.5;
  ctx.fillStyle = pustuleGlow;
  ctx.beginPath();
  ctx.arc(-3, -11, 4.5 + bubblePulse, 0, Math.PI * 2);
  ctx.arc(-6, -6, 3.5 - bubblePulse, 0, Math.PI * 2);
  ctx.arc(-2, 10, 5 + bubblePulse, 0, Math.PI * 2);
  ctx.arc(-5, 5, 3 + bubblePulse, 0, Math.PI * 2);
  ctx.fill();

  // Pustule highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-4, -12, 1.5, 0, Math.PI * 2);
  ctx.arc(-3, 9, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // --- GAS MASK & SPITTING HEAD ---
  // Chemical gas mask fragment
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(4, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Glowing toxic visor/eyes
  ctx.fillStyle = slimeGreen;
  ctx.beginPath();
  ctx.arc(7, -3, 2.2, 0, Math.PI * 2);
  ctx.arc(7, 3, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Gas mask filter canister or open acidic maw
  ctx.fillStyle = isSpitting ? '#15803d' : '#334155';
  ctx.fillRect(8, -2.5, isSpitting ? 6 : 4, 5);

  // Spitting acid particles if actively attacking
  if (isSpitting) {
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(16, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- SLIME-DRIPPING ARMS ---
  ctx.strokeStyle = hazmatYellow;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(10, -6);
  ctx.moveTo(-1, 8);
  ctx.lineTo(10, 6);
  ctx.stroke();

  // Dripping corrosive hands
  ctx.fillStyle = slimeGreen;
  ctx.beginPath();
  ctx.arc(11, -6, 3, 0, Math.PI * 2);
  ctx.arc(11, 6, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 5. SHADOW ZOMBIE: Cloaked wraith assassin, smoky tattered shroud, elongated razor claws, glowing purple eyes.
 */
function renderShadowZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, isHurt: boolean) {
  const t = z.walkAnimTimer || 0;
  const attack = z.attackAnimTimer || 0;

  const cloakColor = isHurt ? '#ef4444' : '#09090b'; // Midnight black shroud
  const mistColor = '#7c3aed'; // Glowing purple spectral mist

  // Smoky shadowy aura particles behind
  ctx.fillStyle = 'rgba(124, 58, 237, 0.25)';
  ctx.beginPath();
  ctx.arc(-10, Math.sin(t * 5) * 4, 12, 0, Math.PI * 2);
  ctx.arc(-16, Math.cos(t * 6) * 5, 8, 0, Math.PI * 2);
  ctx.fill();

  // Tattered shadowy shroud/cloak
  ctx.fillStyle = cloakColor;
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(-4, -13);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-14, 8);
  ctx.lineTo(-4, 13);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = mistColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Shroud tatters
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(-22, -10);
  ctx.lineTo(-16, -3);
  ctx.lineTo(-24, 2);
  ctx.lineTo(-15, 7);
  ctx.fill();

  // Shadow cowl / hood
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(4, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Glowing spectral purple eyes
  ctx.fillStyle = isHurt ? '#ffffff' : '#c084fc';
  ctx.beginPath();
  ctx.arc(7, -2.5, 1.8, 0, Math.PI * 2);
  ctx.arc(7, 2.5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Eerie purple eye streaks
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(7, -2.5);
  ctx.lineTo(2, -4);
  ctx.moveTo(7, 2.5);
  ctx.lineTo(2, 4);
  ctx.stroke();

  // Shadow blades / elongated talons
  const lunge = attack > 0 ? Math.sin(attack * Math.PI) * 12 : 0;
  ctx.strokeStyle = '#380766';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(1, -7);
  ctx.lineTo(14 + lunge, -6);
  ctx.moveTo(1, 7);
  ctx.lineTo(14 + lunge, 6);
  ctx.stroke();

  // Obsidian razor claws
  ctx.fillStyle = '#e9d5ff';
  ctx.fillRect(13 + lunge, -8, 5, 1.5);
  ctx.fillRect(13 + lunge, 6.5, 5, 1.5);
}

/**
 * 6. MUTANT SOLDIER: Military camo, cracked Kevlar helmet, chest tactical rig, combat boots, ferocious advance.
 */
function renderSoldierZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity, isHurt: boolean) {
  const t = z.walkAnimTimer || 0;
  const attack = z.attackAnimTimer || 0;

  const stride = Math.sin(t * 11) * 8;

  const camoGreen = isHurt ? '#ef4444' : '#365314'; // Tactical military camo
  const vestBlack = isHurt ? '#fca5a5' : '#1e293b'; // Kevlar body armor plate
  const helmetColor = isHurt ? '#dc2626' : '#273418'; // Ballistic helmet

  // --- COMBAT BOOTS & CAMO TROUSERS ---
  ctx.fillStyle = camoGreen;
  ctx.beginPath();
  ctx.roundRect(-10 + stride, -10, 10, 6, 2);
  ctx.roundRect(-10 - stride, 4, 10, 6, 2);
  ctx.fill();

  // Heavy tactical combat boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-13 + stride, -10, 4, 6);
  ctx.fillRect(-13 - stride, 4, 4, 6);

  // --- TACTICAL CHEST RIG & TORSO ---
  // Torso base
  ctx.fillStyle = camoGreen;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kevlar Armor Plate
  ctx.fillStyle = vestBlack;
  ctx.beginPath();
  ctx.roundRect(-6, -9, 11, 18, 3);
  ctx.fill();

  // Bullet holes and infected claw gashes across armor plate
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(-2, -4, 2, 0, Math.PI * 2);
  ctx.arc(1, 3, 2, 0, Math.PI * 2);
  ctx.fill();

  // Ammo pouches & tactical radio
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-4, -8, 4, 3);
  ctx.fillRect(-4, -3, 4, 3);
  ctx.fillRect(-4, 2, 4, 3);

  // --- CRACKED KEVLAR HELMET & RED VISOR ---
  ctx.fillStyle = helmetColor;
  ctx.beginPath();
  ctx.arc(3, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#141e0a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Night-vision mount or cracked visor
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(7, -5, 3, 10);

  // Glowing infected red combat visor/eyes
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(9, -3.5, 2, 7);

  // --- ARMORED ARMS & COMBAT BLADE / BASH ---
  const lunge = attack > 0 ? Math.sin(attack * Math.PI) * 10 : 0;
  ctx.strokeStyle = camoGreen;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-1, -9);
  ctx.lineTo(13 + lunge, -7);
  ctx.moveTo(-1, 9);
  ctx.lineTo(13 + lunge, 7);
  ctx.stroke();

  // Armored combat gloves
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(14 + lunge, -7, 3.5, 0, Math.PI * 2);
  ctx.arc(14 + lunge, 7, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Tactical combat knife blade strapped to right hand
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(15 + lunge, 5.5, 8, 2.5);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(21 + lunge, 5.5, 2, 2.5);
}

/**
 * 7. THE HULK (TITAN BOSS): Colossal multi-stage mutated behemoth, lava cracks, bone carapace, ground-shaking fists.
 */
function renderHulkTitanBoss(ctx: CanvasRenderingContext2D, boss: ZombieEntity, isHurt: boolean) {
  const r = boss.radius;
  const phase = boss.bossPhase || 1;
  const state = boss.bossState || 'chase';

  // Outer spiked carapace
  const carapaceColor = phase === 2 ? '#7f1d1d' : (phase === 3 ? '#450a0a' : '#1e293b');
  ctx.fillStyle = isHurt ? '#ef4444' : carapaceColor;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = phase === 3 ? '#f97316' : '#000000';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Glowing molten lava fissures across body
  ctx.strokeStyle = phase === 3 ? '#facc15' : '#ea580c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.4);
  ctx.lineTo(0, 0);
  ctx.lineTo(r * 0.4, -r * 0.3);
  ctx.moveTo(-r * 0.4, r * 0.4);
  ctx.lineTo(0, 0);
  ctx.lineTo(r * 0.4, r * 0.3);
  ctx.stroke();

  // Massive mutated bone shoulder plates
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.7, r * 0.35, 0, Math.PI * 2);
  ctx.arc(-r * 0.2, r * 0.7, r * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Bone spikes protruding outward
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r * 0.9);
  ctx.lineTo(-r * 0.4, -r * 1.2);
  ctx.lineTo(0, -r * 0.9);
  ctx.moveTo(-r * 0.2, r * 0.9);
  ctx.lineTo(-r * 0.4, r * 1.2);
  ctx.lineTo(0, r * 0.9);
  ctx.fill();

  // Massive crushing fists
  ctx.fillStyle = '#090d16';
  ctx.fillRect(r * 0.4, -r * 0.8, r * 0.5, r * 0.4);
  ctx.fillRect(r * 0.4, r * 0.4, r * 0.5, r * 0.4);

  // Flaming demonic eyes
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(r * 0.5, -12, 6, 0, Math.PI * 2);
  ctx.arc(r * 0.5, 12, 6, 0, Math.PI * 2);
  ctx.fill();

  // Charge telegraph ray
  if (state === 'prepare_charge' && boss.bossChargeAngle !== undefined) {
    ctx.save();
    ctx.rotate(-boss.angle + boss.bossChargeAngle);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 12;
    ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(450, 0);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Health bar above damaged zombies.
 */
function renderZombieHealthBar(ctx: CanvasRenderingContext2D, z: ZombieEntity) {
  const barW = Math.max(26, z.radius * 2);
  const barH = 4;
  const pct = Math.max(0, z.health / z.maxHealth);

  ctx.save();
  ctx.rotate(-z.angle); // Keep health bar horizontal
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(-barW / 2, -z.radius - 12, barW, barH);

  // Health fill
  ctx.fillStyle = pct > 0.5 ? '#22c55e' : (pct > 0.25 ? '#eab308' : '#ef4444');
  ctx.fillRect(-barW / 2, -z.radius - 12, barW * pct, barH);
  ctx.restore();
}

/**
 * Zombie death animation: staggering backward, collapsing limbs, and spreading dark blood.
 */
function renderZombieDeath(ctx: CanvasRenderingContext2D, z: ZombieEntity) {
  const progress = Math.min(1, (z.deathAnimTimer || 0) / 0.5);
  const bloodRadius = z.radius * (0.8 + progress * 0.6);

  // Dark coagulated zombie blood pool
  ctx.fillStyle = z.type === 'toxic' ? 'rgba(34, 197, 94, 0.75)' : 'rgba(88, 28, 28, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, bloodRadius, 0, Math.PI * 2);
  ctx.fill();

  // Collapsed corpse silhouette
  ctx.save();
  ctx.rotate(z.angle);
  ctx.globalAlpha = Math.max(0.2, 1 - progress * 0.4);

  ctx.fillStyle = z.color;
  ctx.beginPath();
  ctx.ellipse(-progress * 6, 0, z.radius * 0.8, z.radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Severed / fallen arms
  ctx.fillRect(-progress * 4, -z.radius * 0.7, z.radius * 0.9, 4);
  ctx.fillRect(-progress * 4, z.radius * 0.4, z.radius * 0.9, 4);

  ctx.restore();
}
