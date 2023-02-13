const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
const dotenv = require("dotenv"); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const filestack = require("filestack-js");

const width = 600; //px
const height = 600; //px
const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

dotenv.config();

let Myctx;
const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);
const filestack_client = filestack.init("AJhmFi6TvTFel1yYFFcY0z");

const InputCallBack = (ctx) => {
  let cmdData = ctx.update.message.text.split(" ");
  if (cmdData[0] === "/eth") {
    let key = ctx.update.message.text.slice(5);
    if (key.slice(0, 2) === "0x") {
      searchCollection_collectionId(ctx, key);
    } else {
      searchCollection_collectionName(ctx, key);
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

const searchCollection_collectionId = (ctx, key) => {
  const id = key;

  const options2 = {
    method: "GET",
    url: `https://api.reservoir.tools/collections/v5?id=${id}`,
    headers: {
      accept: "*/*",
      "x-api-key": "abb98582ec0343268a2fd47cfdf46036",
    },
  };

  axios
    .request(options2)
    .then(async (res2) => {
      let url = `https://api.reservoir.tools/events/collections/floor-ask/v1?collection=${id}&sortDirection=desc&limit=31`;
      let data = await axios.get(url);
      let configuration = {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Floor Price",
              data: [],
              fill: false,
              borderColor: ["rgb(51, 204, 204)"],
              borderWidth: 1,
              xAxisID: "xAxis1",
            },
          ],
        },
      };

      const curDate = new Date().valueOf();

      configuration.data.datasets[0].data = [];
      configuration.data.labels = [];

      for (let index = 0; index < data.data.events.length; index++) {
        const element = data.data.events[index];

        const DateNum =
          String(
            new Date(
              curDate - 24 * 60 * 60 * 1000 * (data.data.events.length - index)
            )
          ).split(" ")[1] +
          "-" +
          new Date(
            curDate - 24 * 60 * 60 * 1000 * (data.data.events.length - index)
          ).getDate();

        configuration.data.labels.push(DateNum);
        configuration.data.datasets[0].data.push(
          Number(element.floorAsk.price)
        );
      }

      const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
      const base64Image = dataUrl;

      var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

      fs.writeFileSync(`out.png`, base64Data, "base64", function (err) {
        if (err) {
          console.log(err);
        }
      });

      const image_file = fs.readFileSync(`out.png`);

      filestack_client
        .upload(image_file)
        .then(async (res) => {
          const price =
            res2.data.collections[0].floorAsk.price.amount.native.toFixed(4);
          const floorChange1day =
            res2.data.collections[0].floorSaleChange["1day"] >= 1
              ? "+" +
                (
                  (res2.data.collections[0].floorSaleChange["1day"] - 1) *
                  100
                ).toFixed(2)
              : "-" +
                (
                  (1 - res2.data.collections[0].floorSaleChange["1day"]) *
                  100
                ).toFixed(2);

          const floorChange7day =
            res2.data.collections[0].floorSaleChange["7day"] >= 1
              ? "+" +
                (
                  (res2.data.collections[0].floorSaleChange["7day"] - 1) *
                  100
                ).toFixed(2)
              : "-" +
                (
                  (1 - res2.data.collections[0].floorSaleChange["7day"]) *
                  100
                ).toFixed(2);

          const floorChange30day =
            res2.data.collections[0].floorSaleChange["30day"] >= 1
              ? "+" +
                (
                  (res2.data.collections[0].floorSaleChange["30day"] - 1) *
                  100
                ).toFixed(2)
              : "-" +
                (
                  (1 - res2.data.collections[0].floorSaleChange["30day"]) *
                  100
                ).toFixed(2);

          const totalVolume =
            res2.data.collections[0].volume.allTime.toFixed(4);

          const listed =
            (Number(res2.data.collections[0].onSaleCount) /
              Number(res2.data.collections[0].tokenCount)) *
            100;

          const options_owner = {
            method: "GET",
            headers: { "X-API-KEY": "abb98582ec0343268a2fd47cfdf46036" },
            url: `https://api.opensea.io/api/v1/collection/${res2.data.collections[0].slug}`,
          };

          let owner_data = await axios.request(options_owner);
          const uniqueHolder = owner_data.data.collection.stats.num_owners;

          const collectionId = res2.data.collections[0].id;
          const collectionName = res2.data.collections[0].name;
          const collectionSlug = res2.data.collections[0].slug;

          const collectionOpenseaUrl = `https://opensea.io/collection/${collectionSlug}`;
          const collectionEtherscanUrl = `https://etherscan.io/token/${collectionId}`;

          let captionText = `\n🌄 _${collectionName}_\n_${collectionId}_\n\n⚡️ *Network: ETHEREUM*\n\n💰 *Price*: ${price} eth\n📉 *Floor Change*:\n🗓 *1 Day*: ${floorChange1day}%\n🗓 *7 Day*: ${floorChange7day}%\n🗓 *30 Day*: ${floorChange30day}%\n📈 *Total Volume*: ${totalVolume} eth\n💎 *Unique Holders*: ${uniqueHolder}\n💎 *Listed*: ${listed.toFixed(
            2
          )} %\n\n🔗 Collection Links:\n[Opensea](${collectionOpenseaUrl}) | [Etherscan](${collectionEtherscanUrl})`;
          captionText = captionText.replace(/\./g, "\\.");
          captionText = captionText.replace(/\+/g, "\\+");
          captionText = captionText.replace(/\-/g, "\\-");
          captionText = captionText.replace(/\|/g, "\\|");

          ctx
            .replyWithPhoto(res.url, {
              caption: captionText,
              parse_mode: "MarkdownV2",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "▫️ advertiser ▫️",
                      url: "https://t.me/EthereumBitcoinNews",
                    },
                  ],
                ],
              },
            })
            .then((r) => {
              console.log(r);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.error(err);
      Myctx.reply("Can`t find this collection");
    });
};

