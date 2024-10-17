<script lang="ts">
	import BarcodeBox from './BarcodeBox.svelte';
	import BarcodeScanner from './BarcodeScanner.svelte';

	let engine_barcode = null;
	let ldo_barcode = null;

	let barcode_scanner;
	function handleRequestScan(request) {
		console.log(request);
		barcode_scanner.start(request.detail.type);
	}

	function handleSubmit() {
		engine_barcode = null;
		ldo_barcode = null;
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
	<div class="columns">
		<div class="column is-full">
			<BarcodeScanner on:barcode_scanned={handleScanned} bind:this={barcode_scanner} />
		</div>
		<div class="column is-full">
			<BarcodeBox
				on:request_scan={handleRequestScan}
				                barcode={engine_barcode}
				                component_type={'Engine'}
			/>
		</div>
		<div class="column is-full">
			<BarcodeBox
				on:request_scan={handleRequestScan}
				                barcode={ldo_barcode}
				                component_type={'LDO'}
			/>
		</div>
		<div class="column is-full"><button class="button" on:click={handleSubmit}>Submit</button></div>
	</div>
</main>
