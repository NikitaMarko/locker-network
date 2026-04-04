// httpClient.ts — МОКОВЫЙ BACKEND

const MOCK = true;

// Моковая база данных в памяти
let lockers = [
    { id: "1", status: "FREE" },
    { id: "2", status: "BUSY" },
    { id: "3", status: "ERROR" },
];

export const http = {
    get: async (url: string) => {
        if (MOCK) {
            console.log("MOCK GET:", url);

            // Получить все ячейки
            if (url === "/lockers") {
                return { data: lockers };
            }

            // Получить конкретную ячейку
            if (url.startsWith("/lockers/")) {
                const id = url.split("/")[2];
                const locker = lockers.find(l => l.id === id);
                return { data: locker };
            }
        }

        throw new Error("Backend not implemented");
    },

    post: async (url: string) => {
        if (MOCK) {
            console.log("MOCK POST:", url);

            // Бронирование
            if (url.endsWith("/book")) {
                const id = url.split("/")[2];
                lockers = lockers.map(l =>
                    l.id === id ? { ...l, status: "BUSY" } : l
                );
                return { data: { ok: true } };
            }

            // Освобождение
            if (url.endsWith("/release")) {
                const id = url.split("/")[2];
                lockers = lockers.map(l =>
                    l.id === id ? { ...l, status: "FREE" } : l
                );
                return { data: { ok: true } };
            }

            // Сброс ошибки
            if (url.endsWith("/reset-error")) {
                const id = url.split("/")[2];
                lockers = lockers.map(l =>
                    l.id === id ? { ...l, status: "FREE" } : l
                );
                return { data: { ok: true } };
            }

            // Открыть/закрыть (оператор)
            if (url.endsWith("/open") || url.endsWith("/close")) {
                return { data: { ok: true } };
            }
        }

        throw new Error("Backend not implemented");
    }
};
