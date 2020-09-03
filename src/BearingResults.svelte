<script>
    import { Table } from '@colorfuldots/svelteit';

    export let data;
    export let calcFullStep = false;
    
    let bearings = data.bearings;
    let bearingMap = data.bearingMap;

    $: formInput = data.formInput;

    function calculateNewColors(index, formData, useFullStep) {
        let crankcode = formData.crankrodcode[index];
        let journalcode = formData.journalcode[index];

        let colIndex = data.cols.indexOf(crankcode);
        let rowIndex = data.rows.indexOf(journalcode);

        if ((colIndex < 0 || rowIndex < 0)) {
            return "-";
        }

        let [currTopColor, currBottomColor] = bearingMap[rowIndex][colIndex];

        let nextTopColorExists = currTopColor < bearings.length - 1;
        let nextBottomColorExists = currBottomColor < bearings.length - 1;

        if (useFullStep) {
            if (nextTopColorExists && nextBottomColorExists) {
                return bearings[currTopColor + 1] + "<br />" + bearings[currBottomColor + 1];
            }
        } else {
            if (nextBottomColorExists && currTopColor == currBottomColor) {
                return bearings[currTopColor] + "<br />" + bearings[currBottomColor + 1];
            } else if (nextTopColorExists) {
                return bearings[currTopColor + 1] + "<br />" + bearings[currBottomColor];
            }
        }

        return "No Available Bearing";
    }
</script>

<style>
    table > thead > tr > th:first-of-type {
        width: 20%;
    }

    #results-help  {
        border: 1px solid rgb(211, 211, 211);
        border-radius: 5px;
        margin-top: 20px;
		margin-left: 10%;
		margin-right: 10%;
        padding: 20px;
    }

    #results-help > p {
        margin: 0px;
    }
</style>

<Table bordered>
    <thead>
        <tr>
            <th>Journal No.</th>
            {#each Array(data.numBearings) as _, index}
                <th>#{index + 1}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Bearing Colors:</td>
            {#each Array(data.numBearings) as _, index}
                <td>{@html calculateNewColors(index, formInput, calcFullStep)}</td>
            {/each}
        </tr>
    </tbody>
</Table>

<div id="results-help">
    <p>
        If there are no larger bearings available, you may have a few options:
    </p>
    <ol>
        <li>There may be additional aftermarket bearings available that could fit your need.</li>
        <li>If you are building the engine, you may be able to build the C30A to the 3.5L stroker, which has performance bearings available.</li>
    </ol>
    <p>If those options are not available, you may need to source a new crankshaft from Honda. Contact a professional advisor/engine builder for more information.</p>
</div> 