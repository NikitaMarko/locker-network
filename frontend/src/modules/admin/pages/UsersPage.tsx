import { useUsers } from '../hooks/useUsers';
import { UserTable } from '../components/UserTable';

export function UsersPage() {
    const { data, isLoading, error } = useUsers();

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка загрузки пользователей</div>;

    return (
        <div>
            <h1>Пользователи</h1>
            <UserTable users={data} />
        </div>
    );
}
