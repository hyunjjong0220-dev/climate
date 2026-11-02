import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../lib/audio';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Waves,
  Zap,
  Volume2,
  VolumeX,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';

interface GameCanvasProps {
  stage: number;
  score: number;
  coins: number;
  inventory: string[];
  onLevelComplete: (newScore: number, newCoins: number) => void;
  onGameOver: (finalScore: number) => void;
  onBossDefeated?: () => void;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  type: 'car' | 'factory' | 'coal' | 'plastic';
  name: string;
}

interface Item {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'seed' | 'mangrove' | 'coin';
  collected: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'seed' | 'laser';
  isPlayer: boolean;
}

interface Boss {
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  direction: number;
  lastAttackTime: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface PlantedTree {
  x: number;
  y: number;
  growth: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stage,
  score,
  coins,
  inventory,
  onLevelComplete,
  onGameOver,
  onBossDefeated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound toggle
  const [isMuted, setIsMuted] = useState(false);

  // Running scores state for UI
  const [currentScore, setCurrentScore] = useState(score);
  const [currentCoins, setCurrentCoins] = useState(coins);
  const [waterHeightPercent, setWaterHeightPercent] = useState(15);
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [rescueMessage, setRescueMessage] = useState<string>('');

  // Upgrades
  const hasSolarLaser = inventory.includes('solar_laser');
  const hasMangroveShield = inventory.includes('mangrove_shield');
  const hasGreenDash = inventory.includes('green_dash');
  const hasGlacierCannon = inventory.includes('glacier_cannon');

  // Input states
  const keysRef = useRef<{ [key: string]: boolean }>({
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    KeyA: false,
    KeyD: false,
    KeyW: false,
    Space: false,
    KeyZ: false,
    KeyJ: false,
  });

  // Game internal state refs
  const isBossLevel = stage % 5 === 0;
  // Compact, fast and accessible stage distance (~1100px so students clear in 25-35s smoothly)
  const stageTargetDistance = isBossLevel ? 950 : 1100 + Math.min(stage * 20, 300);

  const gameStateRef = useRef({
    player: {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      width: 32,
      height: 44,
      onGround: false,
      facingRight: true,
      canDoubleJump: true,
      jumpCount: 0,
      submergedTime: 0,
      invulnerableTime: 0,
    },
    cameraX: 0,
    waterLevel: 60, // pixel height from canvas bottom
    obstacles: [] as Obstacle[],
    items: [] as Item[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    plantedTrees: [] as PlantedTree[],
    droneAnimation: {
      active: false,
      x: 0,
      y: 0,
      targetY: 0,
    },
    boss: {
      active: isBossLevel,
      x: 750,
      y: 240,
      width: 75,
      height: 100,
      hp: 3, // Accessible 3-hit boss
      maxHp: 3,
      direction: -1,
      lastAttackTime: 0,
    } as Boss,
    platforms: [
      { x: 0, y: 440, width: 3000, height: 60 }, // Continuous main pier
      { x: 260, y: 350, width: 140, height: 20 },
      { x: 460, y: 300, width: 150, height: 20 },
      { x: 680, y: 340, width: 150, height: 20 },
      { x: 890, y: 290, width: 160, height: 20 },
      { x: 1100, y: 330, width: 160, height: 20 },
      { x: 1300, y: 280, width: 180, height: 20 },
    ],
    nextSpawnX: 250,
    score: score,
    coins: coins,
    gameOverTriggered: false,
    levelClearTriggered: false,
    animFrameId: 0,
    wavePhase: 0,
  });

  // Sound mute sync
  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setIsMuted(!sounds.enabled);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Shoot on Z or J
      if (e.code === 'KeyZ' || e.code === 'KeyJ') {
        shootProjectile();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Shoot projectile helper
  const shootProjectile = useCallback(() => {
    const s = gameStateRef.current;
    if (s.gameOverTriggered || s.levelClearTriggered) return;

    sounds.playShoot();
    const dir = s.player.facingRight ? 1 : -1;
    s.projectiles.push({
      x: s.player.x + (s.player.facingRight ? s.player.width + 4 : -8),
      y: s.player.y + s.player.height * 0.45,
      vx: dir * (hasSolarLaser ? 16 : 12),
      vy: 0,
      radius: hasSolarLaser ? 8 : 6,
      type: hasSolarLaser ? 'laser' : 'seed',
      isPlayer: true,
    });
  }, [hasSolarLaser]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset loop state
    const s = gameStateRef.current;
    s.score = score;
    s.coins = coins;
    s.gameOverTriggered = false;
    s.levelClearTriggered = false;
    s.waterLevel = 60; // Safe initial water level

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      update(dt);
      render(ctx);

      if (!s.gameOverTriggered && !s.levelClearTriggered) {
        s.animFrameId = requestAnimationFrame(loop);
      }
    };

    // Trigger Eco-Rescue Drone
    const triggerEcoRescue = () => {
      const p = s.player;
      p.y = 350; // Lift above water
      p.vy = -350;
      p.submergedTime = 0;
      p.invulnerableTime = 3.5; // Golden invulnerability
      s.waterLevel = Math.max(40, s.waterLevel - 60);
      s.score += 200;
      setCurrentScore(s.score);
      setWaterHeightPercent(Math.round((s.waterLevel / 480) * 100));

      setRescueMessage('🚁 에코 구조 드론 가동! (안전 지대로 복귀)');
      setTimeout(() => setRescueMessage(''), 2500);

      // Celebration rescue particles
      for (let k = 0; k < 18; k++) {
        s.particles.push({
          x: p.x + (Math.random() - 0.5) * 40,
          y: p.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 180,
          vy: -60 - Math.random() * 100,
          color: '#34d399',
          size: 4 + Math.random() * 3,
          life: 0.8,
          maxLife: 0.8,
        });
      }
    };

    // Update Physics and Logic
    const update = (dt: number) => {
      const p = s.player;
      s.wavePhase += dt * 3;

      // 1. Controls
      const isLeft = keysRef.current.ArrowLeft || keysRef.current.KeyA;
      const isRight = keysRef.current.ArrowRight || keysRef.current.KeyD;
      const isJump = keysRef.current.ArrowUp || keysRef.current.KeyW || keysRef.current.Space;

      const speed = 280 + (hasGreenDash ? 60 : 0);
      if (isLeft) {
        p.vx = -speed;
        p.facingRight = false;
      } else if (isRight) {
        p.vx = speed;
        p.facingRight = true;
      } else {
        p.vx *= 0.82;
        if (Math.abs(p.vx) < 5) p.vx = 0;
      }

      // High, responsive jump + Built-in Double Jump for ALL students!
      if (isJump) {
        if (p.onGround) {
          p.vy = -560;
          p.onGround = false;
          p.jumpCount = 1;
          sounds.playJump();
          addPuff(p.x + p.width / 2, p.y + p.height, '#10b981');
        } else if (p.jumpCount === 1) {
          // Double jump
          p.vy = -500;
          p.jumpCount = 2;
          sounds.playJump();
          addPuff(p.x + p.width / 2, p.y + p.height, '#38bdf8');
        }
      }

      // Gravity & Physics
      p.vy += 1200 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Boundary minimum x
      if (p.x < 10) p.x = 10;

      // Platform collision
      p.onGround = false;
      const platforms = s.platforms;
      for (const plat of platforms) {
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.width &&
          p.y + p.height >= plat.y &&
          p.y + p.height - p.vy * dt <= plat.y + 14
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.onGround = true;
          p.jumpCount = 0;
          break;
        }
      }

      // Camera follows player
      s.cameraX = Math.max(0, p.x - 220);

      // Invulnerability tick
      if (p.invulnerableTime > 0) {
        p.invulnerableTime -= dt;
      }

      // 2. Procedural Spawning
      if (p.x + 800 > s.nextSpawnX && s.nextSpawnX < stageTargetDistance - 150) {
        spawnWorldElement(s.nextSpawnX);
        s.nextSpawnX += 200 + Math.random() * 120;
      }

      // 3. Water Submersion & Buoyancy System
      const canvasH = 480;
      const waterTopY = canvasH - s.waterLevel;

      // Buoyancy: If player touches water, they float upward easily and can swim out
      if (p.y + p.height >= waterTopY) {
        // Natural upward buoyancy force
        p.vy -= 900 * dt;
        if (isJump) {
          p.vy = -520; // Swim leap out of water
        }

        // Submersion check
        if (p.y + 10 >= waterTopY) {
          p.submergedTime += dt;

          // Oxygen warning bubbles
          if (Math.random() < 0.25) {
            s.particles.push({
              x: p.x + Math.random() * p.width,
              y: p.y + p.height * 0.5,
              vx: (Math.random() - 0.5) * 30,
              vy: -40 - Math.random() * 30,
              color: '#67e8f9',
              size: 3 + Math.random() * 3,
              life: 0.7,
              maxLife: 0.7,
            });
          }

          // If submerged over 4.5 seconds, trigger Eco Drone Rescue!
          if (p.submergedTime > 4.5) {
            triggerEcoRescue();
          }
        } else {
          p.submergedTime = Math.max(0, p.submergedTime - dt * 2);
        }
      } else {
        p.submergedTime = Math.max(0, p.submergedTime - dt * 3);
      }

      // 4. Update Obstacles
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x += obs.vx * dt;

        // Smoke particles
        if (Math.random() < 0.15) {
          s.particles.push({
            x: obs.x + (obs.vx < 0 ? obs.width : 0),
            y: obs.y + 10,
            vx: -obs.vx * 0.2 + (Math.random() - 0.5) * 15,
            vy: -25 - Math.random() * 15,
            color: '#64748b',
            size: 3 + Math.random() * 3,
            life: 0.7,
            maxLife: 0.7,
          });
        }

        // Collision with Player (Forgiving: minimal water rise and 2.5s invulnerability)
        if (
          p.invulnerableTime <= 0 &&
          p.x < obs.x + obs.width - 6 &&
          p.x + p.width > obs.x + 6 &&
          p.y < obs.y + obs.height - 4 &&
          p.y + p.height > obs.y + 4
        ) {
          sounds.playHit();
          p.invulnerableTime = 2.5; // Long invulnerability window
          p.vy = -320;
          p.vx = obs.vx > 0 ? 160 : -160;

          // Water rises only slightly
          const waterIncrease = hasMangroveShield ? 4 : 8;
          s.waterLevel = Math.min(260, s.waterLevel + waterIncrease);
          setWaterHeightPercent(Math.round((s.waterLevel / 480) * 100));

          for (let k = 0; k < 8; k++) {
            s.particles.push({
              x: p.x + p.width / 2,
              y: p.y + p.height / 2,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              color: '#fbbf24',
              size: 3,
              life: 0.5,
              maxLife: 0.5,
            });
          }
        }

        // Cleanup offscreen obstacles
        if (obs.x < s.cameraX - 400 || obs.x > s.cameraX + 1600) {
          s.obstacles.splice(i, 1);
        }
      }

      // 5. Update Items (Plentiful Seeds, Mangroves, Coins)
      for (let i = s.items.length - 1; i >= 0; i--) {
        const item = s.items[i];
        if (item.collected) {
          s.items.splice(i, 1);
          continue;
        }

        if (
          p.x < item.x + item.width + 6 &&
          p.x + p.width > item.x - 6 &&
          p.y < item.y + item.height + 6 &&
          p.y + p.height > item.y - 6
        ) {
          item.collected = true;
          sounds.playSeed();

          if (item.type === 'seed') {
            s.score += 200;
            // Planting tree lowers sea level!
            s.waterLevel = Math.max(40, s.waterLevel - 35);
            s.plantedTrees.push({ x: item.x, y: 440, growth: 0 });
            addPuff(item.x, item.y, '#10b981');
          } else if (item.type === 'mangrove') {
            s.score += 350;
            s.waterLevel = Math.max(30, s.waterLevel - 55);
            s.plantedTrees.push({ x: item.x, y: 440, growth: 0 });
            addPuff(item.x, item.y, '#059669');
          } else if (item.type === 'coin') {
            s.coins += 1;
            s.score += 100;
            setCurrentCoins(s.coins);
            addPuff(item.x, item.y, '#fbbf24');
          }

          setCurrentScore(s.score);
          setWaterHeightPercent(Math.round((s.waterLevel / 480) * 100));
        }
      }

      // 6. Update Projectiles
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const proj = s.projectiles[i];
        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        // Check collision with obstacles (purify in 1 hit!)
        for (let j = s.obstacles.length - 1; j >= 0; j--) {
          const obs = s.obstacles[j];
          if (
            proj.x + proj.radius > obs.x &&
            proj.x - proj.radius < obs.x + obs.width &&
            proj.y + proj.radius > obs.y &&
            proj.y - proj.radius < obs.y + obs.height
          ) {
            s.obstacles.splice(j, 1);
            s.score += 150;
            s.waterLevel = Math.max(40, s.waterLevel - 15);
            setCurrentScore(s.score);
            setWaterHeightPercent(Math.round((s.waterLevel / 480) * 100));
            addPuff(obs.x + obs.width / 2, obs.y + obs.height / 2, '#34d399');
            if (proj.type !== 'laser') {
              s.projectiles.splice(i, 1);
            }
            break;
          }
        }

        // Check collision with Boss
        if (s.boss.active && proj.isPlayer) {
          const b = s.boss;
          if (
            proj.x + proj.radius > b.x &&
            proj.x - proj.radius < b.x + b.width &&
            proj.y + proj.radius > b.y &&
            proj.y - proj.radius < b.y + b.height
          ) {
            b.hp -= 1;
            setBossHp(Math.max(0, b.hp));
            sounds.playHit();
            addPuff(proj.x, proj.y, '#38bdf8');
            s.projectiles.splice(i, 1);

            if (b.hp <= 0) {
              b.active = false;
              s.score += 2000;
              s.coins += 15;
              s.waterLevel = 40;
              setCurrentScore(s.score);
              setCurrentCoins(s.coins);
              setWaterHeightPercent(10);
              sounds.playClear();
              if (onBossDefeated) onBossDefeated();
              for (let k = 0; k < 6; k++) {
                s.plantedTrees.push({ x: b.x + k * 28, y: 440, growth: 0 });
              }
            }
            continue;
          }
        }

        // Cleanup
        if (proj.x < s.cameraX - 100 || proj.x > s.cameraX + 900) {
          s.projectiles.splice(i, 1);
        }
      }

      // 7. Update Boss Behavior (Gentle, easily defeated)
      if (s.boss.active) {
        const b = s.boss;
        b.x += b.direction * 35 * dt;
        if (b.x > stageTargetDistance - 60) b.direction = -1;
        if (b.x < stageTargetDistance - 350) b.direction = 1;

        b.lastAttackTime += dt;
        if (b.lastAttackTime > 3.0) {
          b.lastAttackTime = 0;
          const angle = Math.atan2(p.y - b.y, p.x - b.x);
          s.projectiles.push({
            x: b.x + b.width / 2,
            y: b.y + b.height * 0.4,
            vx: Math.cos(angle) * 120, // slow projectile
            vy: Math.sin(angle) * 120,
            radius: 7,
            type: 'seed',
            isPlayer: false,
          });
        }
      }

      // Boss projectile vs Player
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const proj = s.projectiles[i];
        if (!proj.isPlayer) {
          if (
            p.invulnerableTime <= 0 &&
            proj.x > p.x &&
            proj.x < p.x + p.width &&
            proj.y > p.y &&
            proj.y < p.y + p.height
          ) {
            sounds.playHit();
            p.invulnerableTime = 2.0;
            s.waterLevel = Math.min(240, s.waterLevel + 10);
            setWaterHeightPercent(Math.round((s.waterLevel / 480) * 100));
            s.projectiles.splice(i, 1);
          }
        }
      }

