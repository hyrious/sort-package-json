export interface Rule {
  pathPattern: string | RegExp
  order: string[] | `${'alpha' | 'natural' | 'length'}-${'asc' | 'desc'}`
}

export const defineRule = (pathPattern: Rule['pathPattern'], order: Rule['order']): Rule => {
  return { pathPattern, order }
}

export const matchPath = (pattern: Rule['pathPattern'], path: string) => {
  return typeof pattern == 'string' ? path == pattern : pattern.test(path)
}

let collator: Intl.Collator | undefined
try { collator = new Intl.Collator(undefined, { numeric: true }) } catch {}

const naturalCompare = (a: string, b: string): number => {
  if (collator) return collator.compare(a, b)
  return a.length - b.length || a.localeCompare(b)
}

const knownCompare: Record<Extract<Rule['order'], string>, (a: string, b: string) => number> = {
  "alpha-asc": (a, b) => a.localeCompare(b),
  "alpha-desc": (a, b) => b.localeCompare(a),
  "natural-asc": (a, b) => naturalCompare(a, b),
  "natural-desc": (a, b) => naturalCompare(b, a),
  "length-asc": (a, b) => a.length - b.length,
  "length-desc": (a, b) => b.length - a.length,
}

const cacheKey = '<=>'

const getCompare = (order: Rule['order']): (a: string, b: string) => number => {
  if ((order as any)[cacheKey]) return (order as any)[cacheKey]
  if (typeof order == 'string') return knownCompare[order]
  if (Array.isArray(order)) return (order as any)[cacheKey] = (a: string, b: string): number => {
    const i = order.indexOf(a), j = order.indexOf(b)
    return i >= 0 && j >= 0 && i - j || 0
  }
  return knownCompare['alpha-asc']
}

export const sortArray = (array: string[], order: Rule['order']): string[] => {
  array = array.slice()
  let index = array.indexOf('//'), anchor = ''
  if (index >= 0) {
    anchor = array[index + 1]
    array.splice(index, 1)
  }

  array.sort(getCompare(order))

  if (anchor && (index = array.indexOf(anchor)) >= 0) {
    array.splice(index, 0, '//')
  }

  return array
}

export const defaultRules: Rule[] = [
  defineRule('', [
    '$schema',
    'publisher',
    'name',
    'displayName',
    'type',
    'version',
    'private',
    'description',
    'author',
    'contributors',
    'license',
    'funding',
    'homepage',
    'repository',
    'bugs',
    'keywords',
    'categories',
    'sideEffects',
    'exports',
    'main',
    'module',
    'svelte',
    'unpkg',
    'jsdelivr',
    'jsDelivr',
    'types',
    'typesVersions',
    'bin',
    'icon',
    'files',
    'workspaces',
    'binary',
    'engines',
    'activationEvents',
    'contributes',
    'scripts',
    'peerDependencies',
    'peerDependenciesMeta',
    'dependencies',
    'optionalDependencies',
    'devDependencies',
    'pnpm',
    'overrides',
    'resolutions',
    'husky',
    'simple-git-hooks',
    'lint-staged',
    'eslintConfig',
    'include',
    'exclude',
    'extends',
    'compilerOptions',
    'references',
    'packageManager',
  ]),

  defineRule('files', 'length-asc'),

  defineRule(/^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$/, 'alpha-asc'),

  defineRule(/^(?:resolutions|overrides|pnpm.overrides)$/, 'alpha-asc'),

  defineRule(/^exports.*/, [
    'types',
    'import',
    'require',
    'default',
  ]),

  defineRule(/^(?:gitHooks|husky|simple-git-hooks)$/, [
    'pre-commit',
    'prepare-commit-msg',
    'commit-msg',
    'post-commit',
    'pre-rebase',
    'post-rewrite',
    'post-checkout',
    'post-merge',
    'pre-push',
    'pre-auto-gc',
  ]),

  defineRule('compilerOptions', 'length-asc'),
]
