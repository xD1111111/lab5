const { someCallback, somePromise } = require('./AsyncSome');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(50 - title.length)}`);
}

function asyncIsEven(item, done) {
  setTimeout(() => done(null, item % 2 === 0), 0);
}

function asyncIsNegative(item, done) {
  setTimeout(() => done(null, item < 0), 0);
}

function promiseIsEven(item) {
  return new Promise((resolve) => setTimeout(() => resolve(item % 2 === 0), 0));
}

function promiseIsNegative(item) {
  return new Promise((resolve) => setTimeout(() => resolve(item < 0), 0));
}

section('someCallback — basic');
{
  someCallback([1, 3, 4, 7], asyncIsEven, (err, result) => {
    assert(!err && result === true, 'finds even number in [1,3,4,7]');
  });

  someCallback([1, 3, 5, 7], asyncIsEven, (err, result) => {
    assert(!err && result === false, 'no even number in [1,3,5,7]');
  });

  someCallback([], asyncIsEven, (err, result) => {
    assert(!err && result === false, 'empty array returns false');
  });

  someCallback([-1, 2, 3], asyncIsNegative, (err, result) => {
    assert(!err && result === true, 'finds negative in [-1,2,3]');
  });
}

section('somePromise — basic');
{
  somePromise([1, 3, 4, 7], promiseIsEven)
    .then((result) => assert(result === true, 'finds even number in [1,3,4,7]'));

  somePromise([1, 3, 5, 7], promiseIsEven)
    .then((result) => assert(result === false, 'no even number in [1,3,5,7]'));

  somePromise([], promiseIsEven)
    .then((result) => assert(result === false, 'empty array returns false'));

  somePromise([-1, 2, 3], promiseIsNegative)
    .then((result) => assert(result === true, 'finds negative in [-1,2,3]'));
}

section('somePromise — async/await');
{
  (async () => {
    const result1 = await somePromise([1, 3, 4], promiseIsEven);
    assert(result1 === true, 'async/await: finds even');

    const result2 = await somePromise([1, 3, 5], promiseIsEven);
    assert(result2 === false, 'async/await: no even found');
  })();
}

setTimeout(() => {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('  All tests passed! 🎉');
}, 200);
