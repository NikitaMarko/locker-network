import {LockerControlTable} from "../components/LockerControlTable.tsx";
import {useOperatorLockers} from "../hooks/useOperatorLockers.ts";

export function OperatorDashboardPage() {
    const {
        lockers,
        isLoading,
        openLocker,
        closeLocker,
        releaseLocker,
    } = useOperatorLockers();

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>Управление ячейками</h1>
            <LockerControlTable
                lockers={lockers}
                openLocker={openLocker}
                closeLocker={closeLocker}
                releaseLocker={releaseLocker}
            />
        </div>
    );
}