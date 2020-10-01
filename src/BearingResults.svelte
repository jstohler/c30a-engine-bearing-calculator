<script>
    import { Table, Switch } from '@colorfuldots/svelteit';

    export let data;
    
    let bearings = data.bearings;
    let bearingMap = data.bearingMap;

    $: formInput = data.formInput;
    $: calcFullStep = data.fullStepCalculation;

    function calculateNewColors(index, formData, fullStepInput) {
        let crankcode = formData.crankrodcode[index];
        let journalcode = formData.journalcode[index];

        let useFullStep = fullStepInput[index];

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

    #results-help {
        padding-left: 5%;
        padding-right: 5%;
    }

    #full-step-help  {
        border: 1px solid rgb(211, 211, 211);
        border-radius: 5px;
        margin-top: 10px;
        margin-bottom: 10px;
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
                <td>{@html calculateNewColors(index, formInput, calcFullStep)}</td>
            {/each}
        </tr>
        <tr>
            <td>Use Full-Step Calculation?</td>
            {#each Array(data.numBearings) as _, index}
                <td>
                    <Switch bind:checked={calcFullStep[index]} unCheckedColor={'gray'} checkedColor={'purple'} />
                </td>
            {/each}
        </tr>
        <tr>
            <td colspan="{data.numBearings + 1}">
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
            </td>
        </tr>
    </tbody>
</Table>

<div id="results-help">
    <br />
    <h4>No Available Bearings?</h4>
    <hr />
    
    <div>
        <p>
            If there are no larger bearings available, you may have a few options:
        </p>
        <ol>
            <li>There may be additional aftermarket bearings available that could fit your need.</li>
            <li>If you are building the engine, you may be able to build the C30A to the 3.5L stroker, which has performance bearings available.</li>
        </ol>
        <p>If those options are not available, you may need to source a new crankshaft from Honda. Contact a professional advisor/engine builder for more information.</p>
    </div> 
</div> 
