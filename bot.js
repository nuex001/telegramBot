const TelgramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

const token = process.env.Token;
const PORT = process.env.PORT || 5000;
const bot = new TelgramBot(token, { polling: true , port: PORT});

/**
 * @ERROR1
 * The issue with the onText method is the way the regular expression is written. It should not include the backslashes when specifying the regex
 * /\start/ -> /\/start/
 */

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome to MEMESLAND bot! Use te getaddress command followed by your base and address"
  );
});

/**
 * @GETHOLDERS
 */
/**
 * @ERROR2
 * Keep havin issues with this slashes, LOL
 * Let's batch the response, we check when it has reache the max 4096
 */
bot.onText(/\/getaddress (.+)/, async (msg, match) => {
  const chatId = msg.chat.id; // I think this is for sending back message to the same exact chat
  const input = match[1].split(" "); //convert to array
  // console.log(input);
  if (input.length !== 2) {
    bot.sendMessage(
      chatId,
      "Please provide both Chain and address in this format : Base 0x...."
    );
    return; //to end the operation
  }
  const [chain, address] = input;
  console.log(chain, address);
  try {
    const res = await axios.get(
      `https://topmemebe.onrender.com/getErc20TokenHolders/${chain}/${address}`
    );
    const holders = res.data;
    let mainIndex = 0;
    console.log(holders.length);
    if (holders.length > 0) {
      let message = `Top holders for ${address}\n\n`;
       for (let index = 0; index < holders.length; index++) {
        let holdersInfo = `${index + 1}. Address: ${
          holders[index].wallet_address
        }\nAmount: ${holders[index].amount}\n\n`;
        if ((message + holdersInfo).length > 4096) {
          //telegram max limit
          bot.sendMessage(chatId, message);
          message = holdersInfo; //start new message
        } else {
          message += holdersInfo;
        }
        mainIndex ++;
      }

      if (message.length > 0 && holders.length === mainIndex) {
        bot.sendMessage(chatId, message);
        return; //to end the operation
      }
    } else {
      bot.sendMessage(chatId, "SERVER ERROR");
      return; //to end the operation
    }
  } catch (error) {
    console.log(error);
  }
  bot.sendMessage(msg.chat.id, "Done!");
});

console.log("Bot running.....");
