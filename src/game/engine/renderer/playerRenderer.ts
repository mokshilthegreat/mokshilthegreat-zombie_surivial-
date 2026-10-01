import { WeaponConfig } from '../../../types/game';

export interface PlayerRenderProps {
  x: number;
  y: number;
  radius: number;
  angle: number;           // Aim angle towards mouse (360 degrees)
  moveAngle: number;       // Direction player is walking/moving
  isMoving: boolean;       // Is WASD active
  isRunning: boolean;      // Dash / sprint
  walkAnimTimer: number;   // Accumulated time for walking stride
  isReloading: boolean;
  reloadProgress: number;  // 0 to 1
  isShooting: boolean;
  recoilOffset: number;    // Recoil kickback distance (pixels)
  muzzleFlashTimer: number;// Timer for muzzle flash glow
  hurtFlashTimer: number;  // Timer for taking damage flash
  isDead: boolean;
  deathAnimTimer: number;  // 0 to 1
  armor: number;
  maxArmor: number;
  currentWeapon: WeaponConfig;
}

/**
 * Draws a high-definition 2D top-down human survivor character sprite.
 * Fully supports independent movement direction (legs) and aim angle (torso, head, arms, weapon).
 * Includes detailed head, hair, backpack, tactical jacket/vest, arms, hands, legs, boots, and visible weapon.
 */
