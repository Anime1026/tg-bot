const axios = require("axios");
const { Telegraf } = require("telegraf");
const dotenv = require("dotenv"); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const width = 400; //px
const height = 400; //px
const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

const configuration = {
  type: "line", // for line chart
  data: {
    labels: [2018, 2019, 2020, 2021],
    datasets: [
      {
        label: "Sample 1",
        data: [10, 15, -20, 15],
        fill: false,
        borderColor: ["rgb(51, 204, 204)"],
        borderWidth: 1,
        xAxisID: "xAxis1", //define top or bottom axis ,modifies on scale
      },
      {
        label: "Sample 2",
        data: [10, 30, 20, 10],
        fill: false,
        borderColor: ["rgb(255, 102, 255)"],
        borderWidth: 1,
        xAxisID: "xAxis1",
      },
    ],
  },
  options: {
    scales: {
      y: {
        suggestedMin: 0,
      },
    },
  },
};

dotenv.config();

let Myctx;
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

const InputCallBack = (msg) => {
  let cmdData = msg.update.message.text.split(" ");
  if (cmdData[0] === "/eth") {
    let key = msg.update.message.text.slice(5);
    if (key.slice(0, 2) === "0x") {
      searchCollection_collectionId(key);
    } else {
      searchCollection_collectionName(key);
    }
  } else if (cmdData[0] === "/sol") {
    let key = "";
    for (let index = 1; index < cmdData.length; index++) {
      if (index === cmdData.length - 1) {
        key = key + cmdData[index].toLowerCase();
      } else {
        key = key + cmdData[index].toLowerCase() + "-";
      }
    }
    searchCollection_solCollectionName(key);
  }
};

const searchCollection_collectionId = (msg) => {
  const id = msg;
  const options = {
    method: "GET",
    url: `https://api.reservoir.tools/collections/v5?id=${id}`,
    headers: { accept: "*/*", "x-api-key": "abb98582ec0343268a2fd47cfdf46036" },
  };

  axios
    .request(options)
    .then(async (response) => {
      const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
      const base64Image = dataUrl;

      var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

      fs.writeFile("out.png", base64Data, "base64", function (err) {
        if (err) {
          console.log(err);
        }
      });

      await Myctx.telegram.sendMessage(
        Myctx.message.chat.id,
        `📜 Name: ${response.data.collections[0].name}\n📱ID: ${response.data.collections[0].id}\n💰 Price: ${response.data.collections[0].floorAsk.price.amount.native}ETH\n📊 Volume: ${response.data.collections[0].volume.allTime}\n📉 Volume Change:\n🗓 1Day: ${response.data.collections[0].volumeChange["1day"]}\n🗓 7Day: ${response.data.collections[0].volumeChange["7day"]}\n🗓 30Day: ${response.data.collections[0].volumeChange["30day"]}\n🛍 FloorSale:\n🗓 1Day: ${response.data.collections[0].floorSale["1day"]}\n🗓 7Day: ${response.data.collections[0].floorSale["7day"]}\n🗓 30Day: ${response.data.collections[0].floorSale["30day"]}\n🛒 FloorSale Change:\n🗓 1Day: ${response.data.collections[0].floorSaleChange["1day"]}\n🗓 7Day: ${response.data.collections[0].floorSaleChange["7day"]}\n🗓 30Day: ${response.data.collections[0].floorSaleChange["30day"]}\n${dataUrl}`
      );

      bot.hears(
        "photo",
        Myctx.replyWithPhoto({ url: dataUrl }, { caption: "cat photo" })
      );
    })
    .catch((err) => {
      console.error(err);
      Myctx.reply("Collection Id is not Valid");
    });
};
const searchCollection_collectionName = async (msg) => {
  const collectionName = msg;
  const options = {
    method: "GET",
    url: `https://api.reservoir.tools/search/collections/v1?name=${collectionName}&limit=1`,
    headers: { accept: "*/*", "x-api-key": "abb98582ec0343268a2fd47cfdf46036" },
  };

  axios
    .request(options)
    .then((response) => {
      const options2 = {
        method: "GET",
        url: `https://api.reservoir.tools/collections/v5?id=${response.data.collections[0].collectionId}`,
        headers: {
          accept: "*/*",
          "x-api-key": "abb98582ec0343268a2fd47cfdf46036",
        },
      };

      axios
        .request(options2)
        .then(async (res) => {
          await Myctx.telegram.sendMessage(
            Myctx.message.chat.id,
            `📜 Name: ${res.data.collections[0].name}\n📱ID: ${res.data.collections[0].id}\n💰 Price: ${res.data.collections[0].floorAsk.price.amount.native}ETH\n📊 Volume: ${res.data.collections[0].volume.allTime}\n📉 Volume Change:\n🗓 1Day: ${res.data.collections[0].volumeChange["1day"]}\n🗓 7Day: ${res.data.collections[0].volumeChange["7day"]}\n🗓 30Day: ${res.data.collections[0].volumeChange["30day"]}\n🛍 FloorSale:\n🗓 1Day: ${res.data.collections[0].floorSale["1day"]}\n🗓 7Day: ${res.data.collections[0].floorSale["7day"]}\n🗓 30Day: ${res.data.collections[0].floorSale["30day"]}\n🛒 FloorSale Change:\n🗓 1Day: ${res.data.collections[0].floorSaleChange["1day"]}\n🗓 7Day: ${res.data.collections[0].floorSaleChange["7day"]}\n🗓 30Day: ${res.data.collections[0].floorSaleChange["30day"]}\n`
          );

          const dataUrl = await chartJSNodeCanvas.renderToDataURL(
            configuration
          );
          const base64Image = dataUrl;

          var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

          fs.writeFile("out.png", base64Data, "base64", function (err) {
            if (err) {
              console.log(err);
            }
          });

          bot.telegram.sendPhoto(Myctx.chat.id, {
            url: "https://i.seadn.io/gcs/files/d0854d1e752d9558996a3411af31425c.png",
          });

          // Myctx.telegram.replyWithPhoto(
          //   Myctx.message.chat.id,
          //   "https://avatars.githubusercontent.com/u/105542355?s=400&u=c47d5f00857cb8fad300c91cc7590ee5b4c86fe1&v=4"
          // );
        })
        .catch((err) => {
          console.error(err);
          Myctx.reply("Can`t find this collection");
        });
    })
    .catch((err) => {
      console.error(err);
      Myctx.reply("Can`t find this collection");
    });
};

const searchCollection_solCollectionName = async (msg) => {
  axios
    .get(`https://cloudflare-worker-nft.solswatch.workers.dev/slug/${msg}`)
    .then(async (res) => {
      await Myctx.telegram.sendMessage(
        Myctx.message.chat.id,
        `📜 Name: ${res.data[0].name}\n💸 Floor Price: ${res.data[0].floor_price}\n📚 Total Volume: ${res.data[0].me_total_volume}\n📦 Total Items: ${res.data[0].total_items}\n🖨 Floor Cap: ${res.data[0].floor_cap}`
      );
    })
    .catch((err) => {
      console.error(err);
      Myctx.reply("Can`t find this collection");
    });
};

bot.start((ctx) => {
  let message = `Please use the /eth or /sol command to receive a new nft`;
  Myctx = ctx;
  ctx.reply(message);
});

bot.on("message", async (msg) => {
  InputCallBack(msg);
});

bot.launch();
