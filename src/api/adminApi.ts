import {http} from "./httpClient";

export const getAdminStats = () =>
    http.get("/admin/stats").then(res => res.data);

export const getRecentEvents = () =>
    http.get("/admin/events").then(res => res.data);