const searchCollection_collectionName = async (ctx, msg) => {
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
        .then(async (res2) => {
          let url = `https://api.reservoir.tools/events/collections/floor-ask/v1?collection=${response.data.collections[0].collectionId}&sortDirection=desc&limit=31`;

          let data = await axios.get(url);

          let configuration = {
            type: "line",
            data: {
              labels: [],
              datasets: [
                {
                  label: "Floor Price",
                  data: [],
                  fill: false,
                  borderColor: ["rgb(51, 204, 204)"],
                  borderWidth: 1,
                  xAxisID: "xAxis1",
                },
              ],
            },
          };

          const curDate = new Date().valueOf();

          configuration.data.datasets[0].data = [];
          configuration.data.labels = [];

          for (let index = 0; index < data.data.events.length; index++) {
            const element = data.data.events[index];

            const DateNum =
              String(
                new Date(
                  curDate -
                    24 * 60 * 60 * 1000 * (data.data.events.length - index)
                )
              ).split(" ")[1] +
              "-" +
              new Date(
                curDate -
                  24 * 60 * 60 * 1000 * (data.data.events.length - index)
              ).getDate();

            configuration.data.labels.push(DateNum);
            configuration.data.datasets[0].data.push(
              Number(element.floorAsk.price)
            );
          }

          const dataUrl = await chartJSNodeCanvas.renderToDataURL(
            configuration
          );
          const base64Image = dataUrl;

          var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

          fs.writeFileSync(`out.png`, base64Data, "base64", function (err) {
            if (err) {
              console.log(err);
            }
          });

          const image_file = fs.readFileSync(`out.png`);

          filestack_client
            .upload(image_file)
            .then(async (res) => {
              const price =
                res2.data.collections[0].floorAsk.price.amount.native.toFixed(
                  4
                );
              const floorChange1day =
                res2.data.collections[0].floorSaleChange["1day"] >= 1
                  ? "+" +
                    (
                      (res2.data.collections[0].floorSaleChange["1day"] - 1) *
                      100
                    ).toFixed(2)
                  : "-" +
                    (
                      (1 - res2.data.collections[0].floorSaleChange["1day"]) *
                      100
                    ).toFixed(2);

              const floorChange7day =
                res2.data.collections[0].floorSaleChange["7day"] >= 1
                  ? "+" +
                    (
                      (res2.data.collections[0].floorSaleChange["7day"] - 1) *
                      100
                    ).toFixed(2)
                  : "-" +
                    (
                      (1 - res2.data.collections[0].floorSaleChange["7day"]) *
                      100
                    ).toFixed(2);

              const floorChange30day =
                res2.data.collections[0].floorSaleChange["30day"] >= 1
                  ? "+" +
                    (
                      (res2.data.collections[0].floorSaleChange["30day"] - 1) *
                      100
                    ).toFixed(2)
                  : "-" +
                    (
                      (1 - res2.data.collections[0].floorSaleChange["30day"]) *
                      100
                    ).toFixed(2);

              const totalVolume =
                res2.data.collections[0].volume.allTime.toFixed(4);

              const listed =
                (Number(res2.data.collections[0].onSaleCount) /
                  Number(res2.data.collections[0].tokenCount)) *
                100;

              const options_owner = {
                method: "GET",
                headers: { "X-API-KEY": "abb98582ec0343268a2fd47cfdf46036" },
                url: `https://api.opensea.io/api/v1/collection/${res2.data.collections[0].slug}`,
              };

              let owner_data = await axios.request(options_owner);
              const uniqueHolder = owner_data.data.collection.stats.num_owners;

              const collectionId = res2.data.collections[0].id;
              const collectionName = res2.data.collections[0].name;
              const collectionSlug = res2.data.collections[0].slug;

              const collectionOpenseaUrl = `https://opensea.io/collection/${collectionSlug}`;
              const collectionEtherscanUrl = `https://etherscan.io/token/${collectionId}`;

              let captionText = `\n🌄 _${collectionName}_\n_${collectionId}_\n\n⚡️ *Network: ETHEREUM*\n\n💰 *Price*: ${price} eth\n📉 *Floor Change*:\n🗓 *1 Day*: ${floorChange1day}%\n🗓 *7 Day*: ${floorChange7day}%\n🗓 *30 Day*: ${floorChange30day}%\n📈 *Total Volume*: ${totalVolume} eth\n💎 *Unique Holders*: ${uniqueHolder}\n💎 *Listed*: ${listed.toFixed(
                2
              )} %\n\n🔗 Collection Links:\n[Opensea](${collectionOpenseaUrl}) | [Etherscan](${collectionEtherscanUrl})`;
              captionText = captionText.replace(/\./g, "\\.");
              captionText = captionText.replace(/\+/g, "\\+");
              captionText = captionText.replace(/\-/g, "\\-");
              captionText = captionText.replace(/\|/g, "\\|");

              ctx
                .replyWithPhoto(res.url, {
                  caption: captionText,
                  parse_mode: "MarkdownV2",
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "▫️ advertiser ▫️",
                          url: "https://t.me/EthereumBitcoinNews",
                        },
                      ],
                    ],
                  },
                })
                .then((r) => {
                  console.log(r);
                });
            })
            .catch((err) => {
              console.log(err);
            });
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
    .then(async (res_sol_collection) => {
      let url = `https://cloudflare-worker-nft.solswatch.workers.dev/chart-data/30/${msg}`;

      let data = await axios.get(url);
      data = data.data[1];

      let configuration = {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Floor Price",
              data: [],
              fill: true,
              borderColor: ["rgb(51, 204, 204)"],
              borderWidth: 1,
              xAxisID: "xAxis1",
            },
          ],
        },
      };

      configuration.data.datasets[0].data = [];
      configuration.data.labels = [];

      for (let index = 0; index < data.length - 1; index++) {
        const element = data[index];
        const DateNum =
          String(new Date(element.date)).split(" ")[1] +
          "-" +
          new Date(element.date).getDate();
        configuration.data.labels.push(DateNum);
        configuration.data.datasets[0].data.push(
          Number(element.me_floor_price)
        );
      }

      const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
      const base64Image = dataUrl;

      var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

      fs.writeFileSync(`out.png`, base64Data, "base64", function (err) {
        if (err) {
          console.log(err);
        }
      });

      const image_file = fs.readFileSync(`out.png`);

      filestack_client
        .upload(image_file)
        .then(async (res) => {
          let captionText = `\n🌄 _${
            res_sol_collection.data[0].name
          }_\n\n⚡️ *Network: Solana*\n\n💰 *Price*: ${res_sol_collection.data[0].floor_price.toFixed(
            4
          )} sol\n📉 *Floor Change*:\n🗓 *1 Day*: ${res_sol_collection.data[0].daily_floor.toFixed(
            2
          )}%\n🗓 *7 Day*: ${res_sol_collection.data[0].weekly_floor.toFixed(
            2
          )}%\n🗓 *30 Day*: ${res_sol_collection.data[0].monthly_floor.toFixed(
            2
          )}%\n📈 *Total Volume*: ${res_sol_collection.data[0].me_total_volume.toFixed(
            4
          )} sol\n💎 *Total Supply*: ${
            res_sol_collection.data[0].total_items
          }\n💎 *Listed*: ${
            res_sol_collection.data[0].me_listed_count
          } %\n\n🔗 Collection Links:\n[MagicEden](https://magiceden.io/marketplace/${
            res_sol_collection.data[0].magiceden
          })`;
          captionText = captionText.replace(/\./g, "\\.");
          captionText = captionText.replace(/\+/g, "\\+");
          captionText = captionText.replace(/\-/g, "\\-");
          captionText = captionText.replace(/\|/g, "\\|");

          ctx
            .replyWithPhoto(res.url, {
              caption: captionText,
              parse_mode: "MarkdownV2",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "▫️ advertiser ▫️",
                      url: "https://t.me/solana_price_bot",
                    },
                  ],
                ],
              },
            })
            .then((r) => {
              console.log(r);
            });
        })
        .catch((err) => {
          console.log(err);
        });
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

bot.on("message", async (ctx) => {
  // check if bot is started
  if (Myctx == null) {
    bot.telegram.sendMessage(
      ctx.chat.id,
      "Please use the /start command to start the bot"
    );
  }

  InputCallBack(ctx);
});

bot.launch();
