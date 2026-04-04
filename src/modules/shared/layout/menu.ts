// src/modules/shared/layout/menu.ts
import { ROLES } from '../../../config/roles';

export const menuByRole = {
    [ROLES.USER]: [
        { label: 'Главная', path: '/user/dashboard' },
        { label: 'Бронирование', path: '/user/booking' },
    ],

    [ROLES.OPERATOR]: [
        { label: 'Панель оператора', path: '/operator' },
    ],

    [ROLES.ADMIN]: [
        { label: 'Админ панель', path: '/admin' },
        { label: 'Пользователи', path: '/admin/users' },
        { label: 'Ошибки', path: '/admin/errors' },
        // позже можно добавить статистику
    ],
};
