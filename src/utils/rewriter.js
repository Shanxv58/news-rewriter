import { synonyms, transitions, introTemplates, opinionTemplates, titleTemplates } from './synonyms.js'

/**
 * 规则改写引擎 - 完全免费离线
 */

// 工具函数：随机选择数组中的元素
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 工具函数：打乱数组
function shuffle(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 工具函数：随机布尔值
function randomBool(probability = 0.5) {
  return Math.random() < probability
}

/**
 * 同义词替换
 * 将文本中的词替换为同义词
 */
function replaceSynonyms(text) {
  let result = text
  const synonymKeys = Object.keys(synonyms)

  for (const key of synonymKeys) {
    // 跳过单字词，避免误替换
    if (key.length < 2) continue

    const regex = new RegExp(key, 'g')
    const matches = result.match(regex)
    if (!matches) continue

    result = result.replace(regex, () => {
      if (randomBool(0.7)) {
        return randomPick(synonyms[key])
      }
      return key
    })
  }
  return result
}

/**
 * 句式变换 - 主动句变被动句
 */
function activeToPassive(sentence) {
  // 匹配 "A把B+动词" 或 "A将B+动词" 的句式
  const patterns = [
    { regex: /^(.+?)把(.+?)(了|过)?(.+?)$/, transform: (m) => `${m[2]}被${m[1]}${m[3] || ''}${m[4]}` },
    { regex: /^(.+?)将(.+?)(了|过)?(.+?)$/, transform: (m) => `${m[2]}被${m[1]}${m[3] || ''}${m[4]}` },
    { regex: /^(.+?)让(.+?)(了|过)?(.+?)$/, transform: (m) => `${m[2]}被${m[1]}使得${m[3] || ''}${m[4]}` },
  ]

  for (const pattern of patterns) {
    const match = sentence.match(pattern.regex)
    if (match) {
      return pattern.transform(match)
    }
  }
  return sentence
}

/**
 * 句式变换 - 肯定句变双重否定
 */
function positiveToDoubleNegative(sentence) {
  const patterns = [
    { regex: /一定会/g, replacement: '不会不' },
    { regex: /必须/g, replacement: '不得不' },
    { regex: /都能/g, replacement: '不能不' },
    { regex: /应该/g, replacement: '不该不' },
    { regex: /一定要/g, replacement: '不得不' },
    { regex: /肯定会/g, replacement: '不可能不' },
    { regex: /需要/g, replacement: '不能不需要' },
    { regex: /值得/g, replacement: '不是不值得' },
  ]

  let result = sentence
  let changed = false
  for (const pattern of patterns) {
    if (pattern.regex.test(result) && randomBool(0.3)) {
      result = result.replace(pattern.regex, pattern.replacement)
      changed = true
    }
  }
  return result
}

/**
 * 长句拆分为短句
 */
function splitLongSentence(sentence) {
  if (sentence.length < 20) return sentence

  // 在逗号、分号处拆分
  const splitters = ['，', '；', '，而且', '，同时']
  for (const splitter of splitters) {
    const idx = sentence.indexOf(splitter)
    if (idx > 5 && idx < sentence.length - 5 && randomBool(0.3)) {
      const part1 = sentence.substring(0, idx)
      const part2 = sentence.substring(idx + splitter.length)
      if (part2.length > 5) {
        return part1 + '。' + part2.charAt(0).toUpperCase() + part2.slice(1)
      }
    }
  }
  return sentence
}

/**
 * 短句合并为长句
 */
function mergeShortSentences(sentences) {
  const result = []
  let i = 0
  while (i < sentences.length) {
    if (i < sentences.length - 1 && sentences[i].length < 15 && sentences[i + 1].length < 15 && randomBool(0.3)) {
      const connectors = ['，并且', '，同时', '，而且', '，更是']
      result.push(sentences[i].replace(/[。！？]$/, '') + randomPick(connectors) + sentences[i + 1])
      i += 2
    } else {
      result.push(sentences[i])
      i++
    }
  }
  return result
}

/**
 * 添加过渡词
 */
function addTransitions(paragraphs) {
  const allTransitions = [
    ...transitions.sequential,
    ...transitions.contrastive,
    ...transitions.causal,
    ...transitions.conclusive
  ]

  const result = paragraphs.map((para, idx) => {
    if (idx === 0) return para
    if (randomBool(0.5)) {
      const trans = randomPick(allTransitions)
      return trans + '，' + para.charAt(0).toLowerCase() + para.slice(1)
    }
    return para
  })
  return result
}

/**
 * 生成开头引导语
 */
function generateIntro(title) {
  const topic = title.replace(/[？?！!。.，,、]/g, '').substring(0, 20)
  const template = randomPick(introTemplates)
  return template.replace('{topic}', topic)
}

/**
 * 添加个人观点
 */
function addOpinion(text) {
  const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0)
  if (sentences.length < 3) return text

  // 在随机位置插入观点
  const insertPos = Math.floor(sentences.length * 0.6) + Math.floor(Math.random() * sentences.length * 0.3)
  const opinion = randomPick(opinionTemplates)
  sentences.splice(Math.min(insertPos, sentences.length - 1), 0, opinion)

  return sentences.join('。').replace(/。。/g, '。') + '。'
}

