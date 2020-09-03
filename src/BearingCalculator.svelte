<script>
    import { Table, Switch } from '@colorfuldots/svelteit';

    export let data;
    export let calcFullStep = false;

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

    #options-menu > span {
        display: inline-flex;
        flex-flow: row wrap;
    }

    #options-menu > span > label {
        padding-top: 7px;
        padding-right: 20px;
        padding-left: 50px;
    }

    #full-step-help  {
        border: 1px solid rgb(211, 211, 211);
        border-radius: 5px;
        margin-top: 20px;
		margin-left: 10%;
		margin-right: 10%;
        padding: 20px;
    }

    #full-step-help > p {
        margin-top: 0px;
    }

    .full-step-table-header {
        width: 40% !important;
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

<br />

<div id="options-menu">
    <h4>Options:</h4>
    <span>
        <label for="half-step-switch">Perform Full Step Calculation:</label>
        <Switch id="half-step-switch" bind:checked={calcFullStep} unCheckedColor={'gray'} checkedColor={'purple'} />
    </span>
    <div id="full-step-help">
        <p>
            A 'Full Step' calculation will calculate the next available bearings for both the top and bottom bearings. 
            This may be required if the crankshaft has some damage and needs to be polished/ground down further than what is normally required. 
            If the crank has been professionally micro-polished, a 'Half Step' calculation will usually suffice.
        </p>
        <p>
            If you aren't sure which calculation to use, please contact a professional advisor/engine builder for more information.
        </p>

        <Table id="full-step-table">
            <thead>
                <tr>
                    <th class="full-step-table-header">Calculation Type</th>
                    <th>Original Bearings</th>
                    <th>New Bearings</th> 
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Half-Step (Default)</th>
                    <td>Yellow<br />Yellow</td>
                    <td>Yellow<br />Green</td>
                </tr>
                <tr>
                    <th>Full-Step</th>
                    <td>Yellow<br />Yellow</td>
                    <td>Green<br />Green</td>
                </tr>
            </tbody>
        </Table>
    </div>  
</div>