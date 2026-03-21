import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    updateUserRole,
    blockUser,
    unblockUser,
    deleteUser
} from '../../../api/usersApi';

export function UserTable({ users }) {
    const queryClient = useQueryClient();

    const roleMutation = useMutation({
        mutationFn: ({ id, role }) => updateUserRole(id, role),
        onSuccess: () => queryClient.invalidateQueries(['users']),
    });

    const blockMutation = useMutation({
        mutationFn: (id) => blockUser(id),
        onSuccess: () => queryClient.invalidateQueries(['users']),
    });

    const unblockMutation = useMutation({
        mutationFn: (id) => unblockUser(id),
        onSuccess: () => queryClient.invalidateQueries(['users']),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries(['users']),
    });

    return (
        <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
            <thead>
            <tr>
                <th style={cell}>ID</th>
                <th style={cell}>Email</th>
                <th style={cell}>Роль</th>
                <th style={cell}>Статус</th>
                <th style={cell}>Действия</th>
            </tr>
            </thead>

            <tbody>
            {users.map(user => (
                <tr key={user.id}>
                    <td style={cell}>{user.id}</td>
                    <td style={cell}>{user.email}</td>
                    <td style={cell}>{user.role}</td>
                    <td style={cell}>{user.blocked ? 'Заблокирован' : 'Активен'}</td>

                    <td style={cell}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {/* Смена роли */}
                            <select
                                value={user.role}
                                onChange={(e) =>
                                    roleMutation.mutate({ id: user.id, role: e.target.value })
                                }
                            >
                                <option value="USER">USER</option>
                                <option value="OPERATOR">OPERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>

                            {/* Блокировка / разблокировка */}
                            {user.blocked ? (
                                <button onClick={() => unblockMutation.mutate(user.id)}>
                                    Разблокировать
                                </button>
                            ) : (
                                <button onClick={() => blockMutation.mutate(user.id)}>
                                    Заблокировать
                                </button>
                            )}

                            {/* Удаление */}
                            <button
                                style={{ background: 'red', color: 'white' }}
                                onClick={() => deleteMutation.mutate(user.id)}
                            >
                                Удалить
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

const cell = {
    border: '1px solid #ddd',
    padding: '8px 12px',
};
