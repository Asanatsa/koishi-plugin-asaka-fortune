import { Context, Schema } from 'koishi';
export declare const name = "asaka-fortune";
export declare const inject: string[];
export interface Config {
}
export declare const Config: Schema<Config>;
declare module 'koishi' {
    interface Tables {
        asakafortune: asakafortuneDatabase;
    }
}
export interface asakafortuneDatabase {
    id: number;
    platform: string;
    timestamp: Date;
    data: object;
}
export declare function apply(ctx: Context): void;
