import { World } from './World';
import { Player } from './Player';
import { Camera } from './Camera';
import { InputManager } from './Input';
import { NPC } from './NPC';
import { WORLD_WIDTH, WORLD_HEIGHT } from './Constants';

export class Game {
  world: World;
  player: Player;
  camera: Camera;
  input: InputManager;
  npcs: NPC[];
  
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  lastTime: number = 0;
  animationFrameId: number = 0;
  
  onInteract: (npc: NPC | null) => void;

  constructor(canvas: HTMLCanvasElement, onInteract: (npc: NPC | null) => void, playerData: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    // Enable crisp pixels
    this.ctx.imageSmoothingEnabled = false;
    
    this.onInteract = onInteract;
    
    this.world = new World();
    this.player = new Player(playerData);
    this.camera = new Camera();
    this.input = new InputManager();
    
    const centerX = Math.floor(WORLD_WIDTH / 2);
    const centerY = Math.floor(WORLD_HEIGHT / 2);
    this.npcs = [
      new NPC(centerX + 2, centerY, 'Eldrin', 'Greetings traveler. The world is vast and dangerous. Beware the water!', '#f59e0b'), // amber-500
      new NPC(centerX - 2, centerY + 3, 'Grom', 'I lost my favorite pickaxe... Oh well, life goes on.', '#ec4899') // pink-500
    ];
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.screenWidth = width;
    this.camera.screenHeight = height;
    this.ctx.imageSmoothingEnabled = false; // re-apply after resize
  }

  start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.input.cleanup();
  }

  loop = (time: number) => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  update(dt: number) {
    // Limit dt to prevent huge jumps if tab is inactive
    const safeDt = Math.min(dt, 0.1);

    this.player.update(safeDt, this.input, this.world);
    this.camera.update(this.player.x, this.player.y, safeDt);
    
    let interactableNPC: NPC | null = null;
    for (const npc of this.npcs) {
        if (npc.isPlayerNear(this.player.x, this.player.y)) {
            interactableNPC = npc;
            break;
        }
    }

    if (this.input.isKeyJustPressed('e') && interactableNPC) {
        this.onInteract(interactableNPC);
    } else if (this.input.isKeyJustPressed('e')) {
        this.onInteract(null);
    }

    this.input.update();
  }

  draw() {
    // Clear screen
    this.ctx.fillStyle = '#18181b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw world
    this.world.draw(this.ctx, this.camera.x, this.camera.y, this.camera.screenWidth, this.camera.screenHeight);

    // Draw NPCs
    let interactableNPC: NPC | null = null;
    for (const npc of this.npcs) {
        if (npc.isPlayerNear(this.player.x, this.player.y)) {
            interactableNPC = npc;
        }
    }

    for (const npc of this.npcs) {
      npc.draw(this.ctx, this.camera.x, this.camera.y, npc === interactableNPC);
    }

    // Draw player
    this.player.draw(this.ctx, this.camera.x, this.camera.y);
  }
}
