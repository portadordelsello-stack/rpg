export type Vector2 = { x: number; y: number };

export enum TileType {
  Grass = 0,
  Dirt = 1,
  Water = 2,
  Tree = 3,
}

export type PlayerData = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
};
