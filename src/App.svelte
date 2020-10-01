<script>
	import '@colorfuldots/svelteit/dist/css/svelteit.min.css'

	import Page from './Page.svelte';
	import Footer from './Footer.svelte';

	import { Tabs, TabList, Tab, TabPanel, Button } from '@colorfuldots/svelteit';

    let mainBearingData = {
		numBearings: 4,
		cols: ["A", "B", "C", "D"],
		rows: ["1", "2", "3", "4", "5", "6"],
		bearings: ['Pink', 'Yellow', 'Green', 'Brown', 'Black'],
		bearingMap: [
			[[0,0], [0,1], [1,1], [1,2]],
			[[0,1], [1,1], [1,2], [2,2]],
			[[1,1], [1,2], [2,2], [2,3]],
			[[1,2], [2,2], [2,3], [3,3]],
			[[2,2], [2,3], [3,3], [3,4]],
			[[2,3], [3,3], [3,4], [4,4]]
        ],
        formInput: {
            "crankrodcode": {
                0: "",
                1: "",
                2: "",
                3: ""
            },
            "journalcode": {
                0: "",
                1: "",
                2: "",
                3: ""
            }
        },
        fullStepCalculation: {
            0: false,
            1: false,
            2: false,
            3: false
        },
        colName: "Crank Bore Codes",
        rowName: "Main Journal Codes"
    }

	let rodBearingData = {
		numBearings: 6,
		cols: ["1", "2", "3", "4"],
		rows: ["A", "B", "C", "D", "E", "F"],
		bearings: ['Red', 'Pink', 'Yellow', 'Green', 'Brown', 'Black'],
		bearingMap: [
			[[0,0], [0,1], [1,2], [2,2]],
			[[0,1], [1,2], [2,2], [2,3]],
			[[1,2], [2,2], [2,3], [3,4]],
			[[2,2], [2,3], [3,4], [4,4]],
			[[2,3], [3,4], [4,4], [4,5]],
			[[3,4], [4,4], [4,5], [5,5]]
		],
        formInput: {
            "crankrodcode": {
                0: "",
                1: "",
                2: "",
                3: "",
                4: "",
                5: "",
                6: ""
            },
            "journalcode": {
                0: "",
                1: "",
                2: "",
                3: "",
                4: "",
                5: "",
                6: ""
            }
        },
        fullStepCalculation: {
            0: false,
            1: false,
            2: false,
            3: false,
            4: false,
            5: false
        },
        colName: "Rod Codes",
        rowName: "Rod Journal Codes"
	}

	let showInfo = false;
	let showDetailedInfo = false;

	function toggleDetailedInfo() {
		showDetailedInfo = !showDetailedInfo;
	}	

	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

<style>
	h1, h4 {
		text-align: center;
	}

	#disclaimer {
		margin-top: 20px;
		margin-bottom: 50px;
		background-color: rgba(255, 255, 189, 0.63);
	}

	#disclaimer > .warn {
		margin-top: 30px;
		text-align: center;
	}

	#info-buttons {
		margin-top: 20px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.info-box {
        border: 1px solid rgb(211, 211, 211);
        border-radius: 5px;
		margin-left: 5%;
		margin-right: 5%;
		padding-left: 20px;
		padding-right: 20px;
		padding-bottom: 20px;
	}

	.info-box:nth-of-type(2) {
		margin-top: 20px;
	}

	.hidden {
		display: none;
	}
</style>

<h1>Honda C30A Main & Rod Bearing Calculator</h1>
<hr />

<div id="info-buttons">
		<Button outlined={showInfo} secondary={showInfo} on:click={toggleInfo}>What is this Calculator for?</Button>
		<Button outlined={showDetailedInfo} secondary={showDetailedInfo} on:click={toggleDetailedInfo}>How does this Calculator work?</Button>
</div>

