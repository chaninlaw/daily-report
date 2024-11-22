export class DateGenerator {
    private currentDate: Date;

    constructor() {
        this.currentDate = new Date(); // Initialize with the current date and time
    }

    /**
     * Get the current date.
     * @returns {Date} The current date object.
     */
    getCurrentDate(): Date {
        return this.currentDate;
    }

    /**
     * Format a date into a string based on a given format.
     * @param date The date object to format.
     * @param format The format string (default is 'YYYY-MM-DD').
     * @returns {string} The formatted date string.
     */
    formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
        const year: number = date.getFullYear();
        const month: string = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day: string = String(date.getDate()).padStart(2, '0');
        const hours: string = String(date.getHours()).padStart(2, '0');
        const minutes: string = String(date.getMinutes()).padStart(2, '0');
        const seconds: string = String(date.getSeconds()).padStart(2, '0');

        // Replace placeholders in the format string
        return format
            .replace('YYYY', String(year))
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * Add a specific number of days to a given date.
     * @param date The date object to modify.
     * @param days The number of days to add.
     * @returns {Date} The new date object with added days.
     */
    addDays(date: Date, days: number): Date {
        const newDate: Date = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }

    /**
     * Subtract a specific number of days from a given date.
     * @param date The date object to modify.
     * @param days The number of days to subtract.
     * @returns {Date} The new date object with subtracted days.
     */
    subtractDays(date: Date, days: number): Date {
        return this.addDays(date, -days);
    }

    /**
     * Generate a date object from a string.
     * @param dateString The date string to parse.
     * @returns {Date} The generated date object.
     */
    generateDateFromString(dateString: string): Date {
        return new Date(dateString);
    }
}