import { getProjectProgressForDisplay } from '../../src/shared/Database';

describe('Test various utility functions', () => {
    test('Check that displayed progress is rounded as expected', () => {
        const checks = [
            { in: 7.2, out: '7' },
            { in: -7.2, out: '0' },
            { in: 99.6, out: '99' },
            { in: 100.2, out: '100' },
        ];
        checks.forEach((check) => {
            const p1 = getProjectProgressForDisplay(check.in);
            expect(p1).toEqual(check.out);
        });
    });
});
