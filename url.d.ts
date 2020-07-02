declare module "url" {
    export interface Url {
        protocol?: string;
        hostname?: string;
        pathname?: string;
        query: object;
        search: string;
    }

    export function parse(urlStr: string, parseQueryString?: boolean, slashesDenoteHost?: boolean): Url;
    export function format(urlObj: object): string;
}
