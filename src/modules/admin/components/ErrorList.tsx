import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveError } from '../../../api/errorsApi';

export function ErrorList({ errors }) {
    const queryClient = useQueryClient();

    const resolveMutation = useMutation({
        mutationFn: (id:string) => resolveError(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey:['errors']}),
    });

    return (
        <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
    <thead>
        <tr>
            <th style={cell}>ID</th>
        <th style={cell}>Cell</th>
        <th style={cell}>Definition</th>
        <th style={cell}>Date</th>
        <th style={cell}>Action</th>
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