export function renderPlayerCharacter(ctx: CanvasRenderingContext2D, props: PlayerRenderProps) {
  const {
    x,
    y,
    angle,
    moveAngle,
    isMoving,
    isRunning,
    walkAnimTimer,
    isReloading,
    reloadProgress,
    recoilOffset,
    muzzleFlashTimer,
    hurtFlashTimer,
    isDead,
    deathAnimTimer,
    armor,
    currentWeapon,
  } = props;

  ctx.save();
  ctx.translate(x, y);

  // If dead, render falling / collapsed corpse with blood pool
  if (isDead) {
    renderDeadPlayer(ctx, angle, deathAnimTimer);
    ctx.restore();
    return;
  }

  // Flash color if recently hurt
  const isHurt = hurtFlashTimer > 0;

  // Drop shadow underneath player
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- 1. LEGS & BOOTS LAYER ---
  // The legs point in the MOVEMENT direction (or default to aim direction if stationary)
  ctx.save();
  const legAngle = isMoving ? moveAngle : angle;
  ctx.rotate(legAngle);

  // Stride calculation: sinusoidal movement for left & right legs
  const strideFreq = isRunning ? 16 : 10;
  const strideAmp = isRunning ? 14 : 9;
  const stride = isMoving ? Math.sin(walkAnimTimer * strideFreq) * strideAmp : 0;

  // Trouser / Pants styling
  const pantsColor = isHurt ? '#ef4444' : '#273444';
  const bootColor = isHurt ? '#b91c1c' : '#111827';
  const bootHighlight = isHurt ? '#fca5a5' : '#4b5563';

  // Left Leg & Boot
  ctx.save();
  ctx.translate(-5 + stride, -10);
  // Thigh & Shin
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(-4, -2, 8, 14, 3);
  ctx.fill();
  // Combat Boot
  ctx.fillStyle = bootColor;
  ctx.beginPath();
  ctx.roundRect(-4, 6, 8, 8, 2);
  ctx.fill();
  // Boot toe / lace highlight
  ctx.fillStyle = bootHighlight;
  ctx.fillRect(-3, 10, 6, 2);
  ctx.restore();

  // Right Leg & Boot
  ctx.save();
  ctx.translate(5 - stride, -10);
  // Thigh & Shin
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(-4, -2, 8, 14, 3);
  ctx.fill();
  // Combat Boot
  ctx.fillStyle = bootColor;
  ctx.beginPath();
  ctx.roundRect(-4, 6, 8, 8, 2);
  ctx.fill();
  // Boot toe / lace highlight
  ctx.fillStyle = bootHighlight;
  ctx.fillRect(-3, 10, 6, 2);
  ctx.restore();

  ctx.restore(); // Restore leg rotation

  // --- 2. UPPER BODY & AIM ROTATION LAYER ---
  // Torso, backpack, head, arms, and weapon all rotate to EXACT AIM ANGLE toward mouse
  ctx.save();
  ctx.rotate(angle);

  // Apply recoil pushback along aim vector
  const kickback = Math.max(0, recoilOffset);
  ctx.translate(-kickback, 0);

  // Subtle breathing sway when idle
  const breath = !isMoving ? Math.sin(walkAnimTimer * 3) * 0.5 : 0;

  // A. BACKPACK (strapped on survivor's back)
  ctx.save();
  const backpackColor = isHurt ? '#dc2626' : '#3f3a2c'; // Dark Olive/Khaki canvas
  const backpackTrim = '#232018';
  ctx.fillStyle = backpackColor;
  ctx.beginPath();
  ctx.roundRect(-22, -11, 11, 22, 4);
  ctx.fill();
  ctx.strokeStyle = backpackTrim;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Backpack side pouches and zipper straps
  ctx.fillStyle = '#524b38';
  ctx.fillRect(-20, -9, 7, 7);
  ctx.fillRect(-20, 2, 7, 7);
  // Straps crossing back
  ctx.strokeStyle = '#181510';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-11, -8);
  ctx.lineTo(-4, -8);
  ctx.moveTo(-11, 8);
  ctx.lineTo(-4, 8);
  ctx.stroke();
  ctx.restore();

  // B. TORSO / BODY (Tactical Survivor Jacket & Body Armor)
  ctx.save();
  const jacketColor = isHurt ? '#ef4444' : '#334155'; // Slate tactical jacket
  const vestColor = armor > 0 ? (isHurt ? '#f87171' : '#1e293b') : (isHurt ? '#dc2626' : '#293548');

  // Main Torso (Survivor upper body)
  ctx.fillStyle = jacketColor;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 12, 14 + breath, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tactical Kevlar Vest / Chest Plate
  ctx.fillStyle = vestColor;
  ctx.beginPath();
  ctx.roundRect(-8, -10, 15, 20, 4);
  ctx.fill();

  // Armor plate border & tactical MOLLE webbing
  ctx.strokeStyle = armor > 0 ? '#38bdf8' : '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ammo pouches & radio holster on chest
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-4, -9, 5, 4);
  ctx.fillRect(-4, -3, 5, 4);
  ctx.fillRect(-4, 3, 5, 4);
  // Radio antenna on left shoulder
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-7, -11);
  ctx.lineTo(-14, -14);
  ctx.stroke();
  ctx.restore();

  // C. HEAD & SURVIVOR FACE (top-down view)
  ctx.save();
  // Survivor neck/collar
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (skin tone)
  const skinColor = isHurt ? '#fca5a5' : '#e29d72'; // Light-tan survivor skin
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(3, 0, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(2, -7.5, 2, 0, Math.PI * 2);
  ctx.arc(2, 7.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Tactical Cap / Hair / Bandana
  const hairColor = '#1e1b18'; // Dark hair/cap
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  // Cap brim extending forward toward mouse
  ctx.arc(2, 0, 7, Math.PI * 0.4, Math.PI * 1.6);
  ctx.lineTo(8, -4);
  ctx.lineTo(9, 0);
  ctx.lineTo(8, 4);
  ctx.closePath();
  ctx.fill();

  // Tactical Headband / Cap strap
  ctx.strokeStyle = '#b91c1c'; // Red survivor bandana accent
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(2, 0, 7.5, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  ctx.restore();

  // D. ARMS, HANDS & EQUIPPED WEAPON
  // Handles reloading animation angle and recoil
  ctx.save();
  renderSurvivorArmsAndWeapon(ctx, {
    weapon: currentWeapon,
    isReloading,
    reloadProgress,
    isHurt,
    skinColor,
    jacketColor,
    recoilOffset,
    muzzleFlashTimer,
  });
  ctx.restore();

  ctx.restore(); // Restore aim angle rotation

  ctx.restore(); // Restore world translation
}

/**
 * Renders arms gripping the weapon and the weapon itself.
 * Supports realistic reload animations (weapon dipped, hands shifting) and firing recoil.
 */
function renderSurvivorArmsAndWeapon(
  ctx: CanvasRenderingContext2D,
  data: {
    weapon: WeaponConfig;
    isReloading: boolean;
    reloadProgress: number;
    isHurt: boolean;
    skinColor: string;
    jacketColor: string;
    recoilOffset: number;
    muzzleFlashTimer: number;
  }
) {
  const { weapon, isReloading, reloadProgress, isHurt, skinColor, jacketColor, recoilOffset, muzzleFlashTimer } = data;

  // Shoulder positions on torso
  const leftShoulder = { x: 0, y: -11 };
  const rightShoulder = { x: 0, y: 11 };

  // Reload animation modifies weapon angle and hand position
  let reloadTilt = 0;
  let leftHandOffset = { x: 0, y: 0 };
  let magEjectY = 0;

  if (isReloading) {
    // Weapon tilts downward/inward during reload
    reloadTilt = Math.sin(reloadProgress * Math.PI) * 0.4;
    // Left hand moves down to slap/insert fresh magazine
    leftHandOffset.x = Math.sin(reloadProgress * Math.PI) * -8;
    leftHandOffset.y = Math.sin(reloadProgress * Math.PI) * 12;
    // Falling old magazine animation
    if (reloadProgress > 0.2 && reloadProgress < 0.8) {
      magEjectY = (reloadProgress - 0.2) * 20;
    }
  }

  // Weapon rotation pivot
  ctx.save();
  ctx.rotate(reloadTilt);

  // Weapon dimensions and anchor points based on weapon type
  const wepInfo = getWeaponVisualDimensions(weapon.id);

  // Weapon base position
  const wepX = 14;
  const wepY = 3;

  // --- DRAW VISIBLE WEAPON ---
  ctx.save();
  ctx.translate(wepX, wepY);
  drawDetailedWeapon(ctx, weapon.id, isHurt);

  // Dropping magazine effect during reload
  if (isReloading && magEjectY > 0) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 5 + magEjectY, 4, 8);
  }

  // --- MUZZLE FLASH ---
  if (muzzleFlashTimer > 0 && !isReloading) {
    drawMuzzleFlash(ctx, wepInfo.barrelLength, wepInfo.barrelY, weapon.id);
  }

  ctx.restore(); // Restore weapon translate

  // --- DRAW ARMS & HANDS ---
  // Gloved hands
  const gloveColor = isHurt ? '#ef4444' : '#1e293b';

  // Left Arm (Supports barrel/handguard)
  const leftHandTarget = {
    x: wepX + wepInfo.gripLeftX + leftHandOffset.x,
    y: wepY + wepInfo.gripLeftY + leftHandOffset.y,
  };

  // Left Shoulder sleeve
  ctx.fillStyle = jacketColor;
  ctx.beginPath();
  ctx.ellipse(leftShoulder.x, leftShoulder.y, 5, 4, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Left Forearm
  ctx.strokeStyle = jacketColor;
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(leftShoulder.x + 2, leftShoulder.y + 1);
  ctx.lineTo(leftHandTarget.x - 2, leftHandTarget.y);
  ctx.stroke();

  // Left Hand (glove gripping handguard)
  ctx.fillStyle = gloveColor;
  ctx.beginPath();
  ctx.arc(leftHandTarget.x, leftHandTarget.y, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Right Arm (Pistol grip / Trigger finger)
  const rightHandTarget = {
    x: wepX + wepInfo.gripRightX,
    y: wepY + wepInfo.gripRightY,
  };

  // Right Shoulder sleeve
  ctx.fillStyle = jacketColor;
  ctx.beginPath();
  ctx.ellipse(rightShoulder.x, rightShoulder.y, 5, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Right Forearm
  ctx.strokeStyle = jacketColor;
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(rightShoulder.x + 2, rightShoulder.y - 1);
  ctx.lineTo(rightHandTarget.x - 2, rightHandTarget.y);
  ctx.stroke();

  // Right Hand (glove gripping pistol grip & trigger)
  ctx.fillStyle = gloveColor;
  ctx.beginPath();
  ctx.arc(rightHandTarget.x, rightHandTarget.y, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Reload progress circle indicator near hands when reloading
  if (isReloading) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(wepX + 4, wepY - 14, 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * reloadProgress);
    ctx.stroke();
  }

  ctx.restore(); // Restore weapon tilt
}

/**
 * Returns visual layout metrics for each weapon type so hands grip precisely.
 */
function getWeaponVisualDimensions(wepId: string) {
  switch (wepId) {
    case 'pistol':
      return { barrelLength: 14, barrelY: 0, gripRightX: 2, gripRightY: 0, gripLeftX: 2, gripLeftY: -2 };
    case 'shotgun':
      return { barrelLength: 26, barrelY: 0, gripRightX: 3, gripRightY: 0, gripLeftX: 16, gripLeftY: -1 };
    case 'smg':
      return { barrelLength: 18, barrelY: 0, gripRightX: 2, gripRightY: 0, gripLeftX: 10, gripLeftY: -2 };
    case 'rifle':
      return { barrelLength: 28, barrelY: 0, gripRightX: 4, gripRightY: 0, gripLeftX: 18, gripLeftY: -1 };
    case 'sniper':
      return { barrelLength: 36, barrelY: 0, gripRightX: 4, gripRightY: 0, gripLeftX: 20, gripLeftY: -1 };
    case 'crossbow':
      return { barrelLength: 22, barrelY: 0, gripRightX: 3, gripRightY: 0, gripLeftX: 14, gripLeftY: -2 };
    case 'flamethrower':
      return { barrelLength: 28, barrelY: 0, gripRightX: 4, gripRightY: 0, gripLeftX: 18, gripLeftY: -2 };
    case 'grenade_launcher':
      return { barrelLength: 24, barrelY: 0, gripRightX: 3, gripRightY: 0, gripLeftX: 14, gripLeftY: -2 };
    case 'rocket_launcher':
      return { barrelLength: 32, barrelY: 0, gripRightX: 4, gripRightY: 0, gripLeftX: 18, gripLeftY: -3 };
    default:
      return { barrelLength: 20, barrelY: 0, gripRightX: 3, gripRightY: 0, gripLeftX: 12, gripLeftY: -1 };
  }
}

/**
 * Detailed 2D top-down render of all 9 weapons with metal, stocks, barrels, and scopes.
 */
function drawDetailedWeapon(ctx: CanvasRenderingContext2D, wepId: string, isHurt: boolean) {
  const metalDark = isHurt ? '#b91c1c' : '#0f172a';
  const metalGun = isHurt ? '#ef4444' : '#334155';
  const stockWood = isHurt ? '#dc2626' : '#78350f';
  const accentColor = isHurt ? '#fca5a5' : '#94a3b8';

  switch (wepId) {
    case 'pistol': // 9mm Tactical Pistol
      ctx.fillStyle = metalDark;
      ctx.fillRect(0, -2, 14, 4); // Slide
      ctx.fillStyle = metalGun;
      ctx.fillRect(2, -1.5, 10, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(13, -1, 1.5, 2); // Muzzle
      break;

    case 'shotgun': // Pump-Action Tactical Shotgun
      // Stock
      ctx.fillStyle = stockWood;
      ctx.fillRect(-6, -2, 7, 4);
      // Receiver
      ctx.fillStyle = metalDark;
      ctx.fillRect(1, -2.5, 9, 5);
      // Twin Barrel & Magazine Tube
      ctx.fillStyle = metalGun;
      ctx.fillRect(10, -2.5, 16, 5);
      // Pump Slide Handle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(13, -3.5, 7, 7);
      break;

    case 'smg': // Micro SMG
      // Wire stock
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-6, -2, 7, 4);
      // Receiver & Grip
      ctx.fillStyle = metalDark;
      ctx.fillRect(1, -2.5, 12, 5);
      // Curved Magazine Port
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 2, 4, 8);
      // Barrel & Suppressor tip
      ctx.fillStyle = metalGun;
      ctx.fillRect(13, -2, 7, 4);
      break;

    case 'rifle': // Assault Rifle (M4/AK Hybrid)
      // Shoulder Stock
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -2.5, 9, 5);
      // Receiver
      ctx.fillStyle = metalDark;
      ctx.fillRect(1, -2.5, 12, 5);
      // Curved Banana Magazine
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(6, 2, 4.5, 10, 2);
      ctx.fill();
      // Handguard & Barrel
      ctx.fillStyle = metalGun;
      ctx.fillRect(13, -2, 12, 4);
      // Flash Hider
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(25, -2.5, 3, 5);
      // Iron sights / Red Dot Sight
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(6, -4, 2, 2);
      break;

    case 'sniper': // Marksman High-Powered Sniper Rifle
      // Heavy Ergonomic Stock
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10, -3, 11, 6);
      // Receiver
      ctx.fillStyle = metalDark;
      ctx.fillRect(1, -2.5, 14, 5);
      // Long Fluted Precision Barrel
      ctx.fillStyle = metalGun;
      ctx.fillRect(15, -1.8, 19, 3.6);
      // Muzzle Brake
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(34, -2.5, 4, 5);
      // High-Powered Telescopic Scope
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -6, 12, 3.5);
      // Scope Glass Lens Glow
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(15, -5.5, 1.5, 2.5);
      break;

    case 'crossbow': // Tactical Hunting Crossbow
      // Stock & Riser
      ctx.fillStyle = stockWood;
      ctx.fillRect(-4, -2, 18, 4);
      // Curved Bow Limbs
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, -14);
      ctx.quadraticCurveTo(16, 0, 14, 14);
      ctx.stroke();
      // Bow String
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(14, -14);
      ctx.lineTo(6, 0);
      ctx.lineTo(14, 14);
      ctx.stroke();
      // Loaded glowing arrow/bolt
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -0.8, 12, 1.6);
      break;

    case 'flamethrower': // Heavy Chem-Sprayer Flamethrower
      // Twin Fuel Tanks on side
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.roundRect(-4, -7, 10, 5, 2);
      ctx.roundRect(-4, 2, 10, 5, 2);
      ctx.fill();
      // Heavy Barrel
      ctx.fillStyle = metalDark;
      ctx.fillRect(6, -3, 18, 6);
      // Heat Shield Perforated Shroud
      ctx.fillStyle = metalGun;
      ctx.fillRect(14, -3.5, 10, 7);
      // Pilot Igniter Flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(26, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'grenade_launcher': // Revolving Drum Grenade Launcher
      // Stock
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-6, -2.5, 7, 5);
      // Large Revolving Cylinder Drum
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.arc(6, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Thick Cannon Barrel
      ctx.fillStyle = metalGun;
      ctx.fillRect(11, -3.5, 13, 7);
      break;

    case 'rocket_launcher': // RPG / Heavy Shoulder Tube
      // Long Shoulder Tube (Olive Drab)
      ctx.fillStyle = '#3f4e2c';
      ctx.fillRect(-8, -4, 34, 8);
      // Exhaust Vent Cone at Back
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-8, -5);
      ctx.lineTo(-13, -7);
      ctx.lineTo(-13, 7);
      ctx.lineTo(-8, 5);
      ctx.closePath();
      ctx.fill();
      // Rocket Warhead Tip protruding from front
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(26, -3);
      ctx.lineTo(34, 0);
      ctx.lineTo(26, 3);
      ctx.closePath();
      ctx.fill();
      break;
  }
}

