const { Telegraf } = require("telegraf");
const { v4: uuidV4 } = require("uuid");
require("dotenv").config();
// let factGenerator = require("./factGenerator");

const bot = new Telegraf(process.env.BOT_TOKEN);

const searchCollection_collectionId = (id) => {
  const options = {
    method: "GET",
    headers: { accept: "*/*", "x-api-key": "demo-api-key" },
  };

  fetch(`https://api.reservoir.tools/collections/v5?id=${id}`, options)
    .then((response) => response.json())
    .then((response) => console.log(response))
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
    bot.on(text, async (ctx) => {
      console.log(text, "text");
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
