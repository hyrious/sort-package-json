// Source: https://github.com/microsoft/vscode/blob/main/src/vs/base/common/jsonc.js MIT licensed

// "str" | 'str' | /* str */ | // str | , }
const regexp = /("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g

const stripComments = (content: string) => content.replace(regexp, (match, _str2, _str1, comment2, comment1, comma) => {
  // Remove block comments.
  if (comment2)
    return ''
  // Remove line comments, preserving the end of line.
  else if (comment1) {
    const length = comment1.length
    if (comment1[length - 1] == '\n')
      return comment1[length - 2] == '\r' ? '\r\n' : '\n'
    else
      return ''
  }
  // Remove trailing commas.
  else if (comma)
    return match.slice(1)
  else
    return match
})

export const parse = (content: string): any => {
  const stage1 = stripComments(content)
  try {
    return JSON.parse(stage1)
  } catch {
    const stage2 = stage1.replace(/,\s*([}\]])/g, '$1')
    return JSON.parse(stage2)
  }
}
