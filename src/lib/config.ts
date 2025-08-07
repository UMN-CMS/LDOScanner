export let config = {};
import bwipjs from 'bwip-js';
import { BarcodeFormat } from '@zxing/library';

let APPLICATION_MODE="rerender";

const type_mapping = new Map(
  [[BarcodeFormat.AZTEC, 0],
   [BarcodeFormat.CODABAR, 1],
   [BarcodeFormat.CODE_128, 4],
   [BarcodeFormat.CODE_39, 2],
   [BarcodeFormat.CODE_93, 3],
   [BarcodeFormat.DATA_MATRIX, "datamatrix"],
   [BarcodeFormat.EAN_13, 7],
   [BarcodeFormat.EAN_8, 6],
   [BarcodeFormat.ITF, 8],
   [BarcodeFormat.MAXICODE, 9],
   [BarcodeFormat.PDF_417, 10],
   [BarcodeFormat.QR_CODE, "qrcode"],
   [BarcodeFormat.RSS_14, 12],
   [BarcodeFormat.RSS_EXPANDED, 13],
   [BarcodeFormat.UPC_A, 14],
   [BarcodeFormat.UPC_E, 15]]);


if (APPLICATION_MODE === "ldo_scanner"){
  config = {
    start_with: null,
    auto_submit: false,
    clear_after_read: true,
    scannables : [
      { name: "Engine",
        valid_regex: /320E[LH]/,
      },
      { name: "LDO",
        valid_regex: /LDO/,
      }
    ],
    submission_function : async (values, toaster) => {
      console.log(values);
      const data = new FormData();
      const ldo_barcode = values.get("LDO");
      const engine_barcode = values.get("Engine");
      data.append('barcode', ldo_barcode);
      data.append('full_id', engine_barcode);

      const url=  "https://cmslab1.spa.umn.edu/Factory/EngineDB/add_component.py";
      try{
        const response = await fetch(url, {
          method: "POST",
          body: data,
        });

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const text = await response.text();
        const resp = text.split("Begin")[1].split("End")[0].trim()
        let opts = null;


        const nok_opts = {theme: {
          "--toastBackground" : "var(--bulma-danger)",
          "--toastColor" : "var(--bulma-text)",
        }};
        const ok_opts = {theme: {
          "--toastBackground" : "var(--bulma-success)",
          "--toastColor" : "var(--bulma-text)",
        }};

        if (resp.includes("Error")){
          opts = nok_opts;
        } else {
          opts = ok_opts;
        }
        toaster.push(resp, opts)
      } catch (err){
        toaster.push(err.toString(), nok_opts)
      }
    },
  };
} else if (APPLICATION_MODE === "simple_finder"){
  config = {
    start_with: "Board",
    auto_submit: true,
    clear_after_read: true,
    scannables : [
      { name: "Board",
        valid_regex: /320(E[LH]|ZP|W[HWE])/,
      },
    ],
    submission_function : async (values, toaster) => {
      const data = new FormData();
      const full_id = values.get("Board");
      const engine_re =/^320E[LH]/;
      const wagon_re =/^320/;
      const engine_url = "http://cmslab1.spa.umn.edu/Factory/EngineDB/module.py?full_id="
      const wagon_url = "http://cmslab1.spa.umn.edu/Factory/WagonDB/module.py?full_id="
      if(engine_re.test(full_id)){
        window.location = engine_url + full_id;
      }
      if(wagon_re.test(full_id)){
        window.location = wagon_url + full_id;
      }
    },
  };
} else if (APPLICATION_MODE === "rerender"){
  config = {
    start_with: "Code",
    auto_submit: true,
    clear_after_read: false,
    scannables : [
      { name: "Code",
        valid_regex: /.+/,
      },
    ],
    on_scan_callback : async () => {
      console.log("HERE");
      const elem = document.getElementById("user-element");
      elem.replaceChildren()
    },
    
    submission_function : async (values, toaster) => {
      console.log(values);
      console.log(BarcodeFormat);

        const nok_opts = {theme: {
          "--toastBackground" : "var(--bulma-danger)",
          "--toastColor" : "var(--bulma-text)",
        }};

      const elem = document.getElementById("user-element");
      const canvas = document.createElement("canvas")
      const img = document.createElement("img")
      img.style["padding-top"]="2em"
      try {
        bwipjs.toCanvas(canvas, {
          bcid:        type_mapping.get(values.get("Code").format),       // Barcode type
          text:        values.get("Code").text,    // Text to encode
          scale:       5,               // 3x scaling factor
          height:      10,              // Bar height, in millimeters
          width:       10,
          includetext: true,            // Show human-readable text
          textxalign:  'center',        // Always good to set this
        });
        elem.appendChild(img);
        img.src = canvas.toDataURL()
      } catch (err) {
        toaster.push(err.toString(), nok_opts)
      }
    },
  };
}
