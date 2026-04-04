export interface SignupDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}