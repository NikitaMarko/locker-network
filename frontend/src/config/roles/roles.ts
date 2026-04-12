export const ROLES = {
    USER: 'USER',
    OPERATOR: 'OPERATOR',
    ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
