import { isValidUsername } from '../../src/shared/utils';

test('Check that username validation denies and accepts expected usernames', () => {
    const checks = [
        { in: 'BilboBaggins', out: true },
        { in: 'TimBillyBob93', out: true },
        { in: 'Dan_TheMan15', out: true },
        { in: '  Spacer  ', out: false },
        { in: 'AfterSpacer ', out: false },
        { in: 'Mid Spacer 15', out: false },
        { in: '5ymb0! F4N 1983!', out: false },
        { in: 'ithinkits@email.com', out: false },
        { in: '', out: false },
        { in: ' ', out: false },
        { in: '     ', out: false },
    ];
    checks.forEach(check => {
        const res = isValidUsername(check.in);
        expect(res).toEqual(check.out);
    });
});
