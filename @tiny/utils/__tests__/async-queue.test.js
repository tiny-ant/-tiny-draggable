import AsyncQueue from '../async-queue'

describe('test async queue', () => {
  it('add queue should be called', () => {
    const fn = jest.fn()
    AsyncQueue.instance.addQueue('123', fn, '123')
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 5)
    })
    return promise.then(() => {
      expect(fn).toBeCalledWith('123')
      console.log(AsyncQueue.instance.excutingQueue.length)
      expect(AsyncQueue.instance.excutingQueue.length).toEqual(0)
    })
  })
  it('add five task 2 waiting 3 excuting', () => {
    const fn = jest.fn()
    AsyncQueue.instance.addQueue('1', fn, '1')
    AsyncQueue.instance.addQueue('2', fn, '2')
    AsyncQueue.instance.addQueue('3', fn, '3')
    AsyncQueue.instance.addQueue('4', fn, '4')
    AsyncQueue.instance.addQueue('5', fn, '5')
    expect(AsyncQueue.instance.excutingQueue.length).toEqual(3)
    expect(AsyncQueue.instance.waitingQueue.length).toEqual(2)
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 300)
    })
    return promise.then(() => {
      expect(fn).toHaveBeenCalledTimes(5)
      expect(AsyncQueue.instance.excutingQueue.length).toEqual(0)
      expect(AsyncQueue.instance.waitingQueue.length).toEqual(0)
    })
  })
})
