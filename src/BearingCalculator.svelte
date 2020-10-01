<script>
    import { Table, Switch } from '@colorfuldots/svelteit';

    export let data;

    $: formInput = data.formInput;

    let bearings = data.bearings;
    let bearingMap = data.bearingMap;

    function calculateCurrentColors(index, formData) {
        let crankcode = formData.crankrodcode[index];
        let journalcode = formData.journalcode[index];

        let colIndex = data.cols.indexOf(crankcode);
        let rowIndex = data.rows.indexOf(journalcode);

        if (colIndex < 0 || rowIndex < 0) {
            return "-";
        }

        let cellIndex = bearingMap[rowIndex][colIndex]

        return bearings[cellIndex[0]] + "<br />" + bearings[cellIndex[1]];
    }
</script>

<style>
    thead > tr > th:first-of-type {
        width: 20%;
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
                <td>{@html calculateCurrentColors(index, formInput)}</td>
            {/each}
        </tr>
    </tbody>
</Table>