import { http } from './httpClient';

export async function getUsers() {
    const res = await http.get('/users');
    return res.data;
}

export async function updateUserRole(id: string, role: string) {
    const res = await http.patch(`/users/${id}/role`, { role });
    return res.data;
}

export async function blockUser(id: string) {
    const res = await http.post(`/users/${id}/block`);
    return res.data;
}

export async function unblockUser(id: string) {
    const res = await http.post(`/users/${id}/unblock`);
    return res.data;
}

export async function deleteUser(id: string) {
    const res = await http.delete(`/users/${id}`);
    return res.data;
}
