const bwipjs = require("bwip-js");
// const pdf = require("pdf-creator-node");

// var fs = require('fs');
var pdf = require("html-pdf");
var options = { format: "A4" };

let activeVouchers = [
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
  "AB4564RT",
];

generatePDFforVouchers().then((res) => {
  // console.log("PDF generated");
  // console.log(res);
});

function getVoucherDetailsHTML(base64) {
  const html = `<div style="background: gray1; width:285px; height:160px; border: 1px solid black">
  <table height="100%" width="100%">
      <tr style="background: lightgray;">
          <td colspan=2 align=center style="padding:10px 0 5px 0; letter-spacing:0.08em;"><b>VALET PARKING VOUCHER</b></td>
      </tr>
      <tr style="background:blue1">
          <td width="50%" style="padding:15px 0 0 5px; font-size:11px"><div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width:130px">Location: <span style="text-decoration: underline;">Hotel Xdddccdd</span></div></td>
          <td width="50%" style="padding:15px 0 0 5px; font-size:11px" ><div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width:130px">Occasion: <span style="text-decoration: underline;">Test campaign</span></div></td>
      </tr> 
      <tr style="background:blue1; height:10%">
          <td align=center width="50%" style="font-size:12px; vertical-align:bottom;">Powered By:</td>
          <td align=center width="50%"><img style="width:110px; height:50px;" src="${base64}" /></td>
      </tr>
      <tr style="background:blue1">
          <td align=center width="50%" style="padding:5px; vertical-align:top;"><img style="width:100px;" src="https://parkenda-images.s3.us-east-2.amazonaws.com/parkenda-logo-bw.png" /></td>
          <td align=center width="50%" style="font-size:12px;">Valid Until: 10/04/2024</td>
      </tr> 
  </table>    
</div>`;
  return html;
}

async function generatePDFforVouchers() {
  // const batch: IMarketingVoucherDTO[] = await this.getByBatchId(id);
  //  if (batch[0] || true) {
  if (true) {
    //   const campaign: IMarketingCampaignDTO = await marketingCampaignService.getById(batch[0].marketingCampaignId);
    //   const activeVouchers = batch.filter(voucher => voucher.redeemedAt === null);

    let promises = activeVouchers.map(async (v) => {
      return await textToBarCodeBase64(v);
    });

    let barcodes = await Promise.all(promises);
    console.log(barcodes);

    let part1 = barcodes.slice(barcodes.length / 2, barcodes.length);
    let part2 = barcodes.slice(0, barcodes.length / 2);

    let html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Vouchers list</title>
      </head>
      <body>
      <div>
        <table width=100%">
        ${part1
          .map((item, index) => {
            return `
            <tr>
            ${item ? `<td>${getVoucherDetailsHTML(item)}</td>` : ""}
            ${
              part2[index]
                ? `<td>${getVoucherDetailsHTML(part2[index])}</td>`
                : ""
            }
          </tr>
          ${
            (index + 1) % 5 == 0 && index + 1 != part1.length
              ? `
              </table>
              </div>
              <div style="page-break-before:always;">
              <table width=100%">`
              : ""
          }
          `;
          })
          .join("")}
        </table>
        </div>
      </body>
    </html>`;

    console.log("HTML start:");
    console.log(
      "/////////////////////////////////////////////////////////////////////////////////////////////////////"
    );
    console.log(html);
    console.log(
      "/////////////////////////////////////////////////////////////////////////////////////////////////////"
    );
    console.log("HTML end:");

    pdf.create(html, options).toFile("./output.pdf", function (err, res) {
      if (err) return console.log(err);
      console.log(res); // { filename: '/app/businesscard.pdf' }
    });

    // let options = {
    //   format: "A4",
    //   orientation: "portrait",
    //   border: "0mm",
    //   // header: {
    //   //   height: "10mm",
    //   //   contents: ` `,
    //   // },
    //   // footer: {
    //   //   height: "28mm",
    //   //   contents: {
    //   //     first: "Cover page",
    //   //     2: "Second page", // Any page number is working. 1-based index
    //   //     default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
    //   //     last: "Last Page",
    //   //   },
    //   // },
    // };

    // let document = {
    //   html: html,
    //   data: {
    //     barcodes,
    //   },
    //   path: "./output.pdf",
    //   // type: "buffer",
    // };

    // return new Promise((resolve, reject) => {
    //   pdf
    //     .create(document, options)
    //     .then((res) => {
    //       console.log(res);
    //       resolve(res);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  } else {
    throw "Batch not found";
  }
}

function textToBarCodeBase64(text) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text,
        // scaleX: 1,
        // scaleY: 1,
        padding: 10,
        includetext: true,
        textxalign: "center",
      },
      function (error, buffer) {
        if (error) {
          reject(error);
        } else {
          let Base64 = `data:image/gif;base64,${buffer.toString("base64")}`;
          resolve(Base64);
        }
      }
    );
  });
}
