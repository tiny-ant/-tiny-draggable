
1. 无界嵌入，在子应用window对象上绑定事件为什么不生效？

例如：
子应用中绑定
window.addEventListener('resize', fn);

同样在子应用中触发：
window.dispatchEvent(new Event('resize'));


2. 理解异步函数

function delay(ms, msg) {
    return new Promise((res, rej) => {
        setTimeout(() => res(msg), ms);
    });
}
async function wait1(msg) {
    return delay(2000, msg);
}
async function wait2(msg) {
    const result = await delay(2000, msg);
    console.log('result = ', result);
}

async function test() {
    let a = wait2('no');
    console.log(a);
    let b = await wait1('ok');
    console.log(b);
    return b;
}

test(); // 先return Promise给外部，再执行函数体中的代码


3. SVG响应式研究

data:text/html,<div style="height: 50%;width:50%;margin:auto;background: aliceblue"><svg width="100%" height="100%" viewBox="0 0 100 100" style="border: 1px solid"><path d="M0 0V100H100V0H0Z" stroke="red" stroke-width="2" fill="none" /></svg></div>

这段代码实现了自适应的正方形，与image的object-fit特性有什么不同？能否实现object-fit实现不了的特性？

自适应SVG矩形：

data:text/html,<div style="height: 50%;width:50%;margin:auto;background: aliceblue"><svg width="100%" height="100%" style="overflow: visible"><rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" stroke="red" stroke-width="2" stroke-dasharray="2,2" fill="none" /></svg></div>




/**
 * EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget)
 */
interface EventTarget {
  /**
   * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
   *
   * The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.
   *
   * When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.
   *
   * When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.
   *
   * When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.
   *
   * If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.
   *
   * The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener)
   */
  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
  /**
   * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent)
   */
  dispatchEvent(event: Event): boolean;
  /**
   * Removes the event listener in target's event listener list with the same type, callback, and options.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/removeEventListener)
   */
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
}