/**
 * 改写标题
 */
export function rewriteTitle(title) {
  const styles = Object.keys(titleTemplates)
  const style = randomPick(styles)
  const template = randomPick(titleTemplates[style])
  let newTitle = template.replace('{title}', title)

  // 同时对标题做同义词替换
  newTitle = replaceSynonyms(newTitle)

  return newTitle
}

/**
 * 文本按句子拆分
 */
function splitToSentences(text) {
  return text.split(/(?<=[。！？；])/g).filter(s => s.trim().length > 0)
}

/**
 * 文本按段落拆分
 */
function splitToParagraphs(text) {
  return text.split(/\n+/).filter(p => p.trim().length > 0)
}

/**
 * 段落内句子重排（保持首尾不变，中间打乱）
 */
function reorderSentencesInParagraph(paragraph) {
  const sentences = splitToSentences(paragraph)
  if (sentences.length <= 2) return paragraph

  const first = sentences[0]
  const last = sentences[sentences.length - 1]
  const middle = sentences.slice(1, -1)

  if (middle.length <= 1) return paragraph

  // 打乱中间句子（确保顺序确实改变了）
  let shuffled
  let attempts = 0
  do {
    shuffled = shuffle(middle)
    attempts++
  } while (shuffled.join('') === middle.join('') && attempts < 10)

  return [first, ...shuffled, last].join('')
}

/**
 * 主改写函数
 * @param {string} text - 原文
 * @param {Object} options - 改写选项
 * @param {string} options.style - 改写风格: formal/casual/analysis/sharp
 * @param {string} options.length - 文章长度: short/medium/long
 * @param {boolean} options.addOpinion - 是否添加个人观点
 * @param {boolean} options.addIntro - 是否添加开头引导语
 * @param {string} options.title - 原文标题
 * @returns {Object} { title, content, stats }
 */
