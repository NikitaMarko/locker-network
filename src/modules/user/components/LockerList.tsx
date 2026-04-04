import { LockerCard } from './LockerCard';
import type {Locker} from "../../shared/types/locker";

interface LockerListProps {
    lockers: Locker[];
}

export function LockerList({ lockers }: LockerListProps) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 20,
                marginTop: 20,
            }}
        >
            {lockers.map((locker) => (
                <LockerCard key={locker.id} locker={locker} />
            ))}
        </div>
    );
}
