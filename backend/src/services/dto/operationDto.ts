export type Operation = {
    operationId: string,
    timestamp: string,
    status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILE",
}