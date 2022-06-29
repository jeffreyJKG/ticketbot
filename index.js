const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml')
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'], ws: { intents: Discord.Intents.ALL } })


function loadFile(file) {
    return myFile = yaml.load(fs.readFileSync(`${file}`, 'utf8'))
}


var path = require('path')
client.root = path.resolve(__dirname)

client.dir = __dirname



client.config = loadFile("./configs/config.yml")
client.taal = loadFile("./configs/taal.yml")


const modules = []
const commands = ["ticket", "general", "moderation", "embeds", "sollicitaties"]
const services = []
const flags = []

login = client.login(client.config.setup.token)


client.commands = new Discord.Collection();

fs.readdir("commands/", (err, files) => {
    if (err) console.log(err);
    var getJsFiles = files.filter((f) => f.split(".").pop() === "js");
    getJsFiles.forEach((f, i) => {
        var getFile = require(`./commands/${f}`);
        console.log(`Loading ${f}... `);
        client.commands.set(getFile.help.name, getFile);
        if (getFile.help.aliases) {
            getFile.help.aliases.forEach((alias) => {
                client.commands.set(alias, getFile);
            });
        }
    });
});

commands.forEach((c) => {
    fs.readdir(`./commands/${c}/`, (err, files) => {
        if (err) throw err;
        console.log(`Loaded ${files.length} commands (${c})`);
        files.forEach((f) => {
            if (!f.endsWith(".js")) return;
            let props = require(`./commands/${c}/${f}`);
            client.commands.set(props.help.name, props);
            if (props.help.aliases) {
                props.help.aliases.forEach((alias) => {
                    client.commands.set(alias, props);
                });
            }
        });
    });
});

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
        const event = require(`./events/${file}`)
        let eventName = file.split(".")[0]
        client.on(eventName, event.bind(null, client))
    })
})

client.on('guildMemberAdd', guildMember => {
    let welcomeRole = guildMember.guild.roles.cache.find(role => role.name === 'Bezoeker');
    const embed = new Discord.MessageEmbed()
        .setColor("#9e85f0")
        .setTitle('👋 **Welkom bij Discord Help**!')
        .setThumbnail("https://images-ext-2.discordapp.net/external/Nho1qv5UgMNuizk-ah7_c4lyNkL8nhHqxShfFFiD8ZQ/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/883838239075602502/055c2ca164bdbc047aaed4c233eb25f8.png")
        .setDescription(`Welkom <@${guildMember.user.id}>, leuk dat je __**Discord Help**__ gejoined bent!`)
        .addField('👤 __**Members:**__', `Wij hebben nu: **${guildMember.guild.memberCount}** leden!`, true)
        .setFooter('© Discord Help', 'https://images-ext-2.discordapp.net/external/Nho1qv5UgMNuizk-ah7_c4lyNkL8nhHqxShfFFiD8ZQ/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/883838239075602502/055c2ca164bdbc047aaed4c233eb25f8.png') 
        .setTimestamp()
    guildMember.guild.channels.cache.get('883837023180451850').send(embed)
    guildMember.roles.add(welcomeRole);
});

client.on('guildMemberRemove', guildMember => {
    const embed = new Discord.MessageEmbed()
        .setColor("#9e85f0")
        .setTitle('👋 **Zero logging**')
        .setDescription(`Helaas! <@${guildMember.user.id}> heeft zojuist __**Discord Help**__ verlaten!`)
        .setFooter('© Discord Help', 'https://images-ext-2.discordapp.net/external/Nho1qv5UgMNuizk-ah7_c4lyNkL8nhHqxShfFFiD8ZQ/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/883838239075602502/055c2ca164bdbc047aaed4c233eb25f8.png')
        .setTimestamp()
    guildMember.guild.channels.cache.get('883837043480871023').send(embed)
});

client.on('ready', ready => {
    console.log('Discord Help staat aan!')
    client.user.setActivity('Discord Help', { type: "WATCHING" });
})


client.on("message", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let prefix = client.config.setup.prefix;

    if (!message.content.startsWith(prefix)) return;
    var messageArray = message.content.split(" ");
    var command = messageArray[0].toLowerCase();
    var args = messageArray.slice(1);
    var configs = loadFile("./configs/config.yml")

    var commands = client.commands.get(command.slice(prefix.length));
    if (commands) commands.run(client, message, args);
});