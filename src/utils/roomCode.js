const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

export function isValidRoomCode(code) {
  if (!code || typeof code !== 'string') return false;
  if (code.length !== CODE_LENGTH) return false;
  return code.split('').every((char) => CHARACTERS.includes(char));
}
