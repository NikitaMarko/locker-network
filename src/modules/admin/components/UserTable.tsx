import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    updateUserRole,
    blockUser,
    unblockUser,
    deleteUser
} from '../../../api/usersApi';

type User = {
    id: string;
    email: string;
    role: string;
    blocked: boolean;
};

export function UserTable({ users }: { users: User[] }) {
    const queryClient = useQueryClient();

    const roleMutation = useMutation({
        mutationFn: (data: { id: string; role: string }) =>
            updateUserRole(data.id, data.role),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const blockMutation = useMutation({
        mutationFn: (id: string) => blockUser(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const unblockMutation = useMutation({
        mutationFn: (id: string) => unblockUser(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['users'] }),
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
            {users.map((user) => (
                <tr key={user.id}>
                    <td style={cell}>{user.id}</td>
                    <td style={cell}>{user.email}</td>
                    <td style={cell}>{user.role}</td>
                    <td style={cell}>
                        {user.blocked ? 'Заблокирован' : 'Активен'}
                    </td>

                    <td style={cell}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <select
                                value={user.role}
                                onChange={(e) =>
                                    roleMutation.mutate({
                                        id: user.id,
                                        role: e.target.value,
                                    })
                                }
                            >
                                <option value="USER">USER</option>
                                <option value="OPERATOR">OPERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>

                            {user.blocked ? (
                                <button
                                    onClick={() =>
                                        unblockMutation.mutate(user.id)
                                    }
                                >
                                    Разблокировать
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        blockMutation.mutate(user.id)
                                    }
                                >
                                    Заблокировать
                                </button>
                            )}

                            <button
                                style={{ background: 'red', color: 'white' }}
                                onClick={() =>
                                    deleteMutation.mutate(user.id)
                                }
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