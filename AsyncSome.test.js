const { someCallback } = require('./AsyncSome');

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

// helper: async predicate that resolves after a tick
function asyncIsEven(item, done) {
  setTimeout(() => done(null, item % 2 === 0), 0);
}

function asyncIsNegative(item, done) {
  setTimeout(() => done(null, item < 0), 0);
}

section('someCallback — basic');
{
  someCallback([1, 3, 4, 7], asyncIsEven, (err, result) => {
    assert(!err, 'no error');
    assert(result === true, 'finds even number in [1,3,4,7]');
  });

  someCallback([1, 3, 5, 7], asyncIsEven, (err, result) => {
    assert(!err, 'no error');
    assert(result === false, 'no even number in [1,3,5,7]');
  });

  someCallback([], asyncIsEven, (err, result) => {
    assert(!err, 'no error');
    assert(result === false, 'empty array returns false');
  });

  someCallback([1, 2, 3], asyncIsNegative, (err, result) => {
    assert(!err, 'no error');
    assert(result === false, 'no negative in [1,2,3]');
  });

  someCallback([-1, 2, 3], asyncIsNegative, (err, result) => {
    assert(!err, 'no error');
    assert(result === true, 'finds negative in [-1,2,3]');
  });
}

setTimeout(() => {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('  All tests passed! 🎉');
}, 100);
