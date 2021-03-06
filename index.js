const {initialize, login, collect, show, Checker, Selector} = require('./utils');
const {util, errorHandler} = require('./utils');
const {wxinform, log, axios} = require('./lib');

main();
async function main () {
  // 读取配置
  log('初始化数据...');
  initialize();
  if (util.getEnables().length) {
    log('初始化完成');
  } else {
    log.error('无待执行任务');
  }

  // 登录
  log('登录中...');
  try {
    await login();
  } catch (e) {
    log(e);
    return log('登录失败');
  }
  log('登陆成功');

  // 收集并验证数据
  log('正在进入选课系统...');
  try {
    await collect();
  } catch (e) {
    log(e);
    return log('进入选课系统失败');
  }
  log('进入选课系统成功');

  // 输出配置
  show();

  // 初始化 课程查询 和 选课
  const checker = new Checker();
  const selector = new Selector();
  const _errorHandler = errorHandler.bind(null, checker);
  const relogin = async () => {
    axios.refresh();
    try {
      await login();
    } catch (err) {
      log(err);
      await wxinform('错误', '刷新cookie失败，程序已退出');
      process.exit(0);
    }
    log('刷新cookie完成');
    checker.resume();
  };

  log('开始查询');
  checker
    .on('count', log.line)
    .on('selectable', option => {
      log(`发现空位${option.course.name}`);
      selector.select(option);
    })
    .on('pause', log.bind(null, '暂停查询'))
    .on('resume', log.bind(null, '继续查询'))
    .on('finish', log.bind(null, '任务完成'))
    .on('relogin', relogin)
    .on('error', _errorHandler)
    .start();

  selector
    .on('success', async message => {
      log(message);
      await wxinform('选课成功', message);
      checker.resume();
    })
    .on('fail', async message => {
      log(message);
      await wxinform('选课失败', message);
      checker.resume();
    })
    .on('error', _errorHandler);
}
