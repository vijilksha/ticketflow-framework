export interface TestUser {
  email: string;
  password: string;
  fullName: string;
}

export const generateTestUser = (): TestUser => {
  const timestamp = Date.now();
  return {
    email: `test${timestamp}@example.com`,
    password: 'Test123456!',
    fullName: 'Test User',
  };
};

export const VALID_CREDENTIALS = {
  email: 'test@example.com',
  password: 'Test123456!',
};

export const INVALID_CREDENTIALS = {
  email: 'invalid@example.com',
  password: 'wrongpassword',
};
