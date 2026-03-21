import { http } from './httpClient';

// Получить список всех ячеек (для USER или OPERATOR)
export async function getLockers() {
    const res = await http.get('/lockers');
    return res.data;
}

// Получить статус конкретной ячейки
export async function getLockerById(id: string) {
    const res = await http.get(`/lockers/${id}`);
    return res.data;
}

// Открыть ячейку (оператор)
export async function openLocker(id: string) {
    const res = await http.post(`/lockers/${id}/open`);
    return res.data;
}

// Закрыть ячейку (оператор)
export async function closeLocker(id: string) {
    const res = await http.post(`/lockers/${id}/close`);
    return res.data;
}

// Забронировать ячейку (пользователь)
export async function bookLocker(id: string) {
    const res = await http.post(`/lockers/${id}/book`);
    return res.data;
}

// Освободить ячейку (пользователь)
export async function releaseLocker(id: string) {
    const res = await http.post(`/lockers/${id}/release`);
    return res.data;
}

export const resetLockerError = (id:string ) =>
    http.post(`/lockers/${id}/reset-error`);

