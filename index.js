const config = require('./config');
const {login, init, Checker, Selector} = require('./utils');
const {inform, axios, log} = require('./lib');
const fs = require('fs');

main();
async function main () {
  let sid, xkjdszids;

  // 登录
  log('登录中...');
  try {
    sid = await login(config.netid, config.password);
  } catch (e) {
    log(e);
    return log('登录失败');
  }
  log('登陆成功');

  // 初始化数据
  log('正在进入选课系统...');
  try {
    xkjdszids = await init(sid, config.interval);
  } catch (e) {
    log(e);
    return log('进入选课系统失败');
  }
  log('进入选课系统成功');

  // 初始化 课程查询 和 选课
  const checker = new Checker(sid, xkjdszids, config.interval, config.settings);
  const selector = new Selector();

  let relodgin = async e => {
    log(e);
    log('查询时出现错误，正在重新登录');
    axios.refresh();
    try {
      sid = await login(config.netid, config.password);
    } catch (e) {
      log(e);
      log('登录失败');
      process.exit(0);
    }
    log('登陆成功，继续选课');
    checker.start();
  };

  log('开始查询');
  checker
    .on('count', log.line)
    .on('selectable', option => {
      log(`发现空位${option.course.name}`);
      checker.pause();
      selector.select(option);
    })
    .on('pause', log.bind(null, '暂停查询'))
    .on('resume', log.bind(null, '继续查询'))
    .on('finish', log.bind(null, '任务完成'))
    .on('error', relodgin)
    .start();

  selector
    .on('success', ({message, current}) => {
      // 成功后将更新后配置写进磁盘
      current.enable = false;
      checker.resume();
      let json = JSON.stringify(config.settings, null, 2);
      fs.writeFile('./config/settings.json', json, () => {});
      inform('选课成功', message);
    })
    .on('fail', inform.bind(null, '选课失败'))
    .on('error', relodgin);
}
