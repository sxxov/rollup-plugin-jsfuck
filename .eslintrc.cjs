module.exports = {
	parserOptions: {
		ecmaVersion: 11,
	},
	env: {
		node: true,
		browser: true,
	},
	rules: {
		'no-param-reassign': ['off'],
		'import/no-unresolved': ['off'],
		'lines-between-class-members': ['off'],
		'no-multiple-empty-lines': ['warn', { max: 2 }],
		'import/no-mutable-exports': ['off'],
		'import/first': ['off'],
		'max-classes-per-file': ['off'],
		'no-tabs': ['off'],
		'linebreak-style': ['warn', 'windows'],
		'no-underscore-dangle': ['off'],
		'no-plusplus': ['off'],
		'no-console': ['off'],
		'no-new': ['off'],
		'no-use-before-define': ['off'],
		'no-continue': ['off'],
		'import/prefer-default-export': ['off'],
		'import/extensions': [
			'warn',
			'never',
			{
				json: 'always',
				css: 'always',
				utility: 'always',
				error: 'always',
				type: 'always',
				svelte: 'always',
				types: 'always',
				animator: 'always',
				object: 'always',
				factory: 'always',
				factories: 'always',
			},
		],
		'no-await-in-loop': ['off'],

		// kinda prettier
		'array-bracket-newline': [
			'warn',
			{
				multiline: true,
				minItems: 3,
			},
		],
		'array-element-newline': [
			'warn',
			{
				multiline: true,
				minItems: 3,
			},
		],
		'multiline-ternary': ['warn', 'always-multiline'],
		'object-property-newline': ['warn', { allowAllPropertiesOnSameLine: false }],
		'function-paren-newline': ['warn', 'multiline-arguments'],
		'object-curly-newline': [
			'warn',
			{
				consistent: true,
				minProperties: 2,
			},
		],
		'padding-line-between-statements': [
			'warn',
			// Always require blank lines after directive (like 'use-strict'), except between directives
			{
				blankLine: 'always',
				prev: 'directive',
				next: '*',
			},
			{
				blankLine: 'any',
				prev: 'directive',
				next: 'directive',
			},
			// Always require blank lines after import, except between imports
			{
				blankLine: 'always',
				prev: 'import',
				next: '*',
			},
			{
				blankLine: 'any',
				prev: 'import',
				next: 'import',
			},
			// Always require blank lines before & after every sequence of variable declarations & export
			{
				blankLine: 'always',
				prev: '*',
				next: [
					'const',
					'let',
					'var',
					'export',
				],
			},
			{
				blankLine: 'always',
				prev: [
					'const',
					'let',
					'var',
					'export',
				],
				next: '*',
			},
			{
				blankLine: 'any',
				prev: [
					'const',
					'let',
					'var',
					'export',
				],
				next: [
					'const',
					'let',
					'var',
					'export',
				],
			},
			// Always require blank lines before and after class declaration, if, do/while, switch, try
			{
				blankLine: 'always',
				prev: '*',
				next: [
					'if',
					'class',
					'for',
					'do',
					'while',
					'switch',
					'try',
				],
			},
			{
				blankLine: 'always',
				prev: [
					'if',
					'class',
					'for',
					'do',
					'while',
					'switch',
					'try',
				],
				next: '*',
			},
			// Always require blank lines before return statements
			{
				blankLine: 'always',
				prev: '*',
				next: 'return',
			},
		],
		'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 2 }],

		'no-redeclare': ['off'],
		'no-undef': ['off'],

		'class-methods-use-this': ['off'],

		indent: [
			'warn',
			'tab',
			{
				SwitchCase: 1,
			},
		],
	},
	extends: ['eslint:recommended', 'airbnb-base'],
};
