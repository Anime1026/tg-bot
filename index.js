import axios from "axios";
import { Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

let Myctx;

const bot = new Telegraf(process.env.BOT_TOKEN);

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
      await Myctx.telegram.sendMessage(
        Myctx.message.chat.id,
        `Name: ${response.data.collections[0].name}\nID: ${response.data.collections[0].id}\nPrice: ${response.data.collections[0].floorAsk.price.amount.native}ETH\nVolume: ${response.data.collections[0].volume.allTime}\nVolume Change:\n1Day: ${response.data.collections[0].volumeChange["1day"]}\n7Day: ${response.data.collections[0].volumeChange["7day"]}\n30Day: ${response.data.collections[0].volumeChange["30day"]}\nFloorSale:\n1Day: ${response.data.collections[0].floorSale["1day"]}\n7Day: ${response.data.collections[0].floorSale["7day"]}\n30Day: ${response.data.collections[0].floorSale["30day"]}\nFloorSale Change:\n1Day: ${response.data.collections[0].floorSaleChange["1day"]}\n7Day: ${response.data.collections[0].floorSaleChange["7day"]}\n30Day: ${response.data.collections[0].floorSaleChange["30day"]}\n`
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
            `Name: ${res.data.collections[0].name}\nID: ${res.data.collections[0].id}\nPrice: ${res.data.collections[0].floorAsk.price.amount.native}ETH\nVolume: ${res.data.collections[0].volume.allTime}\nVolume Change:\n1Day: ${res.data.collections[0].volumeChange["1day"]}\n7Day: ${res.data.collections[0].volumeChange["7day"]}\n30Day: ${res.data.collections[0].volumeChange["30day"]}\nFloorSale:\n1Day: ${res.data.collections[0].floorSale["1day"]}\n7Day: ${res.data.collections[0].floorSale["7day"]}\n30Day: ${res.data.collections[0].floorSale["30day"]}\nFloorSale Change:\n1Day: ${res.data.collections[0].floorSaleChange["1day"]}\n7Day: ${res.data.collections[0].floorSaleChange["7day"]}\n30Day: ${res.data.collections[0].floorSaleChange["30day"]}\n`
          );
          Myctx.reply("If you wanna change network, use /eth or /sol command");
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
        `Name: ${res.data[0].name}\nFloor Price: ${res.data[0].floor_price}\nTotal Volume: ${res.data[0].me_total_volume}\nTotal Items: ${res.data[0].total_items}\nFloor Cap: ${res.data[0].floor_cap}`
      );
      Myctx.reply("If you wanna change network, use /eth or /sol command");
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
