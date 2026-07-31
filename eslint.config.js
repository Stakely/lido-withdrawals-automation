const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
	{
		ignores: ["node_modules/**", "output/**"],
	},
	js.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		rules: {
			indent: ["error", "tab"],
			quotes: ["error", "double"],
			semi: ["error", "always"],
			// linebreak-style queda desactivada: git normaliza a LF en el índice y
			// restaura CRLF en Windows, así que cualquier valor fijo falla en una
			// de las dos plataformas.
			"linebreak-style": "off",
			// Regla nueva en el recommended de ESLint 10. Encadenar `cause` en los
			// errores del flujo de firma es una mejora aparte, no de esta release.
			"preserve-caught-error": "off",
		},
	},
	{
		files: ["**/*.mjs"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: ["tests/**/*.js"],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
];
