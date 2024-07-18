import { defaultRules, defineRule, matchPath, sortArray, type Rule } from './rule'
import { parse } from './jsonc'

export { defineRule, defaultRules, sortArray, type Rule }

const detectIndentAndNewline = (content: unknown): {
  readonly indent: string
  readonly newline: string
} => {
  let indent = '  ' // Fallback to 2 spaces.
  let newline = '\n'
  if (typeof content == 'string') {
    let match1 = content.match(/^(?:( )+|\t+)/m)
    if (match1) {
      indent = match1[0]
    }
    let match2 = content.match(/(?:\r?\n)/)
    if (match2) {
      newline = match2[0]
    }
  }
  return { indent, newline }
}

const dfs = (node: any, visitor: (node: any, path: string) => any, path = ''): void => {
  if (node && typeof node == 'object') {
    if (Array.isArray(node)) node = node.map((child: any, i: number) => {
      return dfs(child, visitor, `${path}[${i}]`)
    })
    else for (const key in node) {
      node[key] = dfs(node[key], visitor, path ? `${path}.${key}` : key)
    }
    node = visitor(node, path) || node
  }
  return node
}

export const readJSON = (content: unknown): any =>
  typeof content == 'string' ? parse(content) : content

export const sortJSON = (content: unknown, rules: Rule[] = defaultRules): string => {
  const { indent, newline } = detectIndentAndNewline(content)

  const json = dfs(readJSON(content), (node, path) => {
    let rule = rules.find(rule => matchPath(rule.pathPattern, path))
    if (rule)
      if (Array.isArray(node))
        return sortArray(node, rule.order)
      else
        return sortArray(Object.keys(node), rule.order).reduce((ret, key) => {
          ret[key] = node[key]
          return ret
        }, {})
  })

  let output = JSON.stringify(json, null, indent)
  if (newline != '\n')
    output = output.replace(/\n/g, newline)
  return output + newline
}
