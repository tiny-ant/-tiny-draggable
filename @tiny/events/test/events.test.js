'use strict';

import Events from '..';

describe('@tiny/events', () => {
  const EventBus = new Events();

  it('event-bus add event listeners', () => {
    const cb = jest.fn()
    EventBus.instance.on('test-event', cb)
    expect(EventBus.instance.listeners['test-event'].length).toEqual(1)
    EventBus.instance.emit('test-event', 'test-data')
    expect(cb).toBeCalledWith('test-data')
    EventBus.instance.off('test-event', cb)
    expect(EventBus.instance.listeners['test-event'].length).toEqual(0)
  })
  it('event-bus once event listeners', () => {
    const cb = jest.fn()
    EventBus.instance.on('test-event', cb, true)
    expect(EventBus.instance.listeners['test-event'].length).toEqual(1)
    EventBus.instance.emit('test-event', 'test-data')
    expect(cb).toBeCalledWith('test-data')
    expect(EventBus.instance.listeners['test-event'].length).toEqual(0)
  })
});

/**
const bus = new Events()
function g1(e, a) {console.log('g1'); bus.off()}
function g2(e, a) {console.log("loaded")}
function g3(e, a) {console.log("loaded 2 times, " + e, a)}

bus.once("click", g1)
bus.once("click", g1) // no duplicate binding
bus.once("load", g1) // okey for another event name
bus.on("load", g1) // this will replace the previous once-binding
bus.on("load", g3)
bus.on("load", g3, {say: "haha"})
bus.off("load", g3) // no duplicate binding
bus.emit("load", "3sec", true)
 */
