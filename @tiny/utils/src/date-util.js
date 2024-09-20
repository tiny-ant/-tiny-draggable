/**
 * @file - 常用日期处理函数
 * @author tinyant <YuXiao2@sf-express.com>
 */

// count of milliseconds
const unitScale = {
  week: 7 * 86400000,
  day: 86400000,
  hour: 3600000,
  min: 60000,
  sec: 1000,
  ms: 1,
};

const cnWeekDayNum = ['日', '一', '二', '三', '四', '五', '六'];
const regEscapedStr = /\[([^[\]]*)\]/g;
const regEscapeChar = /[\^.+?${}()\\/]/g;

const DateUtil = {
  /**
   * 按指定格式输出日期时间
   * @param {string} format 指定的格式
   * @param {any} [date=Date.now()] 如果不传，将取当前时间，非Date类型将被作为构造参数转换为Date类型
   * @returns {string} 输出格式化字串
   *
   * @example
   * format('YYYY-MM-DD hh:mm:ss')
   * format('YYYY/MM/DD (星期W)', 1520549579903) // 2018/03/09 (星期五)
   * format('YY年M月DD日 hh:mm:ss 星期W', '2018-03-29T11:12:06.283Z') // 18年3月29日 19:12:06 星期四
   */
  format(format, date = Date.now()) {
    date = new Date(date);

    // invalid date
    if (isNaN(date.getMonth())) {
      return '';
    }

    const o = {
      'M+': date.getMonth() + 1,
      'D+': date.getDate(),
      'd+': date.getDate(),
      'H+': date.getHours(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'W+': cnWeekDayNum[date.getDay()], // week, (getDay() => 0...6)
      'q+': Math.floor((date.getMonth() + 3) / 3), // quarter (1...4)
      S: date.getMilliseconds(),
    };

    if (/(Y+)/i.test(format)) {
      format = format.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
    }

    Object.keys(o).forEach(key => {
      if (new RegExp(`(${key})`).test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? o[key] : `00${o[key]}`.substr(-2)
        );
      }
    });

    return format;
  },

  /**
   * 根据日期值推断其格式，仅判断常见的格式
   * 仅保证以下格式的正常处理:
   * 年
   * 年月
   * 年月日
   * 年月日 时分
   * 年月日 时分秒
   * 年月日 时分秒 豪秒
   */
  inferDateFormat(value) {
    return value
      .replace(/\d\d\d\d/, 'YYYY')
      .replace(/\d\d(?=\/|-|\d|$)/, 'MM')
      .replace(/\d\d(?=\s|$)/, 'DD')
      .replace(/\d\d(?=:)/, 'HH')
      .replace(/\d\d(?=:|$)/, 'mm')
      .replace(/\d\d(?=\.|$)/, 'ss')
      .replace(/\d/g, 'S');
  },

  /**
   * 相对时间转换为指定的时间段描述格式
   * @param {number} ms 时间差值(毫秒)
   * @param {string} format 一个模式字串，表示时间格式，其中`[]`内的部分将被保留，不作匹配
   * @returns {string} 按格式输出的字串
   *
   * @example
   * toTimeStr(2380235435, 'W [weeks] D [days]')  // 3 weeks 6 days
   * toTimeStr(2384454, 'mm"ss\'') // 39"44'
   * toTimeStr(3284354, 'mm[min] ss[sec] SSS[ms]') // 54min 44sec 354ms
   * toTimeStr(13498344, 'hh:mm:ss') // 03:44:58
   * toTimeStr(1112384454, 'W [weeks] D [days] hh [hours] mm"ss\'.SSS ago') // 1 weeks 5 days 20 hours 59"44'.454 ago
   * TODO: buggy 全局替换，现在只替换第一个
   */
  toTimeStr(ms, format) {
    const reservedArr = [];

    format = format.replace(/\[([^[\]]*)\]/g, ($0, $1) => {
      reservedArr.push($1);
      return '[]';
    });

    [
      { key: 'W+', t: 7 * 86400000 },
      { key: 'D+', t: 86400000 },
      { key: 'd+', t: 86400000 },
      { key: 'H+', t: 3600000 },
      { key: 'h+', t: 3600000 },
      { key: 'm+', t: 60000 },
      { key: 's+', t: 1000 },
      { key: 'S+', t: 1 },
    ].forEach(o => {
      if (new RegExp(`(${o.key})`).test(format)) {
        const v = Math.floor(ms / o.t);

        ms -= o.t * v; // `diff` should be the left value
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? v : v >= 100 ? v : `00${v}`.substr(-2)
        );
      }
    });

    return format.replace(/\[\]/g, () => reservedArr.shift());
  },

  /**
   * 按照给定的格式，解析一段格式化的时间或时长描述，返回结果包含了各时间单位对应的值
   * @param {any} timeStr 时间表述串
   * @param {any} format 解析参照的格式，与输出单位属性对应关系为: y=>year, M=>month, W=>week, D=>day, h=>hour, m=>min, s=sec, S=ms
   * @param {boolean} [strict=true] 是否严格模式。在严格模式下，所有格式字符最终都与数字按相等的长度进行匹配，否则，将无法正确匹配类似'yyyyMMdd'这种无非格式字符分隔的格式
   * @returns {object} parse result, holding the value of each unit found.
   *
   * @example
   * parseTimeStr('1 weeks 5 354 5 days days 20 +3 hours 59"44\'.454 ago mm', 'W [weeks] [5] 3D4 [5] [days] [days] hh +3 [hours] mm"ss\'.SSS ago [mm]')
   * => {day:5, hour:20, min:59, ms:454, sec:44, week:1}
   *
   * DateUtil.parseTimeStr("54min 44sec msms", 'mm[min] ss[sec] ms[ms]')  // failed (format does not match)
   *
   * DateUtil.parseTimeStr('201801171126', 'YYYYMMDDHHmmss') // Wed Jan 17 2018 19:29:00 GMT+0800
   */
  parseTimeStr(timeStr, format, strict = true) {
    const o = Object.create(null);
    const reservedArr = [];
    const units = [];

    format = format
      .replace(regEscapedStr, ($0, $1) => {
        reservedArr.push($1);
        return '[]';
      })
      .replace(regEscapeChar, '\\$&')
      .replace(/y+|Y+|M+|W+|D+|d+|H+|h+|m+|s+|S+/g, $0 => {
        // NOTE! 与 /[MWDhmsS]+/g 有区别，同一次只能匹配同一字符
        units.push($0);
        return strict ? `(\\d{${$0.length}})` : '(\\d+)';
      })
      .replace(/\[\]/g, () => reservedArr.shift());

    const results = timeStr.match(new RegExp(format));

    if (!results) {
      return null;
    }
    results.shift();

    units.forEach((unit, index) => {
      switch (true) {
        case /y+/i.test(unit):
          o.year = o.year || parseFloat(results[index]);
          break;
        case /M+/.test(unit):
          o.month = o.month || parseFloat(results[index]);
          break;
        case /W+/.test(unit):
          o.week = o.week || parseFloat(results[index]);
          break;
        case /D+/.test(unit):
          o.day = o.day || parseFloat(results[index]);
          break;
        case /d+/.test(unit):
          o.day = o.day || parseFloat(results[index]);
          break;
        case /H+/.test(unit):
          o.hour = o.hour || parseFloat(results[index]);
          break;
        case /h+/.test(unit):
          o.hour = o.hour || parseFloat(results[index]);
          break;
        case /m+/.test(unit):
          o.min = o.min || parseFloat(results[index]);
          break;
        case /s+/.test(unit):
          o.sec = o.sec || parseFloat(results[index]);
          break;
        case /S+/.test(unit):
          o.ms = o.ms || parseFloat(results[index]);
          break;
        default:
      }
    });
    return o;
  },

  /**
   * 按照给定的格式，解析一段格式化的时间为日期对象
   * WARN! 这个API没有详尽测试，请谨慎使用
   * @param {*} timeStr
   * @param {*} format
   * @param {boolean} [strict=true]
   */
  parseAsFormat(timeStr, format, strict = true) {
    const now = new Date();
    const o = this.parseTimeStr(timeStr, format, strict);

    if (o.year === undefined) {
      o.year = now.getFullYear();
    }

    // NOTE! month is 0~11, and the default day should be 1, not 0 !
    return new Date(
      o.year,
      (o.month || 1) - 1,
      o.day || 1,
      o.hour || 0,
      o.min || 0,
      o.sec || 0,
      o.ms || 0
    );
  },

  /**
   * 将相对时间解析为毫秒数值
   * @see {@link parseTimeStr}
   * @param {string} timeStr 时间表述串
   * @param {string} format 解析参照时间格式
   * @returns {number} 毫秒数
   */
  toMilliSeconds(timeStr, format, strict = true) {
    let ms = 0;
    const values = this.parseTimeStr(timeStr, format, strict);

    Object.keys(values).forEach(key => {
      switch (key) {
        case 'week':
          ms += values[key] * 7 * 86400000;
          break;
        case 'day':
          ms += values[key] * 86400000;
          break;
        case 'hour':
          ms += values[key] * 3600000;
          break;
        case 'min':
          ms += values[key] * 60000;
          break;
        case 'sec':
          ms += values[key] * 1000;
          break;
        case 'ms':
          ms += values[key];
          break;
        default:
      }
    });
    return ms;
  },

  /**
   * 日期加（减）法操作
   * @param {string|number} inc increments of milliseconds, or the time string in a 'hh:mm:ss' format.
   * @param {any} [date=Date.now()] 任意可转换为日期的值
   * @returns {object} 新的日期对象
   *
   * NOTE! 未详尽测试，慎用
   *
   * @example
   * add('02:30:00'); // 2.5 hour later from now
   * add(3000); // add 3 seconds
   */
  add(inc, date = Date.now()) {
    if (isNaN(date)) {
      date = new Date(date);

      // invalid date
      if (isNaN(date.getMonth())) {
        return null;
      }
    }

    if (typeof inc === 'string') {
      inc = this.toMilliSeconds(inc, 'dd hh:mm:ss', false);
    }

    return new Date(+date + inc);
  },

  /**
   * 判断给定日期是否今天
   * @param {any} date 输入日期对象、时间戳或时间格式串
   * @returns {boolean} true/false
   */
  isToday(date) {
    date = new Date(date);
    return (
      Math.abs(+date - Date.now()) < 3600 * 1000 * 24 && date.getDate() === new Date().getDate()
    );
  },

  /**
   * 判断是否闰年
   * @param {number} year 输入年份
   * @returns {boolean} true/false
   */
  isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  },

  /**
   * 计算两个日期或时间之间的差值
   * @param {any} date1 date1
   * @param {any} date2 date2
   * @param {string} unit <week|day|hour|minute|second|ms> The specified measurement, default `ms`.
   * @param {number|boolean} [precision=false] The count of decimal digits to keep, returning value should be rounded up unless precision was set to `false`.
   * @returns {boolean} the difference value measured by param `unit`
   */
  diff(date1, date2, unit, precision = false) {
    let count = 0;
    const diff = this.from(date1) - this.from(date2);

    switch (unit) {
      case 'week':
      case 'day':
      case 'hour':
      case 'minute':
      case 'second':
        count = diff / unitScale[unit];
        break;
      default:
        // ms
        count = diff;
    }

    return precision === false ? parseInt(count) : count.toFixed(Number(precision));
  },

  /**
   * 重置日期或时间的某部分
   * @param {string} unit 重设指定的基准单位以下部分
   * @param {object} [date=Date.now()] 要重设的原date对象
   * @returns 重设后的新date对象
   *
   * @example
   * new Date(+startOf('day') + 59*60000+59000).toLocaleString() // 2018/4/12 上午12:59:59
   * new Date(+startOf('day') + 59*60000+59000 + 1000).toLocaleString() // 2018/4/12 上午1:00:00
   */
  startOf(unit, date = Date.now()) {
    date = new Date(date); // try a type conversion, or, make a copy, lest the referenced object be modified.
    // invalid date
    if (isNaN(date.getMonth())) {
      return null;
    }
    switch (unit) {
      case 'year':
        date.setMonth(0); // 0...11
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        break;
      case 'month':
        date.setDate(1); // NOTE! 是1不是0 (1...31)
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        break;
      case 'day':
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        break;
      case 'hour':
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        break;
      case 'minute':
        date.setSeconds(0);
        date.setMilliseconds(0);
        break;
      case 'second':
        date.setMilliseconds(0);
        break;
      default:
    }
    return date;
  },

  /**
   * parse a string or a number to a Date Object
   * @param {string} source input value
   */
  from(source) {
    let date;

    switch (source) {
      case 'today':
        return DateUtil.startOf('day');
      case 'yesterday':
        // return DateUtil.add(-86400000, DateUtil.startOf('day'));
        return DateUtil.startOf('day', Date.now() - 3600 * 1000 * 24);
      case 'tomorrow':
        // return DateUtil.add(+86400000, DateUtil.startOf('day'));
        return DateUtil.startOf('day', Date.now() + 3600 * 1000 * 24);
      case 'this week': {
        // NOTE: 以周一为开始
        date = new Date();
        return DateUtil.startOf('day', +date - 3600 * 1000 * 24 * ((date.getDay() + 6) % 7));
      }
      case 'last week': {
        date = new Date();
        return DateUtil.startOf('day', +date - 3600 * 1000 * 24 * (7 + ((date.getDay() + 6) % 7)));
      }
      case 'next week': {
        date = new Date();
        return DateUtil.startOf('day', +date + 3600 * 1000 * 24 * (7 - ((date.getDay() + 6) % 7))); // NOTE! 日期对象不能直接做加法，减法可以！
      }
      case 'this month':
        return DateUtil.startOf('month');
      case 'last month':
        return DateUtil.startOf('month', +new Date(+DateUtil.startOf('month') - 1));
      case 'next month': {
        date = DateUtil.startOf('month');
        date.setMonth(date.getMonth() + 1);
        return date;
      }
      case 'this year':
        return new Date(`${new Date().getFullYear()}/01/01 00:00:00`);
      case 'last year':
        return new Date(`${new Date().getFullYear() - 1}/01/01 00:00:00`);
      case 'next year':
        return new Date(`${new Date().getFullYear() + 1}/01/01 00:00:00`);
      default: {
        if (typeof source === 'string') {
          if (/^\d{8}$/.test(source)) {
            return DateUtil.parseAsFormat(source, 'yyyyMMdd');
          }
          if (/^\d{6}$/.test(source)) {
            return DateUtil.parseAsFormat(source, 'yyyyMM');
          } else if (isNaN(source)) {
            source = source.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
          }
        }

        if (!isNaN(source)) {
          return new Date(Number(source));
        }

        // 不带时分秒时，yyyy-MM-dd和yyyy/MM/dd两种格式的构造是有差别的，yyyy/MM/dd是按当地时区构造，而yyyy-MM-dd则是按格林威治时区构造，三大浏览器表现基本一致
        // 带时分秒时，年月日的yyyy-MM-dd和yyyy/MM/dd两种格式均按当地时区构造，在chrome和ff下无差别，但是yyyy-MM-dd的格式在IE11下无法构造日期对象
        // 带毫秒时，如果以HH:mm:ss.SSS格式结束，yyyy/MM/dd在firefox和IE11下都构造不了对象，chrome可以，并且是按当地时区构造的对象
        // 带毫秒，并且毫秒后带Z时，按照格林威治时区构造，其中IE11还必须在年月日后以T字符分割才能构造对象(即严格的ISO格式才能构造)
        // 以下处理不保证IE11正常，但基本保证了firefox和chrome正常
        source = String(source).replace(
          /\d{4}([/-])\d{1,2}([/-]\d{1,2})?$/,
          ($0, seperator, day) => `${day ? $0 : `${$0}${seperator}01`} 00:00:00`
        );
        // TODO: 兼容safari
        source = String(source)
          .replace(/\//g, '-')
          .replace(/(\d\d)(:\d\d)(:\d\d)?(\.\d\d\dZ?)?$/, '$1$2$3$4');

        return new Date(source);
      }
    }
  },
};

/*
// test cases
[
  [2380235435, 'W [weeks] D [days]'],
  [2384454, 'mm"ss\''],
  [3284354, 'mm[min] ss[sec] SSS[ms]'],
  [13498344, 'hh:mm:ss'],
  [1112384454, 'W [weeks] D [days] hh [hours] mm"ss\'.SSS ago'],
].forEach((g) => {
  const [ms, format] = g;
  const timeStr = DateUtil.toTimeStr(ms, format);
  const parsedMs = DateUtil.toMilliSeconds(timeStr, format);
  console.assert( DateUtil.toTimeStr(parsedMs, format) === timeStr, g);
});
*/

export default DateUtil;
