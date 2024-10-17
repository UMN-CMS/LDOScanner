<script lang="ts">
 import BarcodeBox from './BarcodeBox.svelte';
 import BarcodeScanner from './BarcodeScanner.svelte';

 let engine_barcode = null;
 let ldo_barcode = null;

 let barcode_scanner;
 async function handleRequestScan(request) {
	 console.log(request);
	 await barcode_scanner.start(request.detail.type);
 }

 async function handleSubmit() {
     const myHeaders = new Headers();
     myHeaders.append("Content-Type", "application/json");

     const response = await fetch("http://cmslab1.spa.umn.edu/Factory/EngineDB/add_component.py", {
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

 function handleScanned(request) {
	 let data = request.detail;
	 console.log(data);
	 const t = data;
	 if (data.request === 'Engine') {
		 engine_barcode = t.value;
	 } else {
		 ldo_barcode = t.value;
	 }
     console.log(engine_barcode)
     console.log(ldo_barcode)
 }
</script>

<main>
    <section class="section">
		<div class="">
			<BarcodeScanner on:barcode_scanned={handleScanned} bind:this={barcode_scanner} />
		</div>
	    <div class="columns is-multiline is-6">
		    <div class="column is-one-half">
			    <BarcodeBox
				    on:request_scan={handleRequestScan}
				    barcode={engine_barcode}
				    component_type={'Engine'}
                    regex={new RegExp('E[HL]')}
			    />
		    </div>
		    <div class="column is-one-half">
			    <BarcodeBox
				    on:request_scan={handleRequestScan}
				    barcode={ldo_barcode}
				    component_type={'LDO'}
                    regex={new RegExp('LDO')}
			    />
		    </div>
		    <div class="column is-full">
                <button class="button is-success is-fullwidth" on:click={handleSubmit}>Submit</button>
            </div>
	    </div>

    </section>
</main>
