import { useEffect, useState } from "react";

export function Timer({ until }: { until: number }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const i = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(i);
    }, []);

    const left = until - now;

    if (left <= 0) return <div>Expired</div>;

    const s = Math.floor(left / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);

    return <div>{h}h {m}m</div>;
}