/** 
 * 限制请求发送，每次请求最大数量固定，防止一次性太多请求页面卡死
 */
class RequestLimit {
  /** 请求限制数 */
  limit: number;
  /** 阻塞队列 */
  blockQueue: Function[];
  /** 当前执行数 */
  currentCount: number;
  constructor(limit?: number) {
    this.limit = limit || 4;
    this.blockQueue = [];
    this.currentCount = 0;
  }

  /** 
   * 接收的request函数，应该在request第一次执行就用run方法包裹，而不是包裹其返回结果
   */
  async run(request: () => Promise<unknown>) {
    // 如果当前执行请求数大于限制数，就通过一个await阻止继续往下执行
    // 等到上一个队列中的请求被发送出去了，阻塞队列中的值才会被执行，才会继续发其他请求
    if(this.currentCount >= this.limit) {
      await new Promise((resolve) => this.blockQueue.push(resolve))
    }

    this.currentCount++
    try {
      // 执行请求
      return await request()
    }catch(err) {
      return Promise.reject(err)
    }finally {
      this.currentCount--
      // 请求结束，将阻塞队列中的值执行，往下继续发送其他请求
      if(this.blockQueue.length) {
        this.blockQueue.shift()!()
      }
    }
  }
}

export default RequestLimit