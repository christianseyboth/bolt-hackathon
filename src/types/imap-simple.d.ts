declare module 'imap-simple' {
    interface ImapConfig {
        imap: {
            user: string;
            password: string;
            host: string;
            port: number;
            tls?: boolean;
            authTimeout?: number;
            connTimeout?: number;
        };
    }

    interface SearchResult {
        attributes: {
            uid: number;
        };
    }

    interface Connection {
        connect(config: ImapConfig): Promise<Connection>;
        openBox(mailbox: string): Promise<void>;
        search(criteria: any[], options?: any): Promise<SearchResult[]>;
        addFlags(uids: number[], flags: string[]): Promise<void>;
        imap: {
            expunge(): Promise<void>;
        };
        end(): Promise<void>;
    }

    const imaps: {
        connect(config: ImapConfig): Promise<Connection>;
    };

    export = imaps;
}
