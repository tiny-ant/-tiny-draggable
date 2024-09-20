/* eslint-disable quotes */

type PatternContext =
  | 'JSString'
  | 'JSXString'
  | 'TemplateString'
  | 'JSXText'
  | 'JSXTextWithExp'
  | 'HTMLText'

type Pattern = {
  pattern: RegExp
  /**
   * 匹配的内容所处语境
   * JSString 单引号字符串
   * JSXString 双引号字符串
   * TemplateString 模板字符串
   * JSXText JSX文本（如果包含大括号，大括号中的内容将视为JS表达式）
   * HTMLText HTML文本（反斜杠将不被识别为转义字符，而是代表字符本身）
   */
  context: PatternContext
  /** [可选], 根据模式匹配的结果验证是否需要处理当前匹配结果，如果返回false则跳过本次匹配 */
  validate?: (...s: (string | number)[]) => boolean
  /** [可选], 自定义替换逻辑，该函数返回的两个字符串将分别替换当前正则所匹配到的`(文本)`分组结果和i18n.t函数所使用的key。 */
  replacer?: (tfuncName: string, ...s: (string | number)[]) => [string, string]
}

const tFuncName = 'T'

/**
 * 根据表达式推断出一个相对合理的变量名称
 * @param str {输入表达式}
 * @returns {string} 变量名称
 */
function genVarName(str) {
  if (/^\w+$/.test(str)) {
    return str
  }
  str = str.replace(/'(?:[^'\n\\]|\\.)*'/g, '').replace(/\.(\w+)(?=\()/, ($0, $1) => {
    if ($1 === 'length') return $0
    // eslint-disable-next-line no-prototype-builtins
    return String.prototype.hasOwnProperty($1) || Array.prototype.hasOwnProperty($1) ? '' : $0
  })

  // 如果找到函数调用，尝试从调用参数中取
  let matches = str.match(/([a-zA-Z_]\w{2,})\(([^)]*)\)/)

  if (matches) {
    const [, funcName, paramExp] = matches

    // 如果函数参数是复杂表达式，从参数中提取
    if (/\.\w+$|\w+[\])]$/.test(paramExp)) {
      str = paramExp
    } else if (
      funcName.length < 16 &&
      !['String', 'Number', 'stringify', 'parse'].includes(funcName)
    ) {
      str = funcName
    } else if (/^[a-zA-Z]/.test(paramExp)) {
      str = paramExp
    } else {
      str = funcName
    }
  }

  matches = str.match(/(?<=\w*\.)[a-zA-Z_]\w{2,}/)

  if (matches) {
    return matches[0]
  }
  return (str.match(/[a-zA-Z_]\w{2,}/) || [])[0] || 'value'
}

const isCountableUnit = (unit: string) => '个张条项行列天秒分次页'.indexOf(unit) >= 0

/**
 * 包含表达式的字符串模板或JSX文本模板翻译替换工具。
 * 返回数组的两个值分别为i18n.t函数的第一、第二个参数的字符串表示
 * @param T t函数名称
 * @param _ 当前正则本次所匹配的内容
 * @param tplText 子匹配，对应查找到的中文内容
 * @param expWithBrace 子匹配，内容为模板字符串或JSX文本中的表达式部分（包含括号语法字符）
 * @param unit 紧接表达式后的第一个汉字，用以单复数识别
 * @returns {string[]} [i18nKey, 参数对象]
 */
function defaultBraceExpReplacer(_: string, tplText: string, expWithBrace: string, unit: string) {
  const varExp = expWithBrace.replace(/^\$?\{|\}$/g, '').trim()
  const tKeyVar = genVarName(varExp)
  const hasPlurals = isCountableUnit(unit)
  const tKey = tplText.replace(expWithBrace, hasPlurals ? '{count}' : `{${tKeyVar}}`)
  const expObj =
    /^\w+$/.test(varExp) && !hasPlurals
      ? `{ ${varExp} }`
      : String(expWithBrace)
          .replace(/^\$?\{\s*/, ($0) => {
            const prefix = $0.endsWith('{') ? '{ ' : $0.replace(/^\$/, '')
            return hasPlurals ? `${prefix}count: ` : `${prefix}${tKeyVar}: `
          })
          .replace(/(?<!\s)\}$/, ' }')

  // console.log({ tplText, expObj, tKey, tKeyVar, varExp, expWithBrace, unit });
  return [tKey, expObj]
}

