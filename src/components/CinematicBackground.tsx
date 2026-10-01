import React, { useEffect, useRef } from 'react';

export const CinematicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Weather & Atmosphere particles
    interface RainDrop {
      x: number;
      y: number;
      length: number;
      speedY: number;
      speedX: number;
      alpha: number;
    }

    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      color: string;
    }

    interface FogCloud {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      alpha: number;
    }

    interface ZombieSilhouette {
      x: number;
      y: number;
      speedX: number;
      scale: number;
      walkTime: number;
    }

    const rainCount = Math.min(80, Math.floor(width / 20));
    const raindrops: RainDrop[] = Array.from({ length: rainCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 15,
      speedY: Math.random() * 12 + 16,
      speedX: -2.5,
      alpha: Math.random() * 0.25 + 0.1,
    }));

    const embers: Ember[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 1.0 + 0.4),
      speedX: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
    }));

    const fogClouds: FogCloud[] = Array.from({ length: 6 }, (_, i) => ({
      x: (i * width) / 5,
      y: height * 0.65 + Math.random() * 80,
      radius: 160 + Math.random() * 80,
      speedX: (Math.random() * 0.2 + 0.1) * (i % 2 === 0 ? 1 : -1),
      alpha: 0.08 + Math.random() * 0.05,
    }));

    // Wandering zombie silhouettes in the background street
    const zombies: ZombieSilhouette[] = [
      { x: width * 0.15, y: height * 0.72, speedX: 0.25, scale: 0.65, walkTime: 0 },
      { x: width * 0.82, y: height * 0.74, speedX: -0.2, scale: 0.6, walkTime: 1.5 },
      { x: width * 0.45, y: height * 0.76, speedX: 0.18, scale: 0.55, walkTime: 3.2 },
    ];

    let time = 0;

    const render = () => {
      time += 0.02;

      // 1. Base Sky Gradient (deep navy, charcoal, ominous desaturated green, dark crimson horizon)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#020617'); // Pitch navy black
      skyGrad.addColorStop(0.35, '#091322'); // Deep navy
      skyGrad.addColorStop(0.65, '#0b191a'); // Dark desaturated toxic green tone
      skyGrad.addColorStop(0.85, '#1e1115'); // Muted distant fire charcoal red
      skyGrad.addColorStop(1, '#05070e'); // Deep asphalt base
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Distant Fire & Smoke Glow
      const fireGlow = ctx.createRadialGradient(width * 0.25, height * 0.6, 20, width * 0.25, height * 0.6, 280);
      const fireFlicker = Math.sin(time * 6) * 0.04;
      fireGlow.addColorStop(0, `rgba(249, 115, 22, ${0.22 + fireFlicker})`);
      fireGlow.addColorStop(0.5, `rgba(220, 38, 38, ${0.12 + fireFlicker})`);
      fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(0, 0, width, height);

      const fireGlow2 = ctx.createRadialGradient(width * 0.78, height * 0.55, 30, width * 0.78, height * 0.55, 240);
      fireGlow2.addColorStop(0, `rgba(234, 88, 12, ${0.18 + Math.cos(time * 5) * 0.03})`);
      fireGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fireGlow2;
      ctx.fillRect(0, 0, width, height);

      // 3. Distant Ruined Buildings Layer (Far Silhouette)
      ctx.fillStyle = '#060b14';
      const buildingWidth = 70;
      const bCount = Math.ceil(width / buildingWidth) + 1;
      for (let i = 0; i < bCount; i++) {
        const bHeight = 160 + ((i * 47) % 180);
        const bx = i * buildingWidth;
        const by = height * 0.68 - bHeight;
        ctx.fillRect(bx, by, buildingWidth + 2, bHeight + 40);

        // Broken tops / crumbling antennas
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(bx + 15, by);
          ctx.lineTo(bx + 20, by - 25);
          ctx.strokeStyle = '#060b14';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 4. Midground Destroyed City Skyline (Towers, Crumbled Floors, Shattered Windows)
      ctx.fillStyle = '#0a0f1d';
      for (let i = 0; i < bCount; i += 2) {
        const mbHeight = 120 + ((i * 73) % 140);
        const mbx = i * buildingWidth + 20;
        const mby = height * 0.7 - mbHeight;
        ctx.fillRect(mbx, mby, buildingWidth * 1.5, mbHeight + 60);

        // A few dim flickering apartment windows
        if ((i + 1) % 4 === 0) {
          const winFlicker = Math.sin(time * 3 + i) > 0.3;
          if (winFlicker) {
            ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
            ctx.fillRect(mbx + 15, mby + 30, 8, 12);
            ctx.fillStyle = '#0a0f1d';
          }
        }
      }

      // 5. Street Level & Ruined Ground Horizon
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      // Road curb line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.75);
      ctx.lineTo(width, height * 0.75);
      ctx.stroke();

      // Abandoned Overturned Car Silhouettes
      const drawCarSilhouette = (x: number, y: number, flipped: boolean) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#090e18';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;

        if (flipped) {
          // Overturned chassis
          ctx.beginPath();
          ctx.moveTo(-45, 0);
          ctx.lineTo(-40, -16);
          ctx.lineTo(35, -16);
          ctx.lineTo(45, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Wheels in the air
          ctx.fillStyle = '#030712';
          ctx.fillRect(-35, -24, 14, 8);
          ctx.fillRect(20, -24, 14, 8);
        } else {
          // Wrecked abandoned car
          ctx.beginPath();
          ctx.roundRect(-45, -20, 90, 20, [8, 8, 2, 2]);
          ctx.fill();
          ctx.stroke();
          // Cabin
          ctx.fillRect(-22, -34, 46, 16);
          // Wheels
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(-26, 0, 9, 0, Math.PI * 2);
          ctx.arc(26, 0, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };

      drawCarSilhouette(width * 0.22, height * 0.75, false);
      drawCarSilhouette(width * 0.76, height * 0.75, true);

      // Broken Flickering Street Lamp
      const lampX = width * 0.88;
      const lampY = height * 0.75;
      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(lampX, lampY);
      ctx.lineTo(lampX, lampY - 140);
      ctx.quadraticCurveTo(lampX, lampY - 170, lampX - 25, lampY - 170);
      ctx.stroke();

      // Flickering Street Lamp Light Cone
      const lampFlicker = Math.sin(time * 12) > -0.2 ? (Math.random() > 0.08 ? 0.35 : 0.05) : 0;
      if (lampFlicker > 0) {
        const lampCone = ctx.createRadialGradient(lampX - 25, lampY - 170, 5, lampX - 50, lampY - 20, 160);
        lampCone.addColorStop(0, `rgba(254, 240, 138, ${lampFlicker * 0.8})`);
        lampCone.addColorStop(0.4, `rgba(245, 158, 11, ${lampFlicker * 0.3})`);
        lampCone.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lampCone;
        ctx.beginPath();
        ctx.moveTo(lampX - 25, lampY - 170);
        ctx.lineTo(lampX - 130, lampY);
        ctx.lineTo(lampX + 30, lampY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 6. Wandering Zombie Silhouettes
      zombies.forEach((z) => {
        z.walkTime += 0.04;
        z.x += z.speedX;
        if (z.speedX > 0 && z.x > width + 40) z.x = -40;
        if (z.speedX < 0 && z.x < -40) z.x = width + 40;

        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.scale(z.scale * (z.speedX > 0 ? 1 : -1), z.scale);
        const limpY = Math.sin(z.walkTime * 3) * 2;
        const armSway = Math.sin(z.walkTime * 3) * 6;

        ctx.fillStyle = '#060a12';
        // Head tilted
        ctx.beginPath();
        ctx.arc(0, -38 + limpY, 6, 0, Math.PI * 2);
        ctx.fill();
        // Torso bent forward
        ctx.beginPath();
        ctx.roundRect(-5, -30 + limpY, 10, 22, 2);
        ctx.fill();
        // Outstretched shambling arms
        ctx.fillRect(0, -26 + limpY, 14, 4);
        // Legs
        ctx.fillRect(-4, -8, 4, 18);
        ctx.fillRect(2, -8 + armSway * 0.3, 4, 18);
        ctx.restore();
      });

      // 7. Drifting Fog Clouds across the ground
      fogClouds.forEach((f) => {
        f.x += f.speedX;
        if (f.x > width + f.radius) f.x = -f.radius;
        if (f.x < -f.radius) f.x = width + f.radius;

        const fGrad = ctx.createRadialGradient(f.x, f.y, 20, f.x, f.y, f.radius);
        fGrad.addColorStop(0, `rgba(51, 65, 85, ${f.alpha})`);
        fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 8. Distant Rain Streaks
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      raindrops.forEach((r) => {
        r.y += r.speedY;
        r.x += r.speedX;
        if (r.y > height) {
          r.y = -20;
          r.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + r.speedX * 2, r.y + r.length);
        ctx.stroke();
      });

      // 9. Floating Fire Embers / Sparks
      embers.forEach((e) => {
        e.y += e.speedY;
        e.x += e.speedX + Math.sin(time * 2 + e.y * 0.01) * 0.4;
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.globalAlpha = e.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = e.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Dynamic Animated Atmospheric Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Radial Vignette Mask to guarantee UI legibility */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80 pointer-events-none" 
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(2,6,23,0.75)_70%,_rgba(2,6,23,0.95)_100%)] pointer-events-none" 
      />
    </div>
  );
};
