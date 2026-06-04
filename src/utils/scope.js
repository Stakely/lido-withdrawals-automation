const DEPRECATION_WARNING =
	"⚠️  DEPRECATION WARNING: MODULE_ID, OPERATOR_ID and PERCENTAGE are deprecated and will be removed in a future version. " +
	"Please migrate to WITHDRAWALS_SCOPE (e.g. WITHDRAWALS_SCOPE='{\"1\":[{\"id\":123,\"percent\":50}]}').";

// Builds a scope object from a single module/operator/percent triple.
// Used by the deprecated legacy variables and by the interactive flow.
function buildScopeFromSinglePair(moduleId, operatorId, percent) {
	return {
		[moduleId]: [
			{
				id: Number(operatorId),
				percent: Number(percent),
			},
		],
	};
}

// Resolves the withdrawals scope from the environment variables.
// Returns a scope object, or null when there is not enough information and the
// interactive prompts must complete the data. Throws when the new and the
// deprecated variables are combined.
function resolveScope({ withdrawalsScope, moduleId, operatorId, percentage }) {
	const usesLegacy = moduleId !== undefined || operatorId !== undefined || percentage !== undefined;

	if (withdrawalsScope !== undefined) {
		if (usesLegacy) {
			throw new Error(
				"WITHDRAWALS_SCOPE cannot be combined with the deprecated MODULE_ID/OPERATOR_ID/PERCENTAGE variables. Use only WITHDRAWALS_SCOPE."
			);
		}
		return JSON.parse(withdrawalsScope);
	}

	// No new scope: fall back to the deprecated variables only when all three are present.
	if (moduleId !== undefined && operatorId !== undefined && percentage !== undefined) {
		console.warn(DEPRECATION_WARNING);
		return buildScopeFromSinglePair(moduleId, operatorId, percentage);
	}

	// Not enough information: the caller will gather it interactively.
	return null;
}

// Flattens a scope object into the list of (module, operator, percent) pairs to
// process. Deduplicates identical (moduleId, operatorId) pairs keeping the first
// occurrence (the validation already blocks duplicates with a different percent).
function expandScope(scope) {
	const pairs = [];
	const seen = new Set();

	for (const [moduleId, operators] of Object.entries(scope)) {
		for (const operator of operators) {
			const key = `${moduleId}/${operator.id}`;
			if (seen.has(key)) {
				continue;
			}
			seen.add(key);
			pairs.push({
				moduleId: moduleId,
				operatorId: operator.id,
				percent: operator.percent,
			});
		}
	}

	return pairs;
}

module.exports = {
	resolveScope,
	buildScopeFromSinglePair,
	expandScope,
};
