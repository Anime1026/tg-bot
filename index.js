import axios from "axios";
import { Telegraf } from "telegraf";
import { v4 as uuidV4 } from "uuid";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
// let factGenerator = require("./factGenerator");

const bot = new Telegraf(process.env.BOT_TOKEN);

const searchCollection_collectionId = async (bot, msg) => {
  const id = msg.update.message.text;
  const options = {
    method: "GET",
    url: `https://api.reservoir.tools/collections/v5?id=${id}`,
    headers: { accept: "*/*", "x-api-key": "abb98582ec0343268a2fd47cfdf46036" },
  };

  axios
    .request(options)
    .then((response) => {
      let reply = `Name: ${response.data.collections[0].name}\nID: ${response.data.collections[0].id}\nPrice: ${response.data.collections[0].floorAsk.price.amount.native}ETH\nVolume: ${response.data.collections[0].volume.allTime}\nVolume Change:\n1Day: ${response.data.collections[0].volumeChange["1day"]}\n7Day: ${response.data.collections[0].volumeChange["7day"]}\n30Day: ${response.data.collections[0].volumeChange["30day"]}\nFloorSale:\n1Day: ${response.data.collections[0].floorSale["1day"]}\n7Day: ${response.data.collections[0].floorSale["7day"]}\n30Day: ${response.data.collections[0].floorSale["30day"]}\nFloorSale Change:\n1Day: ${response.data.collections[0].floorSaleChange["1day"]}\n7Day: ${response.data.collections[0].floorSaleChange["7day"]}\n30Day: ${response.data.collections[0].floorSaleChange["30day"]}\n`;
      bot.sendMessage(msg.chat.id, reply);
    })
    .catch((err) => {
      console.error(err);
      bot.sendMessage(msg.chat.id, "Collection Id is not Valid");
    });
};
const searchCollection_collectionName = async (bot, msg) => {
  const collectionName = msg.update.message.text;
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
        .then((res) => {
          console.log(res.data.collections[0], "res.data00000000000");
          bot.sendMessage(
            msg.chat.id,
            `Name: ${res.data.collections[0].name}\nID: ${res.data.collections[0].id}\nPrice: ${res.data.collections[0].floorAsk.price.amount.native}ETH\nVolume: ${res.data.collections[0].volume.allTime}\nVolume Change:\n1Day: ${res.data.collections[0].volumeChange["1day"]}\n7Day: ${res.data.collections[0].volumeChange["7day"]}\n30Day: ${res.data.collections[0].volumeChange["30day"]}\nFloorSale:\n1Day: ${res.data.collections[0].floorSale["1day"]}\n7Day: ${res.data.collections[0].floorSale["7day"]}\n30Day: ${res.data.collections[0].floorSale["30day"]}\nFloorSale Change:\n1Day: ${res.data.collections[0].floorSaleChange["1day"]}\n7Day: ${res.data.collections[0].floorSaleChange["7day"]}\n30Day: ${res.data.collections[0].floorSaleChange["30day"]}\n`
          );
        })
        .catch((err) => {
          console.error(err);
          bot.sendMessage(msg.chat.id, "Can`t find this collection");
        });
    })
    .catch((err) => {
      console.error(err);
      bot.sendMessage(msg.chat.id, "Can`t find this collection");
    });
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
    ctx.reply("Please Input the Collection ID");
    bot.on("message", (msg) => {
      searchCollection_collectionId(bot, msg);
    });
  } catch (error) {
    console.log("error", error);
    ctx.reply("Sorry, please again");
  }
});

bot.command("ethName", async (ctx) => {
  try {
    ctx.reply("Please Input the Collection Name");
    bot.on("message", (msg) => {
      searchCollection_collectionName(bot, msg);
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
