import { signal } from "@preact/signals";
import { useMemo } from "preact/hooks";

// Helper function to generate letter pairs
const generateLetterPairs = () => {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const pairs = [];
	for (
		let firstLetterIndex = 0;
		firstLetterIndex < alphabet.length;
		firstLetterIndex++
	) {
		for (
			let secondLetterIndex = 0;
			secondLetterIndex < alphabet.length;
			secondLetterIndex++
		) {
			pairs.push(alphabet[firstLetterIndex] + alphabet[secondLetterIndex]);
		}
	}
	return pairs;
};

// Subgrid component using signals
const RenderSubgrid = ({ isCellHighlighted, subCell }) => {
	const subgridLetters = signal("qwfpasrtzxcd".split(""));

	return (
		<div className="subgrid">
			{subgridLetters.value.map((letter) => {
				const upperLetter = letter.toUpperCase();
				return (
					<div
						key={upperLetter}
						className={`subcell ${subCell === upperLetter ? "active-subcell" : "opacity-50"}`}
					>
						<div className={`${isCellHighlighted ? "" : "hidden"}`}>
							{upperLetter}
						</div>
					</div>
				);
			})}
		</div>
	);
};

function Cells({ firstLetter, secondLetter, subCell }) {
	// Memoize letter pairs to avoid recalculating on every render
	const letterPairs = useMemo(() => generateLetterPairs(), []);

	// Helper function to calculate grid item class
	const getGridItemClass = (pair) => {
		const isRowHighlighted = firstLetter === pair[0];
		const isCellHighlighted =
			firstLetter === pair[0] && secondLetter === pair[1];

		if (firstLetter && !secondLetter && !subCell) {
			return isRowHighlighted ? "grid-item highlighted" : "grid-item unfocused";
		}

		if (firstLetter && secondLetter) {
			return isCellHighlighted ? "grid-item active" : "grid-item unfocused";
		}

		return "grid-item";
	};

	return (
		<div className="grid-container">
			{letterPairs.map((pair) => (
				<div key={pair} className={getGridItemClass(pair)}>
					<div className="coordinates">
						<RenderSubgrid
							isCellHighlighted={
								firstLetter === pair[0] && secondLetter === pair[1]
							}
							subCell={subCell}
						/>
						{!(firstLetter === pair[0] && secondLetter === pair[1]) && (
							<>
								<p className={firstLetter ? "opacity-50" : ""}>{pair[0]}</p>
								<p>{pair[1]}</p>
							</>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export default Cells;
