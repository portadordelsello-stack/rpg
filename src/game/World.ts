import { TileType } from '../types';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from './Constants';

export class World {
  map: TileType[][] = [];
  treeImage: HTMLImageElement;

  constructor() {
    this.treeImage = new Image();
    this.treeImage.src = '/village.png';
    this.generateMap();
  }

  generateMap() {
    // Generate a simple map with biomes
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      let row: TileType[] = [];
      for (let x = 0; x < WORLD_WIDTH; x++) {
        // Increase safe bounds and lower the water boundary to make an actual world
        const noise = Math.sin(x * 0.1) + Math.cos(y * 0.1);
        
        // Guarantee safe spawn areas
        if ((x >= 2 && x <= 14 && y >= 2 && y <= 10) || (x >= 40 && x <= 60 && y >= 40 && y <= 60)) {
          row.push(TileType.Grass);
        } else if (x < 2 || x > WORLD_WIDTH - 3 || y < 2 || y > WORLD_HEIGHT - 3) {
            row.push(TileType.Water); // Outer boundary
        } else if (noise < -0.6) {
          row.push(TileType.Water);
        } else if (noise > 1.2) {
          row.push(TileType.Tree);
        } else if (noise > 0 && noise < 0.5) {
          row.push(TileType.Dirt);
        } else {
          row.push(TileType.Grass);
        }
      }
      this.map.push(row);
    }
  }

  getTileAt(px: number, py: number): TileType | null {
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) {
      return null;
    }
    return this.map[ty][tx];
  }

  isSolid(px: number, py: number): boolean {
    const tile = this.getTileAt(px, py);
    return tile === TileType.Water || tile === TileType.Tree || tile === null;
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number, screenWidth: number, screenHeight: number) {
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + (screenWidth / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + (screenHeight / TILE_SIZE) + 1;

    for (let y = Math.max(0, startRow); y <= Math.min(WORLD_HEIGHT - 1, endRow); y++) {
      for (let x = Math.max(0, startCol); x <= Math.min(WORLD_WIDTH - 1, endCol); x++) {
        const tile = this.map[y][x];
        let color = '#000';
        
        switch(tile) {
          case TileType.Grass: 
            color = (x + y) % 7 === 0 ? '#3f6212' : '#4d7c0f'; 
            break;
          case TileType.Dirt: color = '#451a03'; break; 
          case TileType.Water: color = '#1e3a8a'; break; 
          case TileType.Tree: color = '#4d7c0f'; break; // Draw grass underneath trees
        }
        
        const drawX = Math.floor(x * TILE_SIZE - camX);
        const drawY = Math.floor(y * TILE_SIZE - camY);

        ctx.fillStyle = color;
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        
        // Tile Grid/Border for detail
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        
        // simple detail
        if (tile === TileType.Tree) {
            if (this.treeImage.complete && this.treeImage.naturalWidth > 0) {
              const dw = TILE_SIZE * 1.5;
              const dh = TILE_SIZE * 1.5 * (this.treeImage.naturalHeight / this.treeImage.naturalWidth);
              const dx = drawX + (TILE_SIZE - dw) / 2;
              const dy = drawY + TILE_SIZE - dh; // Bottom aligned
              ctx.drawImage(this.treeImage, dx, dy, dw, dh);
            } else {
              // Fallback
              ctx.fillStyle = '#064e3b';
              ctx.beginPath();
              ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE/2 - 4, 0, Math.PI * 2);
              ctx.fill();
            }
        } else if (tile === TileType.Water) {
             ctx.fillStyle = 'rgba(255,255,255,0.1)'; // subtle wave
             ctx.fillRect(drawX + 10, drawY + 10, TILE_SIZE - 20, 4);
        }
      }
    }
  }
}
