import fetch from "node-fetch";
import { Telegraf } from "telegraf";
import { v4 as uuidV4 } from "uuid";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
// let factGenerator = require("./factGenerator");

const bot = new Telegraf(process.env.BOT_TOKEN);

const searchCollection_collectionId = async (bot, msg) => {
  const options = {
    method: "GET",
    headers: { accept: "*/*", "x-api-key": "abb98582ec0343268a2fd47cfdf46036" },
  };

  const id = msg.update.message.text;

  console.log(id, "id");

  await fetch(
    `https://api.reservoir.tools/collections/v5?id=0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63`,
    options
  )
    .then((response) => {
      console.log(response, "response.data");
    })
    .catch((err) => console.error(err));
};

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
      searchCollection_collectionId(bot, msg);
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
