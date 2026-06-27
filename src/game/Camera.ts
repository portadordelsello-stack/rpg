import { WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE } from './Constants';

export class Camera {
  x: number = 0;
  y: number = 0;
  screenWidth: number = 800;
  screenHeight: number = 600;

  update(targetX: number, targetY: number, dt: number) {
    // Smooth follow
    const idealX = targetX - this.screenWidth / 2;
    const idealY = targetY - this.screenHeight / 2;
    
    this.x += (idealX - this.x) * 5 * dt;
    this.y += (idealY - this.y) * 5 * dt;

    // Clamp to world bounds
    const maxX = WORLD_WIDTH * TILE_SIZE - this.screenWidth;
    const maxY = WORLD_HEIGHT * TILE_SIZE - this.screenHeight;

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }
}
