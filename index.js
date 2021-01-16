const { JSFuck } = require('jsfuck');
const walk = require('acorn-walk');
const { generate } = require('astring');
const glob = require('glob');

const DEFAULT_OPTIONS = {
	wrapWithEval: true,
	runInParentScope: true,
	exclude: '',
};
const ESM_FUNCTION_WRAPPER_NAME = 'fuck';
const ESM_INIT_DECLARATIONS = 'const g=globalThis';
const ESM_GLOBAL = 'g._f_';
const ESM_GLOBAL_ISOLATED = 'globalThis._f_';

module.exports = (pluginOptions = DEFAULT_OPTIONS) => ({
	name: 'jsfuck-rollup-plugin',
	generateBundle(options, bundle) {
		pluginOptions = {
			...DEFAULT_OPTIONS,
			...pluginOptions,
		};

		if (options.esModule) {
			this.warn('ESM support is experimental! You may end up with broken exports.');

			if (!pluginOptions.wrapWithEval) {
				throw new Error('ESM fixing can\'t be done when the code isn\'t being executed');
			}
		}

		Object.values(bundle).forEach((bundlePart) => {
			if (!bundlePart.isEntry) {
				return;
			}

			let key;

			switch (bundlePart.type) {
				case 'asset': {
					if (typeof bundlePart.source !== 'string') {
						throw new Error('Currently, only string sources are supported. (submit a PR!)');
					}

					key = 'source';

					break;
				}
				case 'chunk': {
					key = 'code';

					if (pluginOptions.exclude
						&& glob.sync(pluginOptions.exclude, bundle.fileName).length > 0) {
						return;
					}

					break;
				}
				default:
					throw new Error('Unrecognized bundle type! Is this plugin out of date?');
			}

			if (options.esModule) {
				const {
					code,
					exports,
					declarations,
					declarationsInESMFunction,
					cleanups,
				} = extractESMExports(
					this,
					bundlePart[key],
				);

				bundlePart[key] = '';
				bundlePart[key] += `${ESM_INIT_DECLARATIONS};`;
				bundlePart[key] += `${declarations.join(';')};`;
				bundlePart[key] += `function ${ESM_FUNCTION_WRAPPER_NAME}(){`;
				bundlePart[key] += `${declarationsInESMFunction.join(';')};`;
				// console.log(bundlePart[key]);
				// console.log(`eval('${code}')`);
				bundlePart[key] += JSFuck.encode(
					code,
					pluginOptions.wrapWithEval,
					pluginOptions.runInParentScope,
				);
				// console.log(`}${exports.join(';')};${cleanups.join(';')}`);
				bundlePart[key] += '}';
				bundlePart[key] += `${exports.join(';')};`;
				bundlePart[key] += `${cleanups.join(';')}`;


				return;
			}

			bundlePart[key] = JSFuck.encode(
				bundlePart[key],
				pluginOptions.wrapWithEval,
				pluginOptions.runInParentScope,
			);
		});
	},
});

function extractESMExports(ctx, code) {
	const ast = ctx.parse(code, {
		ecmaVersion: 2020,
		sourceType: 'module',
	});
	const nodesToBeExtracted = [];
	const assignmentLefts = [];
	const assignmentRights = [];
	const exports = [];
	const declarations = [];
	const cleanups = [];
	const declarationsInESMFunction = [];
	const extractIndexToAssignmentsIndexMap = [];
	let result = '';

	walk.simple(ast, {
		ExportNamedDeclaration(node) {
			const extractIndex = nodesToBeExtracted.length;

			nodesToBeExtracted[extractIndex] = node;
			extractIndexToAssignmentsIndexMap[extractIndex] = [];

			node.specifiers.forEach(
				(specifier) => {
					const assignmentIndex = assignmentLefts.length;

					extractIndexToAssignmentsIndexMap[extractIndex].push(assignmentIndex);
					assignmentLefts[assignmentIndex] = specifier.local.name + assignmentIndex;
					assignmentRights[assignmentIndex] = specifier.local.name;

					specifier.local.name = assignmentLefts[assignmentIndex];
				},
			);
		},
		ExportDefaultDeclaration(node) {
			const extractIndex = nodesToBeExtracted.length;
			const assignmentIndex = assignmentLefts.length;

			nodesToBeExtracted[extractIndex] = node;
			extractIndexToAssignmentsIndexMap[extractIndex] = [assignmentIndex];

			assignmentLefts[assignmentIndex] = node.declaration.name + assignmentIndex;
			assignmentRights[assignmentIndex] = node.declaration.name;

			node.declaration.name = assignmentLefts[assignmentIndex];
		},
		ExportAllDeclaration(node) {
			const extractIndex = nodesToBeExtracted.length;

			nodesToBeExtracted[extractIndex] = node;
		},
	});

	nodesToBeExtracted.forEach((node, i) => {
		exports.push(generate(node).replace(/;$/, ''));

		const lefts = extractIndexToAssignmentsIndexMap[i].map((index) => assignmentLefts[index]);
		const rights = extractIndexToAssignmentsIndexMap[i].map((index) => assignmentRights[index]);

		if (lefts == null
			|| rights == null) {
			findAndAssign(
				ast,
				node,
				undefined,
			);

			return;
		}

		findAndAssign(
			ast,
			node,
			ctx.parse(
				lefts.map((left, ii) => `${ESM_GLOBAL_ISOLATED}.${left} = ${rights[ii]}`).join(';'),
				{ ecmaVersion: 2020 },
			),
		);
	});

	declarationsInESMFunction.push(`${ESM_GLOBAL}.ed=!0`);
	declarations.push(`${ESM_GLOBAL}={}`);
	cleanups.push(`delete ${ESM_GLOBAL}`);
	cleanups.push(`delete ${ESM_GLOBAL_ISOLATED}`);

	assignmentLefts.forEach((left) => {
		declarations.push(
			// hack to get it to run sideeffects no matter which export is imported
			`let ${left}=((!${ESM_GLOBAL}.ed&&${ESM_FUNCTION_WRAPPER_NAME}()), ${ESM_GLOBAL}.${left})`,
		);
	});

	result += generate(ast, {
		indent: '',
		lineEnd: '',
	});

	return {
		exports,
		code: result,
		declarations,
		declarationsInESMFunction,
		cleanups,
	};
}

function findAndAssign(ast, targetNode, value) {
	Object.values(ast).forEach((astPart, i) => {
		if (typeof astPart !== 'object'
			|| astPart === null) {
			return;
		}

		if (astPart === targetNode) {
			if (value === undefined) {
				delete ast[Object.keys(ast)[i]];

				return;
			}

			ast[Object.keys(ast)[i]] = value;

			return;
		}

		findAndAssign(astPart, targetNode, value);
	});
}
