/**
 * Helpers for date math and locale-sensitive calendar preferences.
 * 
 * The visual representation of calendars varies quite a bit from place to
 * place; see the discussion at
 * [CalendarMonth](CalendarMonth#international-support). The `calendar` helpers
 * provide some assistance in determining a locale's calendar presentation
 * preferences, and working with date math in general.
 * 
 * 
 * Where these functions take a `locale` string parameter, that should follow
 * the same format as the [locales
 * argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument)
 * of the `Intl` internationalization API. Moreover, the locale should identify
 * at least a language and a region. Examples: "en-US" identifies US English,
 * while "en-GB" identifies English in Great Britain. The use of "en" on its own
 * would be insufficient.
 * 
 * @module calendar
 */


import weekData from './weekData.js';


// Default region is "World", see https://www.ctrl.blog/entry/en-001
const defaultRegion = '001';


export const millisecondsPerDay = 24 * 60 * 60 * 1000;


/**
 * Returns the number of days between the first day of the calendar week in the
 * indicated locale and the given date. In other words, the result indicates
 * which column of a typical calendar the date would appear in.
 * 
 * Example: Suppose the given date is a Monday. In the locale 'en-US', the first
 * day of the calendar week is a Sunday, so this function would return 1. In the
 * locale 'en-GB', the first day of the calendar week is a Monday, in which case
 * this function would return 0.
 * 
 * @param {Date} date - the target date
 * @param {string} locale - the calendar locale
 * @returns {number} the number of days between the first day of the week in
 * the locale's calendar and the target date
 */
export function daysSinceFirstDayOfWeek (date, locale) {
  const firstDay = firstDayOfWeek(locale);
  return (date.getDay() - firstDay + 7) % 7;
}


/**
 * Returns the first day of the week in a typical calendar in the indicated
 * locale, where 0 is Sunday, 1 is Monday, ..., and 6 = Saturday.
 * 
 * @param {string} locale - the calendar locale
 * @returns {number} the number of the first day of the week in the locale
 */
export function firstDayOfWeek(locale) {
  const region = getLocaleRegion(locale);
  const firstDay = weekData.firstDay[region];
  return firstDay !== undefined ?
    firstDay :
    weekData.firstDay[defaultRegion];
}


/**
 * Return the date of the first day of the week in the locale's calendar that
 * contains the given date.
 * 
 * @param {Date} date - the target date
 * @param {string} locale - the calendar locale
 * @returns {Date}
 */
export function firstDateOfWeek(date, locale) {
  const days = daysSinceFirstDayOfWeek(date, locale);
  const firstDate = offsetDateByDays(date, -days);
  return midnightOnDate(firstDate);
}


/**
 * Returns the first date of the month that contains the indicated target date.
 * 
 * @param {Date} date - the target date
 * @returns {Date}
 */
export function firstDateOfMonth(date) {
  const result = midnightOnDate(date);
  result.setDate(1);
  return result;
}


/**
 * Returns the last date of the month that contains the indicated target date.
 * 
 * @param {Date} date - the target date
 * @returns {Date}
 */
export function lastDateOfMonth(date) {
  // Get last day of month by going to first day of next month and backing up a day.
  const result = firstDateOfMonth(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(result.getDate() - 1);
  return result;
}


/**
 * Returns midnight on the indicated target date.
 * 
 * @param {Date} date - the target date
 * @returns {Date}
 */
export function midnightOnDate(date) {
  const midnight = new Date(date.getTime());
  midnight.setHours(0);
  midnight.setMinutes(0);
  midnight.setSeconds(0);
  midnight.setMilliseconds(0);
  return midnight;
}


/**
 * Return true if the two dates fall in the same month and year.
 * 
 * @param {Date} date1 - the first date to compare
 * @param {Date} date2 - the second date to compare
 * @returns {boolean}
 */
export function sameMonthAndYear(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth();
}


/**
 * Return the result of adding/subtracting a number of days to a date.
 * 
 * @param {Date} date - the target date
 * @param {number} days - the number of days to add/subtract
 * @returns {Date}
 */
export function offsetDateByDays(date, days) {
  // Use noon hour for date math, since adding/subtracting multiples of 24 hours
  // starting from noon is guaranteed to end up on the correct date (although
  // the hours might have changed).
  // TODO: Given the nature of date, there could easily be gnarly date math bugs
  // here. Ideally some time-geek library should be used for this calculation.
  const noon = new Date(date.getTime());
  noon.setHours(11);
  const result = new Date(noon.getTime() + (days * millisecondsPerDay));
  // Restore original hours
  result.setHours(date.getHours());
  return result;
}


/**
 * Returns midnight today.
 * 
 * @returns {Date}
 */
export function today() {
  return midnightOnDate(new Date());
}


/**
 * Returns the day of week (0 = Sunday, 1 = Monday, etc.) for the last day of
 * the weekend in the indicated locale.
 * 
 * @param {string} locale - the calendar locale
 * @returns {number}
 */
export function weekendEnd(locale) {
  const region = getLocaleRegion(locale);
  const day = weekData.weekendEnd[region];
  return day !== undefined ?
    day :
    weekData.weekendEnd[defaultRegion];
}


/**
 * Returns the day of week (0 = Sunday, 1 = Monday, etc.) for the first day of
 * the weekend in the indicated locale.
 * 
 * @param {string} locale - the calendar locale
 * @returns {number}
 */
export function weekendStart(locale) {
  const region = getLocaleRegion(locale);
  const day = weekData.weekendStart[region];
  return day !== undefined ?
    day :
    weekData.weekendStart[defaultRegion];
}


function getLocaleRegion(locale) {
  const localeParts = locale ? locale.split('-') : null;
  return localeParts ? localeParts[1] : defaultRegion;
}
