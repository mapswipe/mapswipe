/**
 * Identifies if value is NaN.
 * @param val
 */
export function isNaN(val) {
    if (typeof val === 'number') {
        return Number.isNaN(val);
    }
    return false;
}

/**
 * Identifies if value is not defined.
 * undefined, null and NaN are not considered as defined.
 * @param val
 */
export function isNotDefined(val) {
    return val === undefined || val === null || isNaN(val);
}

/**
 * Identifies if value is defined.
 * @param val
 */
export function isDefined(val) {
    return !isNotDefined(val);
}

/**
 * Identifies if value is falsy.
 * undefined, null, NaN and false are considered as false value.
 * @param val
 * @param override list of additional values that are considered false values
 */
export function isFalsy(val, override = []) {
    return isNotDefined(val) || val === false || override.includes(val);
}

/**
 * Identifies if value is falsy string.
 * undefined, null, NaN, false, '' are considered as false value.
 * @param val
 */
export function isFalsyString(val) {
    return isFalsy(val, ['']);
}

/**
 * Identify if shortText is inside longText
 *
 * @param longText
 * @param shortText
 *
 * @remarks
 * The match is case-insensitive
 *
 */
export function caseInsensitiveSubmatch(longText, shortText) {
    if (isNotDefined(longText) || isNotDefined(shortText)) {
        return false;
    }

    return String(longText)
        .trim()
        .toLowerCase()
        .includes(String(shortText).trim().toLowerCase());
}

/**
 * Get rating for content in string
 *
 * @param content
 * @param str
 */
export function getRatingForContentInString(content, str): number {
    // FIXME: the behavior needs to be tested again
    if (isFalsyString(content) || isFalsyString(str)) {
        return -1;
    }
    return content.toLowerCase().indexOf(str.toLowerCase());
}

const comparison =
    (extractor, comparisonFunc) =>
    (x, y, direction = 1) => {
        const a = isDefined(x) ? extractor(x) : undefined;
        const b = isDefined(y) ? extractor(y) : undefined;
        if (a === b) {
            return 0;
        }
        if (isNotDefined(a)) {
            return direction * 1;
        }
        if (isNotDefined(b)) {
            return direction * -1;
        }
        return direction * comparisonFunc(a, b);
    };

export const compareStringSearch = (x, y, z, d) => {
    if (!z) {
        return 0;
    }

    return comparison(
        (a: string) => a,
        (a: string, b: string) => {
            const searchText = z.toLowerCase();
            const firstIndex = a.toLowerCase().indexOf(searchText);
            const secondIndex = b.toLowerCase().indexOf(searchText);

            if (firstIndex === secondIndex) {
                return a.localeCompare(b);
            }

            if (firstIndex === -1 && secondIndex === -1) {
                return a.localeCompare(b);
            }
            if (secondIndex === -1) {
                return -1;
            }
            if (firstIndex === -1) {
                return 1;
            }
            return firstIndex - secondIndex;
        },
    )(x, y, d);
};

export function rankedSearchOnList(list, searchString, labelSelector) {
    if (isFalsyString(searchString)) {
        return list;
    }

    return list
        .filter(option =>
            caseInsensitiveSubmatch(labelSelector(option), searchString),
        )
        .sort((a, b) =>
            compareStringSearch(
                labelSelector(a),
                labelSelector(b),
                searchString,
            ),
        );
}
