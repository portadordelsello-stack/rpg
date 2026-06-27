import { InputManager } from './Input';
import { World } from './World';
import { PLAYER_SPEED, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from './Constants';
import { PlayerData } from '../types';

export class Player {
  x: number = (WORLD_WIDTH * TILE_SIZE) / 2;
  y: number = (WORLD_HEIGHT * TILE_SIZE) / 2;
  width: number = 32;
  height: number = 32;
  color: string = '#ef4444'; // red-500
  data: PlayerData;

  constructor(playerData: PlayerData) {
    this.data = playerData;
    if (this.data.x) this.x = this.data.x;
    if (this.data.y) this.y = this.data.y;
  }

  update(dt: number, input: InputManager, world: World) {
    let dx = 0;
    let dy = 0;

    if (input.isKeyDown('w') || input.isKeyDown('ArrowUp')) dy -= 1;
    if (input.isKeyDown('s') || input.isKeyDown('ArrowDown')) dy += 1;
    if (input.isKeyDown('a') || input.isKeyDown('ArrowLeft')) dx -= 1;
    if (input.isKeyDown('d') || input.isKeyDown('ArrowRight')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    const nextX = this.x + dx * PLAYER_SPEED * dt;
    const nextY = this.y + dy * PLAYER_SPEED * dt;

    // AABB collision approximation with tiles
    const isSolid = (px: number, py: number) => {
      // Check the 4 corners of the player bounding box
      const halfW = this.width / 2;
      const halfH = this.height / 2;
      return world.isSolid(px - halfW, py - halfH) || 
             world.isSolid(px + halfW, py - halfH) ||
             world.isSolid(px - halfW, py + halfH) || 
             world.isSolid(px + halfW, py + halfH);
    };

    if (!isSolid(nextX, this.y)) {
      this.x = nextX;
      this.data.x = this.x; // sync back to data object
    }
    if (!isSolid(this.x, nextY)) {
      this.y = nextY;
      this.data.y = this.y; // sync back to data object
    }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY);
    
    // Draw body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 16, py - 32, 32, 48); // Body
    
    // Cape/Hat
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(px - 16, py - 32, 32, 12); // Cape/Hat
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(px - 8, py - 18, 4, 4); // Eye L
    ctx.fillRect(px + 4, py - 18, 4, 4); // Eye R
  }
}
