import { http } from './httpClient';

export async function getErrors() {
    const res = await http.get('/errors');
    return res.data;
}

export async function resolveError(id: string) {
    const res = await http.post(`/errors/${id}/resolve`);
    return res.data;
}
