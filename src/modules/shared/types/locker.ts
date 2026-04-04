export interface Locker {
    id: string;
    number: number;
    status: 'FREE' | 'BUSY' | 'ERROR';
    userId?: string;
}
