/* eslint-disable quotes */

/**
 * 查找源码中的中文内容（根据config文件中配置的正则规则查找）并替换为i18n翻译函数调用。
 * 同时收集新增的翻译keys并输出到json文件中。（手工翻译的内容也将被自动收集）
 */
import { extname, resolve, sep } from 'path'
import { readFileSync, writeFileSync } from 'fs'
// import fetch from 'node-fetch';
// import { HttpsProxyAgent } from 'https-proxy-agent';
import DirWalker from './dir-walker'
import config from './config'

type Extractor = {
  regex: RegExp
  matchIndex: number
  context: string
  validate?: (...s: (string | number)[]) => boolean
  replacer?: (...s: (string | number)[]) => [string, string]
}

if (sep === '\\') {
  config.excludes = config.excludes.map((v) => v.replace(/\//g, '\\'))
  config.sourceDir = config.sourceDir.map((v) => v.replace(/\//g, '\\'))
}

const { resource } = config

const T = config.tFuncName
const tFuncCallToken = `${config.tFuncName}('`
const tFuncImportToken = `from '${config.tFuncImportPath}'`
const tFuncImportDefinition = `import { ${config.tFuncName} } from '${config.tFuncImportPath}';`

const testMode = process.argv.includes('--test')

const decodeChars: [RegExp, string][] = [
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&times;/g, '×'],
  [/&laquo;/g, '«'],
  [/&raquo;/g, '»'],
  [/&quot;/g, '"'],
  [/&amp;/g, '&'],
  [/&copy;/g, ''],
  [/&nbsp;/g, ' '], // 不断开空格（non-breaking-space）
  [/&ensp;/g, ' '], // 半个汉字字宽
  [/&emsp;/g, ' '], // 一个汉字字宽
  [/&lang;/g, '⟨'],
  [/&rang;/g, '⟩'],
  [/&radic;/g, '√'],
]

const decodeHTMLChars = (str: string) =>
  decodeChars.reduce((acc, [reg, v]) => acc.replace(reg, v), str)

// 记录已经提取到语言资源文件中的keys
const existsSet = new Set()

// 保存未翻译的中文
const wordsSet = new Set<string>()

// new RegExp('\\((?!\\?(?::|=|!|<=|<!))[^\\(\\)]+\\)[\\\\\\[a\\]\\)\]\]\\[\\[[^(.)\]]', 'g')
// /\[[^]]*/ => 匹配 '[^', '[^^^', '[^^^]' 等
// /\[[^[]a]$/.exec('abc[]a]')
function getSubMatchesLength(str: string) {
  let len = 0
  let count = -1

  // 替换为'#'号是为了防止特殊符号相遇（例如'('和'?:'原本是分开的，移除一些内容后相遇导致分组丢失）
  // remove chars with slash: \()[]
  str = str.replace(/\\[\\()[\]]/g, '#')
  // remove [] contents that may includes '()' pairs.
  str = str.replace(/\[[^\]]+\]/g, '#')
  // remove () pairs that is not a sub-match
  str = str.replace(/\((?:\?(:|=|!|<=|<!))[^()]+\)/, '#')

  do {
    len = str.length
    str = str.replace(/\((?!\?(?::|=|!|<=|<!))[^()]+\)/, '')
    count += 1
  } while (str.length < len)
  return count
}

const regexEscapeRE = /[-.*+?^${}()|[\]/\\]/g

function regexEscape(str: string) {
  return str.replace(regexEscapeRE, '\\$&')
}

// 判断正则source中是否包含指定的名称分组
function hasNamedGroup(str: string, name: string) {
  if (/[-.*+?^${}()|[\]/\\\s]/g.test(name)) {
    throw Error('ERROR! 命名分组格式非法，请不要包含空格或特殊字符')
  }
  const reg = new RegExp(`(?<${regexEscape(name)}>.*)`, 'g')

  return reg.test(str.replace(/\\[\\()[\]]/g, ''))
}

function buildExtractors(): Extractor[] {
  const { contextPatterns } = config

  return config.patterns.map(({ pattern, context, validate, replacer }) => {
    const patternSource = pattern.source

    if (patternSource.includes('(文本)')) {
      const kwdPattern = contextPatterns[context].source
      const [leftStr, rightStr] = patternSource.split('(文本)')
      const regex = new RegExp(`${leftStr}(?<word>${kwdPattern})${rightStr}`, 'g')
      const matchIndex = (leftStr ? getSubMatchesLength(leftStr) : 0) + 1

      return {
        regex,
        matchIndex,
        context,
        validate,
        replacer,
      }
    } else if (hasNamedGroup(patternSource, '文本')) {
      const [leftStr] = patternSource.split('(?<文本>')
      const regex = new RegExp(patternSource.replace('(?<文本>', '(?<word>'), 'g')
      const matchIndex = (leftStr ? getSubMatchesLength(leftStr) : 0) + 1

      return {
        regex,
        matchIndex,
        context,
        validate,
        replacer,
      }
    } else {
      throw Error(`正则未包含 "(文本)" 或 "(?<文本>)" 命名分组：${pattern}`)
    }
  })
}

const extractors = buildExtractors()

// 如果有调用多语言函数，添加import
function addImport(text: string) {
  if (text.indexOf(tFuncCallToken) === -1) {
    return text // no translations
  }

  if (text.indexOf(tFuncImportToken) > 0) {
    return text // already imported
  }
  let found = false

  text = text.replace(
    new RegExp("import (?:\\w+,\\s)?(?:\\w+|\\{(?:[\\w\\s,]+\\}))\\sfrom\\s'antd4?';"),
    ($0) => {
      found = true
      return `${$0}\n${tFuncImportDefinition}`
    }
  )
  if (!found) {
    text = text.replace(
      new RegExp("import (?:\\w+,\\s)?(?:\\w+|\\{(?:[\\w\\s,]+\\}))\\sfrom\\s'react';"),
      ($0) => {
        found = true
        return `${$0}\n${tFuncImportDefinition}`
      }
    )
  }
  if (!found) {
    text = `${tFuncImportDefinition}\n${text}`
  }

  return text
}

function addNonExistWord(word: string, context: string) {
  if (!existsSet.has(word) && !existsSet.has(`${word}_one`)) {
    console.log('[find]', context, word)
    wordsSet.add(word)
  }
}

/**
 * 从源码中提取并替换未翻译的中文内容
 */
function findAndReplace(content: string, extractor: Extractor) {
  const { regex, matchIndex: index, context, validate, replacer } = extractor

  return content.replace(regex, (...matches: (string | number)[]) => {
    const $0 = String(matches[0])

    const shouldSkip = validate !== undefined && !validate(...matches)

    if (shouldSkip) {
      // console.log('[skip]', $0);
      return $0
    }

    let source = String(matches[index])
    let i18nKey = source
    let expObj = '{}'

    if (replacer) {
      ;[i18nKey, expObj] = replacer(...matches)
    }
    if (context === 'TemplateString') {
      i18nKey = i18nKey.replace(/\$\{/g, '{')
    } else if (context === 'JSXString') {
      i18nKey = decodeHTMLChars(i18nKey)
    } else if (context === 'JSXText' || context === 'JSXTextWithExp') {
      // 不包含末尾的一些特殊HTML转义符号
      source = source.replace(/(?:[\s\n]|&(?:gt|raquo|radic|nbsp|ensp|emsp);)+$/g, '')
      i18nKey = i18nKey.replace(/(?:[\s\n]|&(?:gt|raquo|radic|nbsp|ensp|emsp);)+$/g, '')
      // 1. HTML编辑字符须解码
      i18nKey = decodeHTMLChars(i18nKey)
      // 2. 斜杠和单引号须转义
      i18nKey = i18nKey.replace(/['\\]/g, '\\$&')
    }

    addNonExistWord(i18nKey, context)

    if (context === 'JSXString') {
      return $0.replace(`"${source}"`, `{${T}('${i18nKey.replace(/\$/g, '$$$$')}')}`)
    }
    if (context === 'JSXText') {
      return $0.replace(source, `{${T}('${i18nKey.replace(/\$/g, '$$$$')}')}`)
    }
    if (context === 'JSString') {
      return $0.replace(`'${source}'`, `${T}('${i18nKey.replace(/\$/g, '$$$$')}')`)
    }
    if (context === 'TemplateString') {
      return $0.replace(`\`${source}\``, `${T}('${i18nKey.replace(/\$/g, '$$$$')}', ${expObj})`)
    }
    if (context === 'JSXTextWithExp') {
      return $0.replace(source, `{${T}('${i18nKey.replace(/\$/g, '$$$$')}', ${expObj})}`)
    }
    return $0
  })
}

function guid() {
  function S4() {
    // eslint-disable-next-line
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`
}

// NOTE! 此正则是匹配文件内容的，出现在源码中的js字符串中的转义字符`\`将表示自身
// 例如： var a = T('I\'m a man'); // 读取到变量content后： content = `var a = T('I\\'m a man');`
const tFuncKeyReg = new RegExp(
  `\\b${T}${/\(\s*'((?:[^'\n\\]|\\.)+)'(?=(?:,\s*(\{[^}]+\}))?\s*\))/.source}`,
  'g'
)

// 文件内容读取将反斜杠读取为字符本身，失去了其转义的含义，这里需要还原所有的反斜杠为转义含义
// eg. (左边为打印结果，右边为文件读取后的字符串表示)
// \' => "\\'"
// \nrest => '\\nrest'
// \\n\rest => '\\\\n\\rest'
const stripSlash = (text: string) =>
  text.replace(/\\\\/g, '\\').replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\t/g, '\t')

function replaceText(content: string) {
  const preserveTrans: Record<string, string> = {}
  let text = content.replace(/<Trans\s[^>]*>(\n|.)*?<\/Trans>/g, ($0) => {
    const randomPlaceholder = `##${guid()}##`
    preserveTrans[randomPlaceholder] = $0
    // TODO existsTransSet.add('...')
    return randomPlaceholder
  })

  // 查找未记录在多语言文件中的T函数调用key
  content.replace(tFuncKeyReg, (_, i18nKey) => {
    // 恢复转义斜杠，并且去掉转义单引号前的反斜杠
    const realKey = stripSlash(i18nKey).replace(/\\'/g, "'")

    if (!realKey.includes('.') || !/^([\w-]+\.)+/.test(realKey)) {
      if (!wordsSet.has(realKey) && !existsSet.has(realKey) && !existsSet.has(`${realKey}_one`)) {
        console.log('[lost]', realKey)
        wordsSet.add(realKey)
      }
    }
    return ''
  })
  // 正则提取资源并替换为t函数
  text = extractors.reduce((str, extractor) => findAndReplace(str, extractor), text)

  // console.log('#########', preserveTrans);

  // 还原<Trans ...>...</Trans>组件代码（注意，无法识别self-closing tag）
  return text.replace(/##[\w-]{36}##/g, ($0) => preserveTrans[$0] || $0)
}

function extractFromFile(filepath: string) {
  let fileContent = readFileSync(filepath, 'utf8')

  fileContent = replaceText(fileContent)
  fileContent = addImport(fileContent)
  return fileContent
}

function extractResource(pathArr: string | string[]) {
  const walker = new DirWalker(pathArr)

  walker.on('file', (filePath: string) => {
    const ext = extname(filePath)

    if (config.excludes.some((token) => filePath.includes(token))) {
      return
    }
    if (!config.extensions.includes(ext.toLowerCase())) {
      return
    }
    writeFileSync(filePath, extractFromFile(filePath))
  })
  walker.once('end', async () => {
    console.log('found', wordsSet.size, 'words.')
    await outputTranslations()
    process.exit(-1)
  })
  walker.start()
}

async function outputTranslations() {
  const newWordsJson: Record<string, string> = {}

  // const agent = new HttpsProxyAgent('http://127.0.0.1:9090');
  const host = 'translate.googleapis.com'

  async function translate(text, sl = 'zh', tl = 'en') {
    return 'failed'
    // const params = new URLSearchParams({
    //   client: 'gtx',
    //   sl,
    //   tl,
    //   // dj: '1',
    //   dt: 't',
    //   q: text,
    // }).toString();

    // const url = `https://${host}/translate_a/single?${params}`;
    // const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

    // const response = await fetch(url, {
    //   method: 'GET',
    //   redirect: 'follow',
    //   timeout: 10000,
    //   headers: {
    //     'User-Agent': userAgent,
    //   },
    //   agent,
    // });
    // const result = await response.json();
    // return Array.isArray(result) ? result[0][0][0] : false;
  }

  let translationServiceAvailable = false

  try {
    const result = await translate('成功', 'zh', config.targetLang)
    translationServiceAvailable = result === 'success'
  } catch (err) {
    translationServiceAvailable = false
    console.log(err)
  }

  if (translationServiceAvailable) {
    console.log('正在调用google翻译...')

    // eslint-disable-next-line no-restricted-syntax
    for (const word of wordsSet.values()) {
      // eslint-disable-next-line no-await-in-loop
      newWordsJson[word] = await translate(word, 'zh', config.targetLang)
    }
  } else {
    ;[...wordsSet.values()].reduce((acc, word) => {
      acc[word] = word
      return acc
    }, newWordsJson)
  }
  writeFileSync(resolve(__dirname, 'results.json'), JSON.stringify(newWordsJson, null, '  '))
}

resource.then(({ default: translations }) => {
  Object.keys(translations).reduce((set, ns) => {
    if (typeof translations[ns] !== 'object') {
      return set
    }
    Object.keys(translations[ns]).forEach((key) => {
      set.add(key)
    })
    return set
  }, existsSet)

  if (testMode) {
    console.log(extractors.map((v) => v.regex))
    const filePath = resolve(__dirname, 'samples.js')
    let fileContent = readFileSync(filePath, 'utf8')
    fileContent = replaceText(fileContent)
    writeFileSync(resolve(__dirname, 'samples-translated.js'), fileContent)
    console.log(`找到 ${wordsSet.size} 个翻译项:\n`)
    console.log([...wordsSet])
  } else {
    extractResource(config.sourceDir)
  }
})

// const filePath2 = resolve(__dirname, 'demo.json');
// const s = `姓名不能包含以下特殊字符：\\'"<>/`;
// const obj = { [s]: s, name: '老五' };
// writeFileSync(filePath2, JSON.stringify(obj, null, '  '));
