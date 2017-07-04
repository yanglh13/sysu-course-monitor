# Ⅰ. About
SYSU course monitor

Take your favorite course.

http://uems.sysu.edu.cn/elect/

# Ⅱ. Feature
- You can have a list of targets
- [Inform you the result in WeChat](#5-wechat-inform)
- Support polling to wait for the start of course selection
- Automatically re-login when cookies expire
- Support a replace course
- Re-select the replace course when fail to select target
- [Detect and correct selecting exception](#32-selecting-exception)
- [Fuzzy target name](#33-fuzzy-target-name)

# Ⅲ. Prerequisite
- [node.js](https://nodejs.org/en/) v8.0.0 or greater

# Ⅳ. How to use
## 1. Install
```bash
git clone https://github.com/Andiedie/sysu-course-monitor.git
cd sysu-course-monitor
npm i --production
```
## 2. Configuration
Input your information in file `/config/index.js`.

Require:
- NetID
- password
- interval

Optional:
- appid
- appsecret
- template_id

for more infomation, see [this](#5-wechat-inform).

## 3. Setting
Input your favorite courses in file `/config/settings.json`.

Example
```js
...
  "公选": {
    // true if you want it to work
    "enable": false,
    /*
     * class-id of one of your selected course
     * whenever there is a selectable course in targets
     * this replace course will be drop
     */
    "replace": "123456789",
    /*
     * here are the courses you want
     * require their class-id
     * you can leave comment to remind you what is it
     */
    "targets": [{
      "id": "123456789",
      "comment": "I like this course"
    }]
  }
...
```

### 3.1 How to get class-id
![](http://ocphk5wc7.bkt.clouddn.com//17-6-27/13741516.jpg)

### 3.2 Selecting exception
Pay attention, **you should only add resonable course to target list**.

NOT ALLOWED:
- Course you have already learnt and passed
- Over course quantity limitation
- Course which has time conflict
- More...

A course will be removed from the target list when there is a selecting exception.

### 3.3 Fuzzy target name
You can add fuzzy name to target list instead of course id.

Example
```js
...
  "专选": {
    "enable": true,
    "replace": "",
    "targets": [{
      // leave it blank to enable fuzzy feature
      "id": "",
      // fuzzy (part of) course name
      // example: 'data' will match 'database'
      // actually, name will be used as a RegExp to test course list
      "name": "data"
      "comment": "I want database"
    }]
  }
...
```

The `name` fill will be used as a `RegExp` to test course list, it will select the every selectable matching course.

Note: once there's a fuzzy target in list, this program will never end.

## 4. Run
```bash
npm start
```

## 5. Wechat Inform
![](http://ocphk5wc7.bkt.clouddn.com//17-6-30/81776303.jpg)

If you want to receive a **wechat message** for selecting progress, these fields in `/config/index.js` are required.

```js
// should be true if you want it to work
exports.wechatInform = true;

// App ID of test account
exports.appid = secret.appid;

// App Secret of test account
exports.appsecret = secret.appsecret;

// Template ID of message
exports.template_id = secret.template_id;
```

You can get your own `appid`, `appsecret` and `template_id` in [wechat test account](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login).

### 5.1 Template
There should be `status` and `message` field in your template.

Example
```
status: {{status.DATA}}

{{message.DATA}}
```

More infomation about [wechat-inform](https://github.com/Andiedie/wechat-inform).

## Ⅴ. License
MIT
