<script>
    import { Table } from '@colorfuldots/svelteit';
    import BearingTable from './BearingTable.svelte';

    export let data;
    export let results = data.formInput;
    
    $: selectedJournal = 0

    function getBearingCodeFromInput(bearingData, bearingNum) {
        if (bearingNum >= bearingData.numBearings) {
            return;
        }

        return bearingData.formInput.crankrodcode[bearingNum] + "" + bearingData.formInput.journalcode[bearingNum];
    }

</script>

<style>
    thead > tr > th:first-of-type {
        width: 20%;
    }

    #bearing-chart-title {
        text-align: center;
    }

    .hidden {
        display: none;
    }

    .selected-column {
        background-color: rgb(245,245,245);
    }
</style>

<form>
    <Table bordered>
        <thead>
            <tr>
                <th>Journal No.</th>
                {#each Array(data.numBearings) as _, index}
                <th on:mouseover={() => selectedJournal = index} class:selected-column={index == selectedJournal}>#{index + 1}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            <tr> 
                <td>{data.colName}:</td>
                {#each Array(data.numBearings) as _, index}
                <td on:mouseover={() => selectedJournal = index} class:selected-column={index == selectedJournal}>
                    <select bind:value={results.crankrodcode[index]}>
                        <option value="" selected disabled hidden>-</option>
                        {#each data.cols as col}
                            <option value={col}>{col}</option>
                        {/each}
                    </select>
                </td>
                {/each}
            </tr>
            <tr>
                <td>{data.rowName}:</td>
                {#each Array(data.numBearings) as _, index}
                <td on:mouseover={() => selectedJournal = index} class:selected-column={index == selectedJournal}>
                    <select bind:value={results.journalcode[index]}>
                        <option value="" selected disabled hidden>-</option>
                        {#each data.rows as row}
                            <option value={row}>{row}</option>
                        {/each}
                    </select>
                </td>
                {/each}
            </tr>
            <tr>
                <td colspan="{data.numBearings + 1}" class="selected-column">
                    {#each Array(data.numBearings) as _, index}
                    <span class:hidden={selectedJournal != index}>
                        <h4 id="bearing-chart-title">Bearing Identification Chart for Journal #{index + 1}</h4>
                        <BearingTable data={data} bearingInput="{getBearingCodeFromInput(data, index)}"/>
                    </span>
                    {/each}
                </td>
            </tr>
        </tbody>
    </Table>
</form>
