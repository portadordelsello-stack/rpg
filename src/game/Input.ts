export class InputManager {
  keys: { [key: string]: boolean } = {};
  justPressed: { [key: string]: boolean } = {};

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!this.keys[e.key.toLowerCase()]) {
      this.justPressed[e.key.toLowerCase()] = true;
    }
    this.keys[e.key.toLowerCase()] = true;
  };

  onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  isKeyDown(key: string) {
    return this.keys[key.toLowerCase()] || false;
  }

  isKeyJustPressed(key: string) {
    if (this.justPressed[key.toLowerCase()]) {
      this.justPressed[key.toLowerCase()] = false; // consume it
      return true;
    }
    return false;
  }

  update() {
    // Clear justPressed for the next frame is handled manually where consumed,
    // or we can clear them here at the end of the frame.
    // For simplicity, we consume on check above.
  }

  cleanup() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