export function rewriteArticle(text, options = {}) {
  const {
    style = 'formal',
    length = 'medium',
    addOpinion = false,
    addIntro = true,
    title = ''
  } = options

  const startTime = Date.now()

  // 1. 改写标题
  const newTitle = title ? rewriteTitle(title) : ''

  // 2. 段落拆分
  let paragraphs = splitToParagraphs(text)

  // 3. 每段进行句子级改写
  paragraphs = paragraphs.map(para => {
    // 3.1 同义词替换
    let result = replaceSynonyms(para)

    // 3.2 句式变换
    let sentences = splitToSentences(result)
    sentences = sentences.map(sent => {
      let s = sent.trim()
      if (!s) return s

      // 主动转被动（概率触发）
      if (randomBool(0.2)) {
        s = activeToPassive(s)
      }

      // 肯定转双重否定（概率触发）
      if (randomBool(0.1)) {
        s = positiveToDoubleNegative(s)
      }

      // 长句拆分（概率触发）
      if (s.length > 25 && randomBool(0.3)) {
        s = splitLongSentence(s)
      }

      return s
    })

    // 3.3 短句合并
    sentences = mergeShortSentences(sentences)

    // 3.4 句子重排
    result = reorderSentencesInParagraph(sentences.join(''))

    return result
  })

  // 4. 段落重排（保持首尾不变）
  if (paragraphs.length > 2) {
    const first = paragraphs[0]
    const last = paragraphs[paragraphs.length - 1]
    const middle = paragraphs.slice(1, -1)
    let shuffledMiddle
    let attempts = 0
    do {
      shuffledMiddle = shuffle(middle)
      attempts++
    } while (shuffledMiddle.join('') === middle.join('') && attempts < 10)
    paragraphs = [first, ...shuffledMiddle, last]
  }

  // 5. 添加过渡词
  paragraphs = addTransitions(paragraphs)

  // 6. 添加开头引导语
  if (addIntro && title) {
    const intro = generateIntro(title)
    paragraphs.unshift(intro)
  }

  // 7. 添加个人观点
  if (addOpinion) {
    const lastPara = paragraphs[paragraphs.length - 1]
    paragraphs[paragraphs.length - 1] = addOpinion(lastPara)
  }

  // 8. 根据风格微调
  paragraphs = applyStyle(paragraphs, style)

  // 9. 根据长度截取或扩展
  let content = paragraphs.join('\n\n')
  content = adjustLength(content, length)

  const elapsed = Date.now() - startTime

  // 统计改写信息
  const stats = {
    synonymReplaced: countSynonymReplacements(text, content),
    sentenceReordered: true,
    paragraphsReshuffled: paragraphs.length > 2,
    elapsed: elapsed + 'ms',
    originalLength: text.length,
    newLength: content.length
  }

  return { title: newTitle, content, stats }
}

/**
 * 根据风格微调文章
 */
function applyStyle(paragraphs, style) {
  switch (style) {
    case 'casual':
      // 口语化：替换一些书面语为口语表达
      return paragraphs.map(p => {
        let result = p
        const casualMap = {
          '此外': '还有啊',
          '然而': '不过话说回来',
          '因此': '所以嘛',
          '综上所述': '说到底',
          '值得注意的是': '有意思的是',
          '不可忽视': '别忘了',
          '显而易见': '明眼人一看就知道',
          '与此同时': '话说回来',
          '归根结底': '说白了',
        }
        for (const [formal, casual] of Object.entries(casualMap)) {
          if (randomBool(0.5)) {
            result = result.replace(new RegExp(formal, 'g'), casual)
          }
        }
        return result
      })

    case 'analysis':
      // 深度分析：添加分析性表述
      const analysisInserts = [
        '从更深层次来看，',
        '深入剖析可以发现，',
        '追根溯源，',
        '从战略高度审视，',
        '纵观全局，',
      ]
      return paragraphs.map((p, idx) => {
        if (idx > 0 && randomBool(0.3)) {
          return randomPick(analysisInserts) + p
        }
        return p
      })

    case 'sharp':
      // 犀利评论：添加尖锐表述
      const sharpInserts = [
        '说句不好听的，',
        '撕开表面的遮羞布，',
        '别被表面现象蒙蔽了双眼，',
        '真相往往比想象的更扎心——',
        '说白了吧，',
      ]
      return paragraphs.map((p, idx) => {
        if (randomBool(0.3)) {
          return randomPick(sharpInserts) + p
        }
        return p
      })

    case 'formal':
    default:
      return paragraphs
  }
}

/**
 * 调整文章长度
 */
function adjustLength(content, length) {
  const chars = content.length
  const targets = { short: 500, medium: 1000, long: 1500 }
  const target = targets[length] || 1000

  if (chars <= target * 1.2) return content

  // 需要截取
  if (length === 'short') {
    const paragraphs = splitToParagraphs(content)
    // 保留前2-3段
    const keep = paragraphs.slice(0, Math.min(3, paragraphs.length))
    content = keep.join('\n\n')
  }

  return content
}

/**
 * 统计同义词替换数量
 */
function countSynonymReplacements(original, rewritten) {
  let count = 0
  for (const key of Object.keys(synonyms)) {
    if (key.length < 2) continue
    const originalCount = (original.match(new RegExp(key, 'g')) || []).length
    const rewrittenCount = (rewritten.match(new RegExp(key, 'g')) || []).length
    count += Math.max(0, originalCount - rewrittenCount)
  }
  return count
}

export default rewriteArticle