      // 8. Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // 9. Update Planted Trees
      for (const tree of s.plantedTrees) {
        if (tree.growth < 1) tree.growth = Math.min(1, tree.growth + dt * 1.5);
      }

      // 10. Check Stage Clear
      if (!isBossLevel && p.x >= stageTargetDistance && !s.levelClearTriggered) {
        s.levelClearTriggered = true;
        sounds.playClear();
        onLevelComplete(s.score + 600, s.coins + 5);
        return;
      }

      if (isBossLevel && !s.boss.active && p.x >= stageTargetDistance - 150 && !s.levelClearTriggered) {
        s.levelClearTriggered = true;
        sounds.playClear();
        onLevelComplete(s.score + 1500, s.coins + 10);
        return;
      }
    };

    // Spawn elements
    const spawnWorldElement = (x: number) => {
      const rand = Math.random();
      if (rand < 0.35) {
        // Obstacle (자가용, 탄소공장, 석탄화력, 플라스틱)
        const types: Array<'car' | 'factory' | 'coal' | 'plastic'> = ['car', 'factory', 'coal', 'plastic'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        const speed = -25 - Math.random() * 30;

        s.obstacles.push({
          id: Date.now() + Math.random(),
          x,
          y: chosen === 'car' ? 408 : chosen === 'plastic' ? 400 : 375,
          width: chosen === 'car' ? 48 : chosen === 'factory' ? 44 : 36,
          height: chosen === 'car' ? 32 : chosen === 'factory' ? 65 : 40,
          vx: chosen === 'car' ? speed : 0,
          type: chosen,
          name: chosen === 'car' ? '자가용' : chosen === 'factory' ? '탄소공장' : chosen === 'coal' ? '석탄화력' : '플라스틱',
        });
      } else if (rand < 0.75) {
        // Beneficial Seed or Mangrove
        const isMangrove = Math.random() < 0.35;
        s.items.push({
          id: Date.now() + Math.random(),
          x,
          y: 390 - (Math.random() > 0.5 ? 80 : 0),
          width: 26,
          height: 26,
          type: isMangrove ? 'mangrove' : 'seed',
          collected: false,
        });
      } else {
        // Eco Coin
        s.items.push({
          id: Date.now() + Math.random(),
          x,
          y: 370 - (Math.random() > 0.4 ? 70 : 0),
          width: 22,
          height: 22,
          type: 'coin',
          collected: false,
        });
      }
    };

    const addPuff = (x: number, y: number, color: string) => {
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 100,
          vy: -20 - Math.random() * 50,
          color,
          size: 3 + Math.random() * 3,
          life: 0.5,
          maxLife: 0.5,
        });
      }
    };

    // Render Canvas
    const render = (ctx: CanvasRenderingContext2D) => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;

      // 1. Sky & Ocean Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#0a192f');
      skyGrad.addColorStop(0.5, '#1e293b');
      skyGrad.addColorStop(1, '#0e7490');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(100 - (s.cameraX * 0.1) % W, 40, 160, 30);
      ctx.fillRect(450 - (s.cameraX * 0.15) % W, 70, 190, 35);
      ctx.fillRect(800 - (s.cameraX * 0.12) % W, 50, 170, 28);

      ctx.save();
      ctx.translate(-s.cameraX, 0);

      // 2. Platforms & Pier
      for (const plat of s.platforms) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Platform top grass border
        ctx.fillStyle = '#10b981';
        ctx.fillRect(plat.x, plat.y, plat.width, 5);

        // Pilings
        ctx.fillStyle = '#1e293b';
        for (let px = plat.x; px < plat.x + plat.width; px += 40) {
          ctx.fillRect(px, plat.y + 5, 8, plat.height - 5);
        }
      }

      // 3. Planted Trees
      for (const tree of s.plantedTrees) {
        const h = 48 * tree.growth;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(tree.x - 3, tree.y - h * 0.4, 6, h * 0.4);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(tree.x, tree.y - h * 0.7, 18 * tree.growth, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(tree.x - 4, tree.y - h * 0.75, 12 * tree.growth, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Obstacles
      for (const obs of s.obstacles) {
        if (obs.type === 'car') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(obs.x + 4, obs.y + 10, obs.width - 8, obs.height - 10);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(obs.x + 10, obs.y, obs.width - 20, 12);
          ctx.fillStyle = '#93c5fd';
          ctx.fillRect(obs.x + 14, obs.y + 2, 8, 7);
          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.arc(obs.x + 10, obs.y + obs.height - 3, 5, 0, Math.PI * 2);
          ctx.arc(obs.x + obs.width - 10, obs.y + obs.height - 3, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fca5a5';
          ctx.font = '10px DungGeunMo';
          ctx.fillText('자가용', obs.x + 6, obs.y - 6);
        } else if (obs.type === 'factory') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(obs.x, obs.y + 20, obs.width, obs.height - 20);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(obs.x + 8, obs.y, 12, 20);
          ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
          ctx.beginPath();
          ctx.arc(obs.x + 14, obs.y - 6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '10px DungGeunMo';
          ctx.fillText('탄소공장', obs.x, obs.y - 12);
        } else if (obs.type === 'coal') {
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(obs.x + 4, obs.y + 8, obs.width - 8, 8);
          ctx.fillStyle = '#fdba74';
          ctx.font = '10px DungGeunMo';
          ctx.fillText('석탄화력', obs.x, obs.y - 6);
        } else {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(obs.x, obs.y + 6, obs.width, obs.height - 6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(obs.x + 6, obs.y, 10, 6);
          ctx.fillStyle = '#e0f2fe';
          ctx.font = '10px DungGeunMo';
          ctx.fillText('폐플라스틱', obs.x - 4, obs.y - 6);
        }
      }

      // 5. Items
      for (const item of s.items) {
        if (item.collected) continue;
        const bob = Math.sin(s.wavePhase * 2 + item.x) * 4;

        if (item.type === 'seed') {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(item.x + 13, item.y + 13 + bob, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#86efac';
          ctx.fillRect(item.x + 11, item.y + 4 + bob, 4, 8);
          ctx.fillStyle = '#86efac';
          ctx.font = '9px DungGeunMo';
          ctx.fillText('씨앗', item.x + 4, item.y - 4 + bob);
        } else if (item.type === 'mangrove') {
          ctx.fillStyle = '#059669';
          ctx.fillRect(item.x + 3, item.y + 5 + bob, 20, 20);
          ctx.fillStyle = '#6ee7b7';
          ctx.font = '9px DungGeunMo';
          ctx.fillText('맹그로브', item.x - 2, item.y - 4 + bob);
        } else if (item.type === 'coin') {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(item.x + 11, item.y + 11 + bob, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.font = '10px DungGeunMo';
          ctx.fillText('★', item.x + 7, item.y + 15 + bob);
        }
      }

      // 6. Projectiles
      for (const proj of s.projectiles) {
        if (proj.type === 'laser') {
          ctx.fillStyle = '#fde047';
          ctx.fillRect(proj.x - 14, proj.y - 3, 28, 6);
        } else if (proj.isPlayer) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Boss
      if (s.boss.active) {
        const b = s.boss;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(b.x + 10, b.y + 25, b.width - 20, b.height - 25);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(b.x + 16, b.y, b.width - 32, 25);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(b.x + 22, b.y + 8, 6, 6);
        ctx.fillRect(b.x + b.width - 28, b.y + 8, 6, 6);

        // HP Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(b.x - 10, b.y - 25, b.width + 20, 8);
        const hpPct = b.hp / b.maxHp;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(b.x - 8, b.y - 23, (b.width + 16) * hpPct, 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px DungGeunMo';
        ctx.fillText(`빙하거인 (체력: ${b.hp}/${b.maxHp})`, b.x - 6, b.y - 29);
      }

      // 8. Goal
      const goalX = stageTargetDistance;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(goalX, 260, 36, 180);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(goalX, 300, 36, 25);
      ctx.fillRect(goalX, 360, 36, 25);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(goalX + 5, 235, 26, 25);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
      ctx.beginPath();
      ctx.moveTo(goalX + 18, 247);
      ctx.lineTo(goalX + 320, 160);
      ctx.lineTo(goalX + 320, 330);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.font = '12px DungGeunMo';
      ctx.fillText('🏁 기후 등대 (클리어 지점)', goalX - 25, 220);

      // 9. Player
      const p = s.player;
      if (p.invulnerableTime <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (!p.facingRight) {
          ctx.scale(-1, 1);
          ctx.translate(-p.width, 0);
        }

        // Green Cap with Sprout Leaf
        ctx.fillStyle = '#10b981';
        ctx.fillRect(4, 2, 24, 12);
        ctx.fillRect(16, 8, 12, 6);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(12, -4, 3, 6);
        ctx.fillRect(15, -6, 6, 4);

        // Face & Eyes
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(8, 14, 16, 12);
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(18, 16, 4, 4);

        // Cape
        const capeWave = Math.sin(s.wavePhase * 4) * 4;
        ctx.fillStyle = '#059669';
        ctx.fillRect(-2, 18, 6, 18 + capeWave);

        // Body / Overalls
        ctx.fillStyle = '#065f46';
        ctx.fillRect(6, 26, 20, 12);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(10, 28, 3, 3);
        ctx.fillRect(18, 28, 3, 3);

        // Boots
        const walkCycle = p.vx !== 0 ? Math.sin(Date.now() * 0.015) * 4 : 0;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 38 + walkCycle, 8, 6);
        ctx.fillRect(18, 38 - walkCycle, 8, 6);

        // Shield aura if invulnerable
        if (p.invulnerableTime > 0) {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.strokeRect(-6, -8, p.width + 12, p.height + 16);
        }

        ctx.restore();
      }

      // 10. Particles
      for (const pt of s.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore(); // restore camera

      // 11. Ocean Water (Foreground)
      const waterTop = H - s.waterLevel;
      ctx.fillStyle = 'rgba(14, 116, 144, 0.72)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, waterTop);

      for (let x = 0; x <= W; x += 15) {
        const wave = Math.sin((x + s.cameraX) * 0.02 + s.wavePhase) * 5;
        ctx.lineTo(x, waterTop + wave);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Wave crest line
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 15) {
        const wave = Math.sin((x + s.cameraX) * 0.02 + s.wavePhase) * 5;
        if (x === 0) ctx.moveTo(x, waterTop + wave);
        else ctx.lineTo(x, waterTop + wave);
      }
      ctx.stroke();

      // In-water breath alert if submerged
      if (s.player.submergedTime > 0.5) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 15px DungGeunMo';
        ctx.textAlign = 'center';
        ctx.fillText('💡 바닷물 속입니다! 점프(↑ 또는 스페이스)로 헤엄쳐 올라가세요!', W / 2, 65);
        ctx.font = '11px DungGeunMo';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('위험 시 에코 구조 드론이 즉시 안전 지대로 인양해 드립니다.', W / 2, 85);
        ctx.textAlign = 'left';
      }
    };

    s.animFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.animFrameId);
    };
  }, [stage, hasSolarLaser, hasMangroveShield, hasGreenDash, hasGlacierCannon, onGameOver, onLevelComplete, onBossDefeated, stageTargetDistance]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Pass-Assurance Banner */}
      <div className="w-full bg-emerald-950/80 border-2 border-emerald-500/50 border-b-0 rounded-t-2xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold font-['DungGeunMo']">
            학생 안심 통과 모드 적용 중
          </span>
          <span className="text-[11px] text-emerald-400/80 hidden sm:inline">
            (2단 점프 기본 제공 · 부력 수영 · 에코 구조 드론 보호)
          </span>
        </div>
        {rescueMessage && (
          <span className="text-amber-300 font-bold font-['DungGeunMo'] animate-bounce">
            {rescueMessage}
          </span>
        )}
      </div>

      {/* HUD Bar */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-['DungGeunMo']">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold">
            <span>🚩 STAGE {stage}</span>
            {isBossLevel && (
              <span className="text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 animate-pulse">
                BOSS
              </span>
            )}
          </div>
          <div className="text-amber-300 font-mono font-bold">
            점수: {currentScore.toLocaleString()}
          </div>
          <div className="text-yellow-400 font-mono font-bold flex items-center gap-1">
            <span>🪙</span> {currentCoins}
          </div>
        </div>

        {/* Ocean Water Level Meter */}
        <div className="flex items-center gap-2">
          <Waves className={`w-4 h-4 ${waterHeightPercent > 50 ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
          <span className="text-slate-300 text-xs">해수면:</span>
          <div className="w-24 sm:w-32 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${
                waterHeightPercent > 50
                  ? 'bg-rose-500'
                  : waterHeightPercent > 35
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, waterHeightPercent)}%` }}
            />
          </div>
          <span className={`text-xs font-mono font-bold ${waterHeightPercent > 50 ? 'text-rose-400' : 'text-cyan-300'}`}>
            {waterHeightPercent}%
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title={isMuted ? '소리 켜기' : '소리 끄기'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] max-h-[500px] bg-slate-950 border-x-2 border-b-2 border-slate-800 overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={854}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* In-game Floating Controls Hint */}
        <div className="absolute top-2 left-2 pointer-events-none text-[10px] sm:text-xs text-slate-300/90 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-2 font-mono">
          <span>이동: [←][→] 또는 [A][D]</span>
          <span>점프: [↑] 또는 [스페이스] (2단 점프 가능)</span>
          <span>씨앗발사: [Z] 또는 [J]</span>
        </div>
      </div>

      {/* Desktop / Touch Action Bar */}
      <div className="w-full bg-slate-900 border-2 border-t-0 border-slate-800 rounded-b-2xl p-3 flex items-center justify-between">
        {/* Left / Right */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => (keysRef.current.ArrowLeft = true)}
            onTouchEnd={() => (keysRef.current.ArrowLeft = false)}
            onMouseDown={() => (keysRef.current.ArrowLeft = true)}
            onMouseUp={() => (keysRef.current.ArrowLeft = false)}
            className="w-13 h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center text-slate-200 border border-slate-700 shadow-md active:scale-95 transition cursor-pointer"
            aria-label="왼쪽 이동"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => (keysRef.current.ArrowRight = true)}
            onTouchEnd={() => (keysRef.current.ArrowRight = false)}
            onMouseDown={() => (keysRef.current.ArrowRight = true)}
            onMouseUp={() => (keysRef.current.ArrowRight = false)}
            className="w-13 h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center text-slate-200 border border-slate-700 shadow-md active:scale-95 transition cursor-pointer"
            aria-label="오른쪽 이동"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons: Jump & Shoot */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={shootProjectile}
            className="px-4 h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-xl flex items-center justify-center text-white border border-emerald-400 shadow-md font-['DungGeunMo'] text-xs active:scale-95 gap-1.5 transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>씨앗 발사 [Z]</span>
          </button>
          <button
            onTouchStart={() => (keysRef.current.Space = true)}
            onTouchEnd={() => (keysRef.current.Space = false)}
            onMouseDown={() => (keysRef.current.Space = true)}
            onMouseUp={() => (keysRef.current.Space = false)}
            className="px-5 h-12 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 rounded-xl flex items-center justify-center text-white border border-cyan-400 shadow-md text-sm font-['DungGeunMo'] active:scale-95 gap-1.5 transition cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
            <span>점프</span>
          </button>
        </div>
      </div>
    </div>
  );
};
