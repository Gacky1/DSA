const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const QRCode = require('qrcode');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Load config from file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const User_Id = '1207080495549259776';

// Initialize client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping
  ]
});

// Bot ready event handler
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  try {
    // Register commands globally
    const commands = [
      {
        name: 'createqr',
        description: 'Create a UPI QR code',
        options: [
          {
            name: 'upi_id',
            type: 3,
            description: 'UPI ID',
            required: true
          },
          {
            name: 'amount',
            type: 10,
            description: 'Amount',
            required: true
          }
        ]
      },
      {
        name: 'mybal',
        description: 'Check your Litecoin balance',
        dm_permission: true
      },
      {
        name: 'ltcbal',
        description: 'Check balance of a Litecoin address',
        options: [
          {
            name: 'ltcaddress',
            type: 3,
            description: 'Enter Litecoin address',
            required: true
          }
        ],
        dm_permission: true
      },
      {
        name: 'vouch',
        description: 'Send a sell vouch message',
        options: [
          {
            name: 'text',
            type: 3,
            description: 'Enter vouch text',
            required: true
          }
        ],
        dm_permission: true
      },
      {
        name: 'exch',
        description: 'Send an exchange vouch message',
        options: [
          {
            name: 'text',
            type: 3,
            description: 'Enter exchange text',
            required: true
          }
        ],
        dm_permission: true
      }
    ];

    try {
      // Register commands globally
      const globalCommands = await client.application?.commands.set(commands);
      console.log(`Registered ${globalCommands?.size} global commands.`);
    
      // Optional: Register for a specific guild (replace 'GUILD_ID' with the guild's ID)
      const guildCommands = await client.application?.commands.set(commands, '1320305299181277204');
      console.log(`Registered ${guildCommands?.size} guild commands.`);
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  } catch (error) {
    console.error('Error', error);
  }
});

// Create buttons for copying information
const createCopyButtons = (upi_id, paynote) => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('copy_upi')
      .setLabel('Copy UPI ID')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('copy_ltc')
      .setLabel('Copy LTC Address')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('copy_paynote')
      .setLabel('Copy Paynote')
      .setStyle(ButtonStyle.Primary)
  );
};

// Handle all interactions (commands and buttons)
client.on('interactionCreate', async interaction => {
  try {
    // Handle button clicks
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'copy_upi':
          await interaction.reply({ 
            content: interaction.message.embeds[0].description.match(/UPI ID: (.*)\n/)[1], 
            ephemeral: true 
          });
          break;
        case 'copy_ltc':
          await interaction.reply({ 
            content: 'LRXd3pmtt8BtrZkChK65j3vM9UVkcLtsTp', 
            ephemeral: true 
          });
          break;
        case 'copy_paynote':
          await interaction.reply({ 
            content: 'I authorize this payment and received my products and amount', 
            ephemeral: true 
          });
          break;
      }
      return;
    }

    // Handle slash commands
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case 'createqr': {
        const upi_id = interaction.options.getString('upi_id');
        const amount = interaction.options.getNumber('amount');
        const paynote = 'I authorize this payment and received my products and amount';
        
        // Generate QR code
        const qrData = `upi://pay?pa=${upi_id}&pn=YourName&mc=YourMerchantCode&tid=YourTransactionId&am=${amount}&cu=INR&url=`;
        const qrBuffer = await QRCode.toBuffer(qrData);
        
        const embed = new EmbedBuilder()
          .setTitle('UPI Payment QR Code')
          .setDescription(`**UPI ID:** ${upi_id}\n**Amount:** ₹${amount.toFixed(2)}\n**Note:** \`${paynote}\`\nPlease scan the QR code below to make the payment.`)
          .setColor(0x0099FF);

        await interaction.reply({ 
          embeds: [embed],
          components: [createCopyButtons(upi_id, paynote)],
          files: [{ attachment: qrBuffer, name: 'qr.png' }]
        });
        break;
      }

      case 'mybal':
      case 'ltcbal': {
        const address = interaction.commandName === 'mybal' ? 
          config.LTC_ADDY : 
          interaction.options.getString('ltcaddress');
        
        // Fetch balance and price data
        const [balanceRes, priceRes] = await Promise.all([
          axios.get(`https://api.blockcypher.com/v1/ltc/main/addrs/${address}/balance`),
          axios.get('https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd')
        ]);

        const balance = balanceRes.data.balance / 1e8;
        const totalBalance = balanceRes.data.total_received / 1e8;
        const unconfirmedBalance = balanceRes.data.unconfirmed_balance / 1e8;
        const usdPrice = priceRes.data.litecoin.usd;

        const embed = new EmbedBuilder()
          .setTitle(interaction.commandName === 'mybal' ? 'Your Litecoin Balance' : 'Litecoin Balance for Address')
          .setDescription(
            `**CURRENT LTC BALANCE** : \`$${(balance * usdPrice).toFixed(2)}\` USD\n` +
            `**TOTAL LTC RECEIVED** : \`$${(totalBalance * usdPrice).toFixed(2)}\` USD\n` +
            `**UNCONFIRMED LTC** : \`$${(unconfirmedBalance * usdPrice).toFixed(2)}\` USD\n`
          )
          .setColor(0x0099FF);

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'vouch':
      case 'exch': {
        const text = interaction.options.getString('text');
        const message = interaction.commandName === 'vouch' 
          ? `+rep ${User_Id} LEGIT SELLER | GOT ${text} • TYSM`
          : `+rep ${User_Id} LEGIT | EXCHANGED ${text} • TYSM`;

        const channel = interaction.channel;
        
        await channel.send(message);
        await channel.send(config.SERVER_LINK);
        await channel.send('**PLEASE VOUCH ME HERE**');
        
        if (interaction.commandName === 'vouch') {
          await channel.send('**NO VOUCH NO WARRANTY OF PRODUCT**');
        }
        
        await interaction.reply({ content: 'Message sent successfully.', ephemeral: true });
        break;
      }
    }
  } catch (error) {
    console.error(error);
    const errorResponse = { 
      content: `An error occurred: ${error.message}`, 
      ephemeral: true 
    };
    
    if (!interaction.replied) {
      await interaction.reply(errorResponse);
    } else {
      await interaction.followUp(errorResponse);
    }
  }
});

// Start the bot
client.login(process.env.TOKEN);