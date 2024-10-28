<script lang="ts">
    import BarcodeBox from './BarcodeBox.svelte';
    import BarcodeScanner from './BarcodeScanner.svelte';
    import { SvelteToast,toast } from '@zerodevx/svelte-toast'
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

    const options = {duration: 4000};
    const nok_opts = {theme: {
                     "--toastBackground" : "var(--bulma-danger)",
                     "--toastColor" : "var(--bulma-text)",
                     }};
    const ok_opts = {theme: {
                    "--toastBackground" : "var(--bulma-success)",
                    "--toastColor" : "var(--bulma-text)",
                    }};


    async function handleRequestScan(request) {
	    console.log(request);
	    await barcode_scanner.start(request.detail.type);
    }

    async function handleSubmit() {
        const data = new FormData();
        data.append('barcode', ldo_barcode);
        data.append('full_id', engine_barcode);


        try{
            const response = await fetch(config.add_component_url, {

                method: "POST",
                body: data,
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

	        engine_barcode = null;
	        ldo_barcode = null;


            const text = await response.text();
            const resp = text.split("Begin")[1].split("End")[0].trim()
            let opts = null;
            if (resp.includes("Error")){
                opts = nok_opts;
            } else {
                opts = ok_opts;
            }
            toast.push(resp, opts)
        } catch (err){
            toast.push(err.toString(), nok_opts)
        }
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
	    } else {
		    ldo_barcode = t.value;
	    }
    }


    $: {
        is_engine_code_valid = engine_code_regex.test(engine_barcode)
        is_ldo_code_valid = ldo_code_regex.test(ldo_barcode)

    }

    $: {
        ok_to_submit = engine_barcode !== null
                    && ldo_barcode !== null
                    && is_engine_code_valid
                    && is_ldo_code_valid
        
    }
</script>


<main>
    <!-- <div class="container"> -->
    <SvelteToast {options}/>
    <!-- </div> -->
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
				    bind:barcode={engine_barcode}
				    component_type={'Engine'}
                    is_valid={is_engine_code_valid}
                    is_loading={is_decoding_engine}
			    />
		    </div>
		    <div class="column is-one-half">
			    <BarcodeBox
				    on:request_scan={handleRequestScan}
				    bind:barcode={ldo_barcode}
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
