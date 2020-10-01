<script>
    import BearingForm from './BearingForm.svelte';
    import BearingComparator from './BearingCalculator.svelte';
    import BearingResults from './BearingResults.svelte';
    import Reference from './Reference.svelte'; 
    
    export let bearingData = {
        numBearings: 0,
        cols: [],
		rows: [],
        bearingList: cols,
		bearings: [],
		bearingMap: [],
        formInput: {
            "crankrodcode": {
                0: "",
                1: "",
                2: "",
                3: "",
                4: "",
                5: ""
            },
            "journalcode": {
                0: "",
                1: "",
                2: "",
                3: "",
                4: "",
                5: ""
            }
        },
        colName: "",
        rowName: ""
    }
    
    $: calcFullStep = false;
</script>

<style>
    #reference-column {
        padding-bottom: 30px;
    }
</style>

<div id="main-view">
    <div id="reference-column">
        <h3>References:</h3>
        <hr />
        <Reference mainBearingType={bearingData.numBearings == 4} />
    </div>
    <div id="input-column">
        <h3>Input Engine Codes:</h3>
        <hr />
        <BearingForm data={bearingData} bind:results={bearingData.formInput}/>
        <br />
        <br />
        <h3>Stock Bearing Colors (Originally Installed by Honda):</h3>
        <hr />
        <BearingComparator data={bearingData} bind:calcFullStep={calcFullStep}/>
        <br />
        <br />
        <h3>New Engine Bearings:</h3>
        <hr />
        <BearingResults data={bearingData} bind:calcFullStep={calcFullStep}/>
        <br />
        <br />
        <br />
    </div>
</div>
