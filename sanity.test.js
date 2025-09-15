test('sanity check', () => {
  expect(1 + 1).toBe(2);
});

test('basic math operations', () => {
  expect(2 * 3).toBe(6);
  expect(10 - 4).toBe(6);
  expect(8 / 2).toBe(4);
});

test('string operations', () => {
  expect('hello').toContain('ell');
  expect('world').toHaveLength(5);
});


