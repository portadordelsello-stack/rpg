import { TILE_SIZE } from './Constants';

export class NPC {
  x: number;
  y: number;
  dialog: string;
  name: string;
  color: string;

  constructor(x: number, y: number, name: string, dialog: string, color: string) {
    this.x = x * TILE_SIZE + TILE_SIZE / 2;
    this.y = y * TILE_SIZE + TILE_SIZE / 2;
    this.name = name;
    this.dialog = dialog;
    this.color = color;
  }

  isPlayerNear(playerX: number, playerY: number): boolean {
    const dist = Math.sqrt(Math.pow(this.x - playerX, 2) + Math.pow(this.y - playerY, 2));
    return dist < 80; // interact distance
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number, showPrompt: boolean) {
    const width = 32;
    const height = 32;
    const drawX = Math.floor(this.x - camX - width / 2);
    const drawY = Math.floor(this.y - camY - height / 2);

    ctx.fillStyle = this.color;
    ctx.fillRect(drawX, drawY, width, height);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(drawX, drawY + height, width, 8);

    if (showPrompt) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] Talk', drawX + width/2, drawY - 10);
    }
  }
}
