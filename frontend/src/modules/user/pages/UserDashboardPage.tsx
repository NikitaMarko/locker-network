import { LockerList } from '../components/LockerList';
import { useLockers } from '../hooks/useLockers';

export function UserDashboardPage() {
    const { lockers, isLoading } = useLockers();

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>Мои ячейки</h1>
            <LockerList lockers={lockers} />
        </div>
    );
}