/**
 * Energetic, sharp muzzle flash at the barrel tip with light blast and smoke.
 */
function drawMuzzleFlash(ctx: CanvasRenderingContext2D, barrelLength: number, barrelY: number, wepId: string) {
  const flashSize = wepId === 'shotgun' || wepId === 'rocket_launcher' ? 22 : 14;

  ctx.save();
  ctx.translate(barrelLength, barrelY);

  // Outer yellow/orange burst
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(0, -flashSize * 0.4);
  ctx.lineTo(flashSize, 0);
  ctx.lineTo(0, flashSize * 0.4);
  ctx.lineTo(flashSize * 0.3, 0);
  ctx.closePath();
  ctx.fill();

  // Spikes / muzzle blast rays
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(flashSize * 1.3, -flashSize * 0.3);
  ctx.moveTo(0, 0);
  ctx.lineTo(flashSize * 1.4, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(flashSize * 1.3, flashSize * 0.3);
  ctx.stroke();

  // White-hot core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(2, 0, flashSize * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Survivor death animation: falling to the ground, collapsing limbs, and spreading blood pool.
 */
function renderDeadPlayer(ctx: CanvasRenderingContext2D, angle: number, deathProgress: number) {
  const bloodRadius = Math.min(28, 10 + deathProgress * 18);

  // Spreading blood puddle
  ctx.fillStyle = 'rgba(153, 27, 27, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, bloodRadius, 0, Math.PI * 2);
  ctx.fill();

  // Fallen corpse rotated in death direction
  ctx.save();
  ctx.rotate(angle);

  // Fallen legs
  ctx.fillStyle = '#273444';
  ctx.fillRect(-12, -8, 14, 6);
  ctx.fillRect(-14, 4, 14, 6);

  // Fallen Torso
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(-2, 0, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Backpack spilled
  ctx.fillStyle = '#3f3a2c';
  ctx.fillRect(-18, -10, 9, 18);

  // Head resting on side
  ctx.fillStyle = '#e29d72';
  ctx.beginPath();
  ctx.arc(6, 4, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Dropped weapon lying beside survivor
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, -10, 16, 4);

  ctx.restore();
}
