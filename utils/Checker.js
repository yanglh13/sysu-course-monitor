const EventEmitter = require('events');
const {delay} = require('../lib');
const util = require('./util');
const config = require('../config');
let times = 0;
// 每隔一段时间刷新一次cookie
const oneHour = 1 * 60 * 60 * 1000;
const updateCookieTimes = oneHour / config.interval;

/**
 * 检查器
 * @event finish     所有类型的课程都不需要监控
 * @event selectable 出现可选课程
 * 参数：
 *  course     有空位course信息
 *  current    当前选课类型相关配置
 * @event error      错误
 * 参数：
 *  error      错误详情
 * @event count      完成一次查询
 * 参数
 *  times      总次数
 * @event pause      暂停
 * @event resume     继续
 * @event relogin    要求重新登陆
 */
module.exports = class Checker extends EventEmitter {
  /**
   * 构造器
   * @method constructor
   */
  constructor () {
    super();
    this._pause = Promise.resolve();
    this._resume = null;
  }

  async start () {
    try {
      // 定义一个lable 方便退出循环
      restart:
      while (true) {
        if (this._resume) {
          this.emit('pause');
          await this._pause;
          this.emit('resume');
        }
        // 获取所有enbale的选课配置
        let enables = util.getEnables();
        // 没有需要选课的类型则退出
        if (!enables.length) {
          this.emit('finish');
          break restart;
        }
        let courses = await util.getCourses();
        if (courses.length === 0) throw new Error('no course');
        // 对于每种类型
        for (let current of enables) {
          // 对于每个目标
          for (let target of current.targets) {
            // 遍历所有课程 比对
            for (let course of courses) {
              // 如果可选，运行action
              if (isSelectable(current.type, target, course)) {
                this.pause();
                this.emit('selectable', {course, current});
                // 只不过是从头再来~
                continue restart;
              }
            }
          }
        }
        this.emit('count', ++times);
        // 每隔一段时间刷新一次cookie
        if (!(times % updateCookieTimes)) {
          this.pause();
          this.emit('relogin');
        }
        await delay(config.interval);
      }
    } catch (e) {
      this.emit('error', e);
    }
  }

  pause () {
    let resolveFn;
    this._pause = new Promise(resolve => {
      resolveFn = resolve;
    });
    this._resume = resolveFn;
  }

  resume () {
    if (this._resume) {
      this._resume();
      this._resume = null;
    }
  }
};

/**
 * 判断课程是否满足要求，名称 时间和老师都符合，且还有剩余位置时符合
 * @param  {[type]} target 目标课程
 * @param  {[type]} course 查询课程
 * @return {[type]}        是否符合要求
 */
function isSelectable (type, target, course) {
  return course.remain > 0 && type === course.type && target.id === course.id;
}
