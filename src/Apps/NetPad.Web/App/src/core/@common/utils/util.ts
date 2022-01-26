export class Util {
    public static newGuid(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Gets the difference of 2 dates in number of days
     * @param a
     * @param b
     */
    public static dateDiffInDays(a: Date, b: Date): number {
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        // 8.64e+7 milliseconds = 1 day
        return Math.floor(Math.abs(utc2 - utc1) / 8.64e7);
    }

    /**
     * Converts a string to title case.
     * @param str string
     */
    public static toTitleCase(str: string) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
     * Truncates a string.
     * @param str The string to truncate.
     * @param maxLength The length after which the target string will be truncated.
     */
    public static truncate(str: string, maxLength: number) {
        if (!str || maxLength < 0 || str.length <= maxLength) return str;

        return str.substr(0, maxLength - 3) + "...";
    }

    /**
     * Checks if a string is a letter.
     * @param str The string to check.
     */
    public static isLetter(str: string): boolean {
        return str.length === 1 && !!str.match(/[a-z]/i);
    }

    /**
     * Groups a collection by the selected key.
     * @param collection The collection to group.
     * @param keyGetter A function that selects the key to group by.
     */
    public static groupBy<TItem, TKey>(collection: Array<TItem>, keyGetter: (item: TItem) => TKey): Map<TKey, Array<TItem>> {
        const map = new Map();

        for (const item of collection) {
            const key = keyGetter(item);

            const collection = map.get(key);

            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        }

        return map;
    }

    /**
     * Returns a new array with the unique items from the provided array.
     * @param collection The array to filter.
     */
    public static distinct<TItem>(collection: Array<TItem>): Array<TItem> {
        return [...new Set(collection)];
    }

    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the
     * debounced function was invoked.
     * @param thisArg The value to use as this when calling func.
     * @param func The function to debounce.
     * @param waitMs The number of milliseconds to debounce.
     * @param immediate If true, will execute the function immediately and then waits for the interval before being called again.
     */
    public static debounce(thisArg: unknown, func: (...args: any[]) => void, waitMs: number, immediate?: boolean) : (...args:any[]) => void {
        let timeout: NodeJS.Timeout | null;

        return (...args: any[]) => {
            const later = () => {
                timeout = null;
                func.call(thisArg, ...args);
            };

            const callNow = immediate && !timeout;

            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(later, waitMs) as unknown as NodeJS.Timeout;

            if (callNow) func.call(thisArg, ...args);
        };
    }

    /**
     * Creates a promise that resolves after the specified number of milliseconds.
     * @param ms The delay in milliseconds.
     */
    public delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
}
