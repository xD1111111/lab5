const { someCallback, somePromise, someAbortable } = require('./AsyncSome');

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

function slowPredicate(item) {
  return new Promise((resolve) => setTimeout(() => resolve(item > 100), 50));
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

section('someAbortable — abort support');
{
  const controller1 = new AbortController();
  someAbortable([1, 2, 3, 4, 5], slowPredicate, controller1.signal)
    .then(() => assert(false, 'should have been aborted'))
    .catch((err) => assert(err.name === 'AbortError', 'aborts with AbortError'));
  controller1.abort();

  const controller2 = new AbortController();
  controller2.abort();
  someAbortable([1, 2, 3], slowPredicate, controller2.signal)
    .catch((err) => assert(err.name === 'AbortError', 'rejects immediately if already aborted'));

  const controller3 = new AbortController();
  someAbortable([1, 3, 4], promiseIsEven, controller3.signal)
    .then((result) => assert(result === true, 'completes normally when not aborted'));
}

section('demo cases');
{
  console.log('\n  — callback demo —');
  someCallback(
    ['cat', 'dog', 'elephant'],
    (item, done) => setTimeout(() => done(null, item.length > 4), 10),
    (err, result) => console.log(`  Has word longer than 4 chars: ${result}`)
  );

  console.log('\n  — promise demo —');
  somePromise(
    [10, 20, 30, 5],
    (item) => new Promise((resolve) => setTimeout(() => resolve(item < 10), 10))
  ).then((result) => console.log(`  Has number less than 10: ${result}`));

  console.log('\n  — async/await demo —');
  (async () => {
    const hasLargeNumber = await somePromise(
      [1, 5, 3, 99],
      (item) => new Promise((resolve) => setTimeout(() => resolve(item > 50), 10))
    );
    console.log(`  Has number > 50: ${hasLargeNumber}`);
  })();
}

setTimeout(() => {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('  All tests passed! 🎉');
}, 500);
