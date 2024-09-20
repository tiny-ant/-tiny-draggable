import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

type Node = { path?: string; next?: Node };
export default class DirWalker extends EventEmitter {
  ended: boolean;

  _paused: boolean;

  _goon: (() => void) | null;

  constructor(path: string | string[]) {
    super();

    this.start = () => {
      const onComplete = () => {
        if (!this.ended) {
          // avoid triggering the `end` event twice when calling the tail `step()` in a paused state.
          this.ended = true;
          this.emit('end', true);
        }
      };

      if (Array.isArray(path)) {
        const asyncNext = (node: Node) => {
          if (node.path) {
            _dirRecurse(node.path, this, () => {
              if (node.next && node.next.path) {
                asyncNext(node.next);
              } else {
                onComplete();
              }
            });
          }
        };

        const chain: Node = {};
        path.reduce((node: Node, next) => {
          node.path = next;
          node.next = {};
          return node.next;
        }, chain);

        asyncNext(chain);
      } else {
        _dirRecurse(path, this, onComplete);
      }
    };
  }

  start() {}

  /*
   * Pause the recursion, no more event will be triggered.
   */
  pause() {
    this._paused = true;
  }

  /*
   * Go on the recursion.
   */
  resume() {
    const next = this._goon;
    this._paused = false;

    if (typeof next === 'function') {
      this._goon = null;
      next();
    }
  }

  /*
   * Go a single step forward manually.
   */
  step() {
    const next = this._goon;
    if (/* this._paused === true && */ typeof next === 'function') {
      // really necessary,
      // or we may calling the same `next` again when `step` is called twice continuously,
      // which lead to a new recurse branch and the result is unkown.
      this._goon = null;
      next();
    }
  }

  /*
   * Terminate the recurse manually, well-designed.
   */
  end() {
    this.pause();
    this._goon = null; // if _tick aready executed.
    process.nextTick(() => {
      // Think if we execute `walker.resume()` in the next event loop, in an `end` callback, this is what we defend with.
      this._goon = null;
    });
    this.emit('end', false);
  }
}

/*
 * Pause and remember the pause point, or just keep going on.
 * @param {Object} walker  The walker object that holds the recurse state.
 * @param {Function} next  The callback that consume the stack of recursive algorithm.
 */
function _tick(walker: DirWalker, next: () => void) {
  if (walker._paused) {
    walker._goon = next;
  } else {
    next();
  }
}

/*
 * Traverse the directory in an asynchronous way, recursively.
 */
function _dirRecurse(pathname: string, walker: DirWalker, next: () => void) {
  fs.stat(pathname, (err, stat) => {
    if (err) {
      walker.emit('error', err);
      return _tick(walker, next);
    }

    if (stat.isDirectory()) {
      walker.emit('dir', pathname, stat);

      fs.readdir(pathname, (err, files) => {
        const base = pathname;

        if (err) {
          walker.emit('error', err);
          return _tick(walker, next);
        }

        function oneByOne() {
          let file: string | undefined;
          // eslint-disable-next-line no-cond-assign
          if ((file = files.shift()) !== undefined) {
            _dirRecurse(path.join(base, file), walker, oneByOne);
          } else {
            walker.emit('dir_pop', base);
            _tick(walker, next);
          }
        }

        _tick(walker, oneByOne);
      });
    } else if (stat.isFile()) {
      walker.emit('file', pathname, stat);
      _tick(walker, next);
    } else {
      walker.emit('other', pathname, stat);
      _tick(walker, next);
    }
  });
}