<div id="info-group">
	<div class="info-box" class:hidden={!showInfo}>
		<h4>What is this Calculator for?</h4>
		<p>	
			This is a calculator used to determine which Main Bearings and Rod Bearings to purchase and install when rebuilding a Honda C30A engine. 
		</p>
		<p>
			Selecting these bearings was easily the most difficult part during the rebuild of my 1991 NSX. 
			The NSX Service manual doesn't describe the process of determing which bearings to choose when rebuilding the engine, only identifying which bearings were originally installed.
			I searched online to see if there was any easier process of determining which bearings to use and couldn't find a clear explaination.
		</p>
		<p>
			I created this calculator to make the bearing selection process easier for anyone who is rebuilding their C30A.
		</p>
	</div>
	
	<div class="info-box" class:hidden={!showDetailedInfo}>
		<h4>How does this Calculator work?</h4>
		<p>
			When rebuilding an engine, the bearings that sit between the crankshaft and the connecting rods will have been worn down over time and should be replaced.
		</p>
		<p>
			The main and rod bearings are used to transfer power from the pistons to the crankshaft, which then provides power to the transmission and wheels. 
			The bearings that connect the crankshaft and piston have very small tolerances, even more so with higher revving and more performance oriented engines.
		</p>
		<p>
			If the bearings are too small or worn, they will slide around and cause the connecting rods to beat into the crankshaft over time, <a href="https://mechanics.stackexchange.com/a/21056">severely damaging it</a>.
			If the bearings are too large, they will not correctly fit over the crankshaft, which will cause it to break apart or come loose while running, which can destroy the block.
		</p>
		<p>
			It is very important to install the correct bearing, so that the engine will be able to operate at its fullest capacity without damanging itself.
			Since these bearings have tolerances of 1/100th to 1/1000th of an inch, it can be difficult to determine which bearing to use.
		</p>
		<p>
			When selecting bearings for common, non-performance oriented engines (like a Toyota 22RE), there are typically aftermarket bearings available that will 'form' itself to fit within a 1/100ths of an inch.
			With rarer, performance engines (like the C30A), the tolerances are either too small for bearings to 'form' itself to fit within 1/1000ths of an inch, or are too rare for aftermarket manufacturers to make.
		</p>
		<p>
			Honda created a series of color-coded bearings (each of a specific thickness to 1/1000ths of an inch) for use in the C30A engine.
			To help identify which color bearings were originally installed, Honda stamped each engine block, crankshaft, and connecting rods with various codes.
			The engine codes map to a table of bearing colors listed in their 'Bearing Identification Chart' on the C30A Service Manual.
			With all of this information, it's possible to determine which bearing colors were originally installed from the factory.
		</p>
		<p>
			However, over the life of an engine, the bearings will wear down overtime and cause slight damage to the crankshaft, connecting rods, and block.
			When rebuilding an engine, this wear is fixed via <a href="https://mechanics.stackexchange.com/a/40797">micro-polishing (grinding)</a>, which will smooth out any imperfections but remove material from the engine components.
			Since these bearings require extremely tight tolerances, the new bearings will need to be thicker to make up for the removed material.
			If there is a large amount of wear on the crankshaft/rod that needs to be fixed, it will require an even thicker bearing to precisely fit.
		</p>
		<p>
			This calculator provides the ability to calculate which bearings were originally installed, the next size of bearings that will need to be installed, and the next 'full' size of bearings that may need to be installed if there is moderate damage to the crankshaft or rod.
		</p>
	</div>
</div>

<div id="disclaimer" class="info-box">
	<h4>Disclaimer</h4>
	<p>
		This calculator is a tool to help determine which bearings you MAY need, but each engine is unique. 
		Your bearing needs may vary depending on crankshaft wear and engine condition. 
		Always double check calculated bearings with a professional advisor/engine builder. 
		Installing an incorrectly sized bearing could cause premature wear or damage your engine!
	</p>
	<p class="warn">
		<strong>By using this tool, you assume all liability for any damage or loss caused by installing incorrect bearings!</strong>
	</p>
</div>

<Tabs>
	<TabList>
		<Tab>Main Bearings</Tab>
		<Tab>Rod Bearings</Tab>
	</TabList>

	<TabPanel>
		<Page bearingData={mainBearingData}/>
	</TabPanel>

	<TabPanel>
		<Page bearingData={rodBearingData}/>
	</TabPanel>
</Tabs>

<Footer />