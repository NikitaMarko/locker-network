import { useAuth } from "../../../app/providers/useAuth";
import { useLockers } from "../hooks/useLockers";
import type {Locker} from "../../shared/types/locker";

interface LockerCardProps {
    locker: Locker;
}

export function LockerCard({ locker }: LockerCardProps) {
    const { user } = useAuth();
    const { bookLocker, releaseLocker } = useLockers();

    const isMine = locker.userId === user?.userId;

    const getColor = () => {
        switch (locker.status) {
            case "FREE": return "#d4ffd4";
            case "BUSY": return isMine ? "#d4e8ff" : "#ffd4d4";
            case "ERROR": return "#ffe4b3";
            default: return "#eee";
        }
    };

    return (
        <div style={{
            padding: "15px",
            borderRadius: "8px",
            background: getColor(),
            border: "1px solid #ccc"
        }}>
            <h3>Ячейка №{locker.number}</h3>
            <p>Статус: {locker.status}</p>

            {locker.status === "FREE" && (
                <button onClick={() => bookLocker(locker.id)}>
                    Забронировать
                </button>
            )}

            {isMine && (
                <button onClick={() => releaseLocker(locker.id)}>
                    Освободить
                </button>
            )}

            {locker.status === "BUSY" && !isMine && (
                <p style={{ color: "red" }}>Занято другим пользователем</p>
            )}

            {locker.status === "ERROR" && (
                <p style={{ color: "darkorange" }}>Ошибка — недоступно</p>
            )}
        </div>
    );
}
