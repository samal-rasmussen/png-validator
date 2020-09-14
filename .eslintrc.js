const path = require('path');

module.exports = {
	root: true,
	settings: {
		node: {
			tryExtensions: ['.ts']
		}
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		tsconfigRootDir: __dirname,
		project: [
			__dirname + '/tsconfig.json',
		],
		sourceType: "module",
	},
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
    	'plugin:@typescript-eslint/recommended',
		// 'plugin:@typescript-eslint/recommended-requiring-type-checking'
	],
	rules: {
		'@typescript-eslint/no-explicit-any': ['off'],
		'@typescript-eslint/restrict-plus-operands': ['off'],
		'comma-dangle': ['error', 'always-multiline'],
		// 'function-paren-newline': ['error', 'multiline-arguments'],
		'indent':  ['error', 'tab', { 'SwitchCase': 1, 'MemberExpression': 'off' }],
		'no-irregular-whitespace': ['error', {'skipComments': true}],
		'no-multiple-empty-lines': ['error', { "max": 1 }],
		'object-curly-newline': ['error', { 'consistent': true }],
		'semi': ['error', 'always'],
		'sort-keys': ['error', 'asc', {'caseSensitive': true, 'natural': true, 'minKeys': 2}],
	},
};