export default {
  /**
   * i18n格式化函数名称
   */
  tFuncName,
  /**
   * "导出i18n实例对象及T函数的定义文件"import路径
   */
  tFuncImportPath: 'common/i18n',
  /**
   * 供提取对照分析用的语言资源数据。
   */
  resource: import('~/i18n/locales/en'),

  defaultNS: 'translation',
  /**
   * 需要扫描处理的源代码目录
   * @params souceDir string[]
   */
  sourceDir: ['src', 'common/core', 'mobile/src'],
  /**
   * 要排除的路径（匹配规则：路径包含），优先级高于`includes`选项
   */
  excludes: ['/locales/', '/__tests__', '__test__', '__mock__', '__mocks__'],
  /**
   * 要处理的文件类型
   */
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  /**
   * 指定不同context中的内容匹配模式（为了不匹配纯英文内容，请确保每个pattern匹配结果包含中文！）
   * NOTE! 只能匹配单行内容，否则会有匹配错误的风险！
   */
  contextPatterns: {
    JSString: /(?:[^'\n\\]|\\.)*[\u4E00-\u9FA5]+(?:[^'\n\\]|\\.)*/,
    JSXString: /(?:[^"\n\\]|\\.)*[\u4E00-\u9FA5]+(?:[^"\n\\]|\\.)*/,
    TemplateString: /(?:[^`{\n\\]|\\.)*[\u4E00-\u9FA5]+(?:[^`{\n\\]|\\.)*/,
    JSXText: /(?:[^<{}\n])*[\u4E00-\u9FA5]+(?:[^<{}\n])*/,
    HTMLText: /(?:[^<\n])*[\u4E00-\u9FA5]+(?:[^<\n])*/,
  } as Record<PatternContext, RegExp>,
  /**
   * 提取正则配置列表
   *
   * validate 验证是否执行内容提取和替换，函数签名与String.prototype.replace方法的replacer回调一致，函数参数中子匹配的索引可直接参照由`pattern`所构造的正则对应匹配结果；
   * 如需手动修改，注意：
   * 1. pattern须包含'(文本)'占位符（将被替换为实际匹配的内容），或者包含命名为'文本'的模式分组（例如 `xxx(?<文本>xxx)xxx`）；
   * 2. 转义请使用双斜杠；
   * 3. 模板字符串、包含表达式的内容应该优先替换处理，以保证复杂模式识别的准确性
   */
  patterns: [
    // {
    //   // 匹配JSX文本表达式内含模板字符串的复杂场景
    //   pattern: /xxx/,
    //   context: 'JSXTextWithExp',
    //   replacer: defaultBraceExpReplacer,
    //   validate(_, $1: string, expWithBrace: string) {
    //     // 表达式中有可能包含JSX（如果有则不翻译）
    //     return !/<.*>/.test(expWithBrace);
    //   },
    // },
    {
      // 模板字符串 eg. `...中文..${exp}...`
      pattern:
        /`(?<文本>(?:[^\\`\n{]|\\.)*[\u4E00-\u9FA5]+(?:[^\\`\n{]|\\.)*(\$\{\s*[^\n}]+\s*\}) ?([\u4E00-\u9FA5])?(?:[^\\`\n{]|\\.)*)`/,
      context: 'TemplateString',
      replacer: defaultBraceExpReplacer,
    },
    {
      // 模板字符串 eg. `...${exp}..中文...`
      pattern:
        /`(?<文本>(?:[^\\`{]|\\.)*(\$\{\s*[^\n}]+\s*\}) ?([\u4E00-\u9FA5])?[\u4E00-\u9FA5]+(?:[^\\`{]|\\.)*)`/,
      context: 'TemplateString',
      replacer: defaultBraceExpReplacer,
    },
    {
      // JSX文本 label：{var}: eg. >标签：{exp}<
      // exp = [\w\s\u4E00-\u9FA5>=<?:!.\-+*%'[\]()]+
      pattern:
        /(?<=[</\w"}])>(?:[-=+*#\s]|\[\d+\]|\d+[:.]|&\w+;)*(?<文本>[^>{\n]*?[\u4E00-\u9FA5]+[^>{\n]*?)(?:[\s：:]|&\w+;)*\{\s*[^\n}]+\s*\}\s*(?=<\/?\w+>|<\w+\s?\/?>|<\/?>|<\w+\s+\w+[=\s>/])/,
      context: 'JSXText',
    },
    {
      // JSX文本包含变量: eg. >...中文...{exp}...<
      // <span>成功导入{value.length}条数据</span>
      // =>
      // <span>{T('成功导入{count}条数据', { count: value.length })}</span>
      pattern:
        /(?<=[</\w"}]\s*)>(?:[-=+*#\s]|\[\d+\]|\d+[:.]|&\w+;)*(?<文本>[^>{\n]*[\u4E00-\u9FA5]+[^>{\n]*(\{\s*[^\n}]+\s*\}) ?([\u4E00-\u9FA5])?[^>{\n]*?)(?:[\s：:]|&\w+;|\{'\s+'\})*(?=<\/?\w+>|<\w+\s?\/?>|<\/?>|<\w+\s+\w+[=\s>/])/,
      context: 'JSXTextWithExp',
      replacer: defaultBraceExpReplacer,
      validate(_, $1: string, expWithBrace: string) {
        // 表达式中有可能包含JSX（如果有则不翻译）
        return !/<.*>/.test(expWithBrace)
      },
    },
    {
      // JSX文本包含变量，且变量后紧接中文: eg. >...{exp}中文...<
      // <span>成功导入{value.length}条数据</span>
      // =>
      // <span>{T('成功导入{count}条数据', { count: value.length })}</span>
      pattern:
        /(?<=[</\w"}]\s*)>(?:[-=+*#\s]|\[\d+\]|\d+[:.]|&\w+;)*(?<文本>[^>{\n]*(\{\s*[^\n}]+\s*\}) ?([\u4E00-\u9FA5])[^>{\n]*)(?:[\s：:]|&\w+;|\{'\s+'\})*(?=<\/?\w+>|<\w+\s?\/?>|<\/?>|<\w+\s+\w+[=\s>/])/,
      context: 'JSXTextWithExp',
      replacer: defaultBraceExpReplacer,
      validate(_, $1: string, expWithBrace: string) {
        // 表达式中有可能包含JSX（如果有则不翻译）
        return !/<.*>/.test(expWithBrace)
      },
    },
    {
      // JSX文本包含变量: eg. >...{exp}...中文...<
      // <span>成功导入{value.length}条数据</span>
      // =>
      // <span>{T('成功导入{count}条数据', { count: value.length })}</span>
      pattern:
        /(?<=[</\w"}]\s*)>(?:[-=+*#\s]|\[\d+\]|\d+[:.]|&\w+;)*(?<文本>[^>{\n]*(\{\s*[^\n}]+\s*\}) ?([\u4E00-\u9FA5])?[^>{\n]*[\u4E00-\u9FA5]+[^>{\n]*?)(?:[\s：:]|&\w+;|\{'\s+'\})*(?=<\/?\w+>|<\w+\s?\/?>|<\/?>|<\w+\s+\w+[=\s>/])/,
      context: 'JSXTextWithExp',
      replacer: defaultBraceExpReplacer,
      validate(_, $1: string, expWithBrace: string) {
        // 表达式中有可能包含JSX（如果有则不翻译）
        return !/<.*>/.test(expWithBrace)
      },
    },
    {
      // JSX纯文本: eg. >...中文...<
      // 注意后文判断不要消耗匹配字符（使用 (?=...)）
      pattern:
        /(?<=[</\w"}]\s*)>(?:[-=+*#\s]|\[\d+\]|\d+[:.]|&\w+;)*(文本)(?:[\s：:]|&\w+;|\{'\s+'\})*(?=<\/?\w+>|<\w+\s?\/?>|<\/?>|<\w+\s+\w+[=\s>/])/,
      context: 'JSXText',
    },
    {
      // JSX属性: eg. placeholder="输入文件夹名称" => placeholder={T('输入文件夹名称')}
      // 特殊情况：
      // 1. Select, Radio, Option等表单控件的value值作为枚举类型，跳过翻译
      pattern: /\s(\w+=)"(文本)"/,
      context: 'JSXString',
      validate: (_, $1) => !['key=', 'value=', 'defaultValue='].includes(String($1)),
    },
    {
      // JS对象属性值: eg. label: '类型' => label: T('类型')
      // 特殊情况：
      // 1. event_name: 'xxx' 视为埋点事件名称，不处理
      // 2. value: 'xxx' 可能为select等列表选项的枚举值，不处理
      pattern: /(\w+:\s*|'(?:[^'\n\\]|\\.)+':\s*)'(文本)'/,
      context: 'JSString',
      validate: (_, $1) => $1 !== 'event_name: ' && $1 !== 'value: ',
    },
    {
      // JS变量或对象属性赋值: eg. const label = '类型'; obj.label =
      // 注：大写开头的变量视为常量，不进行提取或翻译
      pattern: /\b(\.?[a-z][\w.]+) =\n?\s+'(文本)'/,
      context: 'JSString',
      validate: (_, $1) => $1 !== '.value',
    },
    {
      // || 默认文案: eg. errMsg || '保存失败' => errMsg || T('保存失败')
      pattern: /(\|\|\n?\s+)'(文本)'/,
      context: 'JSString',
    },
    {
      // 函数参数: eg. showError('错误') => showError(T('错误'))
      pattern: /\b([\w.[\]()]{2,})\(\s*'(文本)'\s*\)/,
      context: 'JSString',
      validate: (_, $1) =>
        ![
          tFuncName,
          'console.log',
          '.concat',
          '.split',
          '.indexOf',
          '.lastIndexOf',
          '.includes',
          '.startsWith',
          '.endsWith',
        ].some((v) => String($1).endsWith(v)),
    },
    {
      // 替换三元表达式: eg. lng === 'zh' ? '工号' : 'Account'
      pattern: /\? '(文本)'\s+:/,
      context: 'JSString',
    },
    {
      // 替换三元表达式: eg. lng === 'en' ? 'Account' : '用户名'
      // pattern: /\?\s+[^:]+ : '(文本)'/,
      pattern:
        /\?\n?(?:[\w\s[\]._()+\-*%|<>!=&^/]|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)+\n?\s+:\n?\s+'(文本)'/,
      context: 'JSString',
    },
    {
      // return '中文内容'
      pattern: /return '(文本)'/,
      context: 'JSString',
    },
    // {
    //   // 数组或函数参数列表的中文字符串（匹配单行）
    //   pattern: /(?<=\[|, )'(文本)'(?=,\s*|\s*\])/,
    //   context: 'JSString',
    // },
    // {
    //   // 独占一行的中文字符串
    //   pattern: /(?<=[,\[]\n\s*)'(文本)'(?=,|\n|\]|\))/,
    //   context: 'JSString',
    // },
  ] as Pattern[],
  /**
   * 输出新增文案同时自动翻译为目标语言（在google翻译可用的情况下）
   */
  targetLang: 'en',
}
