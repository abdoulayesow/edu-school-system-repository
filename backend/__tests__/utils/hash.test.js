const { hashPassword, comparePasswords } = require('../../src/utils/hash');

describe('Hash Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should use correct salt rounds', async () => {
      const password = 'testPassword123';
      const saltRounds = 10;
      const hashed = await hashPassword(password, saltRounds);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePasswords(password, hashed);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashed = await hashPassword(password);

      const isMatch = await comparePasswords(wrongPassword, hashed);
      expect(isMatch).toBe(false);
    });

    it('should handle empty strings correctly', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePasswords('', hashed);
      expect(isMatch).toBe(false);
    });
  });
});
