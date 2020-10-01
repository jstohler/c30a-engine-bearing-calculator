<script>
    import { Accordions, Accordion, Image } from "@colorfuldots/svelteit";

    export let mainBearingType;

    let openedAccordion = 0;
    const toggleAccordion = e => (openedAccordion = e.detail == openedAccordion ? 0 : e.detail);
</script>

<style>
    #reference-container {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        align-content: space-between;
    }
    
    #bearing-reference {
        flex: auto;
        padding-left: 30px;
        padding-right: 30px;
    }

    #engine-reference {
        flex: auto;
        padding-left: 30px;
        padding-right: 30px;
    }

    .image {
        display: flex;
        justify-content: center;
    }

    .manual-download {
        color: white;
    }
</style>

<div id="reference-container">
    <div id="bearing-reference">
        <h5>Bearing References:</h5>
        <Accordions>
            {#if mainBearingType}
            <Accordion id="main-bore-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Crank Bore Code Locations</span>
                <span class="image">
                    <Image thumbnail img="./static/crank-bore-location.png" height="800" width="800" />
                </span>
            </Accordion>
            {:else}
            <Accordion id="rod-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Rod Code Locations</span>
                <span class="image">
                    <Image thumbnail img="./static/rod-code-diagram.png" height="800" width="800" />
                </span>
            </Accordion>
            {/if}
        
            {#if mainBearingType}
            <Accordion id="main-journal-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Main Journal Code Locations</span>
                <span class="image">
                    <Image thumbnail img="./static/crank-main-journal-code.png" height="800" width="800" />
                </span>
            </Accordion>
            {:else}
            <Accordion id="rod-journal-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Rod Journal Code Locations</span>
                <span class="image">
                    <Image thumbnail img="./static/crank-rod-journal-code.png" height="800" width="800" />
                </span>
            </Accordion>
            {/if}
        
            {#if mainBearingType}
            <Accordion id="main-bearing-chart" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Main Bearing Identification Chart</span>
                <span class="image">
                    <Image thumbnail img="./static/main-bearing-chart.png" height="800" width="800" />
                </span>
            </Accordion>
            {:else}
            <Accordion id="rod-bearing-chart" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Rod Bearing Identification Chart</span>
                <span class="image">
                    <Image thumbnail img="./static/rod-bearing-chart.png" height="800" width="800" />
                </span>
            </Accordion>
            {/if}
        </Accordions>
    </div>

    <br />

    <div id="engine-reference">
        <h5>Engine References:</h5>
        <Accordions>
            <Accordion id="engine-layout" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
                <span slot="title" class="valign-wrapper">Engine Layout Diagram & Journal Numbers</span>
                <span class="image">
                    <Image thumbnail img="./static/engine-diagram.png" height="800" width="800" />
                </span>
            </Accordion>
        
            <Accordion id="service-manual" {openedAccordion} secondary>
                <span slot="title" class="valign-wrapper">
                    <a class="manual-download" href="./static/C30A-Service-Manual-Engine-Bearings.pdf" download>1991 - 1995 Honda NSX Service Manual (Engine Service)</a>
                </span>
            </Accordion>
        
        </Accordions>
    </div>
</div>