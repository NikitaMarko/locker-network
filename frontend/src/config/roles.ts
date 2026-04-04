export const ROLES = {
    USER: 'USER',
    OPERATOR: 'OPERATOR',
    ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
    USER: 'Пользователь',
    OPERATOR: 'Оператор',
    ADMIN: 'Администратор',
};
