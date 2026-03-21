import { useOperatorLockers } from '../hooks/useOperatorLockers';
import { LockerControlTable } from '../components/LockerControlTable';

export function OperatorDashboardPage() {
    const { data, isLoading, error } = useOperatorLockers();

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка загрузки ячеек</div>;

    return (
        <div>
            <h1>Управление ячейками</h1>
            <LockerControlTable lockers={data} />
        </div>
    );
}
