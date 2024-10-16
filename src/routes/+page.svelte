<script lang="ts">
 import BarcodeBox from './BarcodeBox.svelte'
 import BarcodeScanner from './BarcodeScanner.svelte'

 let engine_barcode = null;
 let ldo_barcode = null;


 let barcode_scanner;
 function handleRequestScan(request){
     console.log(request)
     barcode_scanner.start(request.detail.type)
 }

 function handleSubmit(){
     engine_barcode = null;
     ldo_barcode = null;
 }

 function handleScanned(request){
     let data= request.detail;
     console.log(data);
     const t = data
     if(data.request=="Engine"){
         engine_barcode=  t.value;
     } else{
         ldo_barcode=  t.value;
     }
 }
</script>
<main>
    <BarcodeScanner on:barcode_scanned="{handleScanned}" bind:this="{barcode_scanner}"/>
    <BarcodeBox on:request_scan="{handleRequestScan}" barcode="{engine_barcode}" component_type={"Engine"}/>
    <BarcodeBox on:request_scan="{handleRequestScan}" barcode="{ldo_barcode}" component_type={"LDO"}/>
    <button on:click="{handleSubmit}">Submit</button>
</main>

