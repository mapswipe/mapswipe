import { getProjectProgressForDisplay } from '../../src/shared/Database';
import { getLevelForContributionCount } from '../../src/shared/reducers/ui';

describe('Test various utility functions', () => {
    test('Check that displayed progress is rounded as expected', () => {
        const checks = [
            { in: 7.2, out: '7' },
            { in: -7.2, out: '0' },
            { in: 99.6, out: '99' },
            { in: 100.2, out: '100' },
        ];
        checks.forEach(check => {
            const p1 = getProjectProgressForDisplay(check.in);
            expect(p1).toEqual(check.out);
        });
    });

    test('Test getLevelForContributionCount', () => {
        const checks = [
            { in: 10695, out: 6 },
            { in: 10694, out: 5 },
            { in: 1, out: 1 },
            { in: 1999999999, out: 36 },
        ];
        checks.forEach(check => {
            const level = getLevelForContributionCount(check.in);
            expect(level).toEqual(check.out);
        });
    });
});
