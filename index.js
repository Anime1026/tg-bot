import axios from "axios";
import { Telegraf } from "telegraf";
import { v4 as uuidV4 } from "uuid";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
// let factGenerator = require("./factGenerator");

const bot = new Telegraf(process.env.BOT_TOKEN);

const searchCollection_collectionId = async (ctx, msg) => {
  const id = msg.update.message.text;
  const options = {
    method: "GET",
    url: `https://api.reservoir.tools/collections/v5?id=${id}`,
    headers: { accept: "*/*", "x-api-key": "abb98582ec0343268a2fd47cfdf46036" },
  };

  axios
    .request(options)
    .then((response) => {
      ctx.reply(`
            Name: ${response.data.collections[0].name}\n
            ID: ${response.data.collections[0].id}\n
            Price: ${response.data.collections[0].floorAsk.price.amount.native}ETH\n
            Volume: ${response.data.collections[0].volume.allTime}\n
            Volume Change:\n
            1Day: ${response.data.collections[0].volumeChange["1day"]}\n
            7Day: ${response.data.collections[0].volumeChange["7day"]}\n
            30Day: ${response.data.collections[0].volumeChange["30day"]}\n
            FloorSale:\n
            1Day: ${response.data.collections[0].floorSale["1day"]}\n
            7Day: ${response.data.collections[0].floorSale["7day"]}\n
            30Day: ${response.data.collections[0].floorSale["30day"]}\n
            FloorSale Change:\n
            1Day: ${response.data.collections[0].floorSaleChange["1day"]}\n
            7Day: ${response.data.collections[0].floorSaleChange["7day"]}\n
            30Day: ${response.data.collections[0].floorSaleChange["30day"]}\n
        `);
    })
    .catch((err) => console.error(err));
};

// const testFunc = () => {
//   const options = {
//     method: "GET",
//     url: `https://api.reservoir.tools/collections/v5?id=0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63`,
//     headers: {
//       accept: "*/*",
//       "x-api-key": "abb98582ec0343268a2fd47cfdf46036",
//     },
//   };

//   axios
//     .request(options)
//     .then((response) => {
//       console.log(
//         response.data.collections[0].name,
//         "name",
//         response.data.collections[0].id,
//         "id",
//         response.data.collections[0].floorAsk.price.amount.native,
//         "price",
//         response.data.collections[0].volume.allTime,
//         "volume",
//         response.data.collections[0]
//       );
//     })
//     .catch((err) => console.error(err));
// };

// testFunc();

bot.start((ctx) => {
  let message = `Please use the /eth or /sol command to receive a new nft`;
  ctx.reply(message);
});

bot.command("eth", async (ctx) => {
  try {
    ctx.reply(
      "Please use the /ethId or /ethName command to search NFT Collections"
    );
  } catch (error) {
    console.log("error", error);
    ctx.reply("Sorry, please again");
  }
});

bot.command("ethId", async (ctx) => {
  try {
    ctx.reply("Please Input the CollectionName");
    bot.on("message", (msg) => {
      searchCollection_collectionId(ctx, msg);
    });
  } catch (error) {
    console.log("error", error);
    ctx.reply("Sorry, please again");
  }
});

bot.command("sol", async (ctx) => {
  try {
    ctx.reply("Please Input the Solana Contract Address");
  } catch (error) {
    console.log("error", error);
    ctx.reply("Sorry, please again");
  }
});

bot.launch();
