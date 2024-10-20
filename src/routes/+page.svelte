<script lang="ts">
    import BarcodeBox from './BarcodeBox.svelte';
    import BarcodeScanner from './BarcodeScanner.svelte';
    import { config } from '$lib/config.ts';

    let engine_barcode = null;
    let ldo_barcode = null;
    let is_engine_code_valid = true;
    let is_ldo_code_valid = true;
    let engine_code_regex= /320E[LH]*/;
    let ldo_code_regex= /LDO*/;
    let ok_to_submit = false;

    let is_decoding_engine = false;
    let is_decoding_ldo = false;

    let barcode_scanner = null;

    async function handleRequestScan(request) {
	    console.log(request);
	    await barcode_scanner.start(request.detail.type);
    }

    async function handleSubmit() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const response = await fetch(config.add_component_url, {
            method: "POST",
            body: JSON.stringify({
                barcode: engine_barcode,
                full_id: ldo_barcode,
            }),
            headers: myHeaders,
        });



	    engine_barcode = null;
	    ldo_barcode = null;

        console.log(resonse)

    }

    let is_decoding=false;
    function isRunningHandler(r){
        is_decoding_engine =false;
        is_decoding_ldo =false;
        if(r === "Engine"){is_decoding_engine =true;}
        if(r === "LDO"){is_decoding_ldo =true;}
    }

    function handleScanned(request) {
	    let data = request.detail;
	    console.log(data);
	    const t = data;
	    if (data.request === 'Engine') {
		    engine_barcode = t.value;
            is_engine_code_valid = engine_code_regex.test(engine_barcode)
	    } else {
		    ldo_barcode = t.value;
            is_ldo_code_valid = ldo_code_regex.test(ldo_barcode)
	    }
        console.log(engine_barcode)
        console.log(ldo_barcode)
    }

    $: {
        ok_to_submit = engine_barcode !== null
                    && ldo_barcode !== null
                    && is_engine_code_valid
                    && is_ldo_code_valid
        
    }

    
</script>

<main>
    <section class="section">
		<div class="">
			<BarcodeScanner
                on:barcode_scanned={handleScanned}
                bind:this={barcode_scanner}
                is_running_handler={isRunningHandler}
            />
		</div>
	    <div class="columns is-multiline is-6">
		    <div class="column is-one-half">
			    <BarcodeBox
				    on:request_scan={handleRequestScan}
				    barcode={engine_barcode}
				    component_type={'Engine'}
                    is_valid={is_engine_code_valid}
                    is_loading={is_decoding_engine}
			    />
		    </div>
		    <div class="column is-one-half">
			    <BarcodeBox
				    on:request_scan={handleRequestScan}
				    barcode={ldo_barcode}
				    component_type={'LDO'}
                    is_valid={is_ldo_code_valid}
                    is_loading={is_decoding_ldo}
			    />
		    </div>
		    <div class="column is-full">
                <button disabled={!ok_to_submit} class="button is-success is-fullwidth" on:click={handleSubmit}>Submit</button>
            </div>
	    </div>

    </section>
</main>
