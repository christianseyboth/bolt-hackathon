declare module 'poplib' {
    interface PoplibOptions {
        tlserrs?: boolean;
        enabletls?: boolean;
        debug?: boolean;
    }

    interface PoplibClient {
        on(event: 'connect', listener: () => void): this;
        on(event: 'login', listener: (status: boolean, rawdata: any) => void): this;
        on(event: 'error', listener: (err: Error) => void): this;
        on(event: string, listener: (...args: any[]) => void): this;

        login(user: string, password: string): void;
        list(callback: (err: Error | null, lines: string[], octets: number) => void): void;
        retr(index: number, callback: (err: Error | null, lines: string[], octets: number) => void): void;
        dele(index: number, callback: (err: Error | null) => void): void;
        quit(): void;
    }

    class PoplibClient {
        constructor(port: number, host: string, options?: PoplibOptions);
    }

    export = PoplibClient;
}
