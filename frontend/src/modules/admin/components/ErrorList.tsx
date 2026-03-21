import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveError } from '../../../api/errorsApi';

export function ErrorList({ errors }) {
    const queryClient = useQueryClient();

    const resolveMutation = useMutation({
        mutationFn: (id) => resolveError(id),
        onSuccess: () => queryClient.invalidateQueries(['errors']),
    });

    return (
        <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
    <thead>
        <tr>
            <th style={cell}>ID</th>
        <th style={cell}>Ячейка</th>
        <th style={cell}>Описание</th>
        <th style={cell}>Дата</th>
        <th style={cell}>Действия</th>
        </tr>
        </thead>

        <tbody>
        {errors.map(err => (
                <tr key={err.id}>
                <td style={cell}>{err.id}</td>
                    <td style={cell}>{err.lockerNumber}</td>
                <td style={cell}>{err.message}</td>
                <td style={cell}>{new Date(err.createdAt).toLocaleString()}</td>
                <td style={cell}>
            <button onClick={() => resolveMutation.mutate(err.id)}>
    Пометить как решённую
    </button>
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
