<script>
	import { Table } from "@colorfuldots/svelteit";

	export let data;
	export let bearingInput = '';

	let rows = data.rows;
	let cols = data.cols;
	let bearings = data.bearings;
	let bearingMap = data.bearingMap;

	$: bearingValue = bearingInput;
	
	function getBearingColors(cellColors) {
		var [color1, color2] = cellColors;
		return bearings[color1] + '<br />' + bearings[color2];
	}

	function isCurrentSize(input, colIndex, rowIndex) {
		let cellCol = parseInput(cols, input);
		let cellRow = parseInput(rows, input);

		if (cellCol < 0 || cellRow < 0) {
			return false;
		}

		return cellCol == colIndex && cellRow == rowIndex;
	}

	function parseInput(arr, input) {
		if (arr.includes('A')) {
			return arr.indexOf(input.replace(/[0-9]/g, '').toUpperCase());

		} else if (arr.includes('1')) {
			return arr.indexOf(input.replace(/[^0-9]/g, ''));
		}

		return;
	}
</script>

<style>
	th { 
		padding: 3px !important;
		text-align: center;
	}

	td {
		padding: 0px 0px 0px 10px !important;
	}
	
	.currentSize {
		background-color: rgb(157, 255, 186);
	}
</style>

<Table bordered>
	<tr>
		<th></th>
		{#each cols as col}
		<th>{col}</th>
		{/each}
	</tr>
	{#each bearingMap as row, rowIndex}
	<tr>
		<th>{rows[rowIndex]}</th>
		{#each row as col, colIndex}
		<td class:currentSize={isCurrentSize(bearingValue, colIndex, rowIndex)}>
			<p>{@html getBearingColors(col)}</p>
		</td>
		{/each}
	</tr>
	{/each}
</Table>
