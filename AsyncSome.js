function someCallback(array, asyncPredicate, callback) {
  if (array.length === 0) return callback(null, false);

  let index = 0;
  let finished = false;

  function next() {
    if (finished) return;
    if (index >= array.length) {
      finished = true;
      return callback(null, false);
    }

    const current = index++;

    asyncPredicate(array[current], (err, result) => {
      if (finished) return;
      if (err) {
        finished = true;
        return callback(err, null);
      }
      if (result) {
        finished = true;
        return callback(null, true);
      }
      next();
    });
  }

  next();
}

function somePromise(array, asyncPredicate) {
  return new Promise((resolve, reject) => {
    if (array.length === 0) return resolve(false);

    let index = 0;
    let finished = false;

    function next() {
      if (finished) return;
      if (index >= array.length) {
        finished = true;
        return resolve(false);
      }

      const current = index++;

      asyncPredicate(array[current])
        .then((result) => {
          if (finished) return;
          if (result) {
            finished = true;
            resolve(true);
          } else {
            next();
          }
        })
        .catch((err) => {
          if (finished) return;
          finished = true;
          reject(err);
        });
    }

    next();
  });
}

function someAbortable(array, asyncPredicate, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'));
    }

    if (array.length === 0) return resolve(false);

    let index = 0;
    let finished = false;

    function abort() {
      if (finished) return;
      finished = true;
      reject(new DOMException('Aborted', 'AbortError'));
    }

    if (signal) signal.addEventListener('abort', abort);

    function next() {
      if (finished) return;
      if (index >= array.length) {
        finished = true;
        if (signal) signal.removeEventListener('abort', abort);
        return resolve(false);
      }

      const current = index++;

      asyncPredicate(array[current])
        .then((result) => {
          if (finished) return;
          if (result) {
            finished = true;
            if (signal) signal.removeEventListener('abort', abort);
            resolve(true);
          } else {
            next();
          }
        })
        .catch((err) => {
          if (finished) return;
          finished = true;
          if (signal) signal.removeEventListener('abort', abort);
          reject(err);
        });
    }

    next();
  });
}

module.exports = { someCallback, somePromise, someAbortable };
