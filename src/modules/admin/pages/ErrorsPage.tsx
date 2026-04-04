import { useErrors } from '../hooks/useErrors';
import { ErrorList } from '../components/ErrorList';

export function ErrorsPage() {
    const { data, isLoading, error } = useErrors();

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка загрузки ошибок</div>;

    return (
        <div>
            <h1>Ошибки системы</h1>
            <ErrorList errors={data} />
        </div>
    );
}
