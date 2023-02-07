const { Telegraf } = require("telegraf");
const { v4: uuidV4 } = require("uuid");
require("dotenv").config();
// let factGenerator = require("./factGenerator");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  let message = `Please use the /nft command to receive a new nft`;
  ctx.reply(message);
});

bot.command("nft", async (ctx) => {
  try {
    ctx.reply("Select the Network");
  } catch (error) {
    console.log("error", error);
    ctx.reply("error sending image");
  }
});

bot.launch();
