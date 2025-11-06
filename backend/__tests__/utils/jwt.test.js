const { generateToken, generateRefreshToken, verifyToken, decodeToken } = require('../../src/utils/jwt');

describe('JWT Utilities', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'admin'
  };

  describe('generateToken', () => {
    it('should generate a valid access token', () => {
      const token = generateToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should include payload in token', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should generate tokens with proper structure', () => {
      const token = generateToken(testPayload);
      const parts = token.split('.');
      expect(parts.length).toBe(3);
      // Each part should be a non-empty string
      expect(parts.every(part => part.length > 0)).toBe(true);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should include payload in refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = decodeToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload);
      const verified = verifyToken(token);
      expect(verified).toBeDefined();
      expect(verified.userId).toBe(testPayload.userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', async () => {
      const expiredToken = generateToken(testPayload, '0s');
      // Wait to ensure token expires
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token');
      expect(decoded).toBeNull();
    });

    it('should work without verification (does not check expiration)', () => {
      const expiredToken = generateToken(testPayload, '0s');
      // Decode should work even if expired (no verification)
      const decoded = decodeToken(expiredToken);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
    });
  });
});
