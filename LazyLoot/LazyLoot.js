/*
 * Version 0.1.0
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var LazyLoot = LazyLoot || (function() {
    'use strict';

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #000; text-decoration: underline',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
    },
    script_name = 'LazyLoot',
    state_name = 'LAZYLOOT',

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        let config = state[state_name].config;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == config.command) {
            if(!playerIsGM(msg.playerid)){
                // Player Commands
                switch(extracommand){
                    case 'take':
                        let playerid = msg.playerid, 
                            sender = msg.who,   
                            lootid = args.shift(),
                            itemid = args.shift(),
                            quantity = args.shift(),
                            characterid = args.shift(),
                            loot = get.loot_table(lootid);

                            if(!loot || !loot.given){
                                message.error('No loot for you!', sender);
                                return;
                            }

                        let item = loot.items[itemid],
                            character = getObj('character', characterid);

                        if(!item){
                            message.error('Item not found.', sender);
                            return;
                        }

                        if(item.taken){
                            message.error('Item is already taken by someone else.', sender);
                            return;
                        }

                        if(!characterid){
                            let characters = findObjs({ type: 'character', controlledby: playerid });

                            if(characters.length > 1){
                                let contents = '<p>To which character do you want to add the item: "<b>'+item.name+'</b>":</p>';
                                characters.forEach(character => {
                                    contents += make.button(character.get('name'), '!' + config.command + ' take ' + lootid + ' ' + itemid + ' ' + quantity + ' ' + character.get('id')) + '<br>';
                                });
                                make.menu(contents, '', sender);
                                return;
                            }else if(characters.length === 1){
                                characterid = characters[0].get('id');
                            }else{
                                message.error('You don\'t have any characters.', sender);
                                return;
                            }
                        }

                        if(character){
                            if(item.quantity > 1){
                                quantity = (quantity) ? (quantity <= item.quantity) ? parseInt(quantity) : item.quantity : quantity - 1;
                                item.quantity -= quantity;
                                if(item.quantity <= 0){
                                    item.taken = true;
                                }
                            }else{
                                item.taken = true;
                            }
                            addItemToInventory(item, character, quantity);
                            message.success(item.name + ' added to ' + character.get('name') + '\'s inventory.', sender);
                            giveToPlayers(lootid);
                            return;
                        }else{
                            message.error('Couldn\'t find character', sender);
                            return;
                        }
                    break;

                    default:

                    break;
                }
            }else{
                // GM Commands
                switch(extracommand){
                    case 'reset':
                        if(args.shift().toLowerCase() !== 'yes') return;

                        state[state_name] = {};
                        setDefaults(true);
                        config_menus.main();
                    break;

                    case 'import':
                        let type = args.shift();
                        let json = msg.content.substring(('!'+config.command+' import ' + type + ' ').length);
                        jsonImport(type, json);

                        config_menus.main();
                    break;

                    case 'export':
                        jsonExport(args.shift());
                    break;

                    case 'config':
                        let menu = 'main';

                        if(args[0] && !args[0].includes('|')){
                            menu = args.shift();
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            config[key] = value;
                        }

                        config_menus[menu]();
                    break;

                    case 'loot_table':
                        let l_id = args.shift();

                        if(l_id === 'new'){
                            let name = args.shift();

                            if(!name || name === ''){
                                message.error('No name was given.');
                                return;
                            }

                            create.loot_table(name);
                        }else{
                            let DO = args.shift();

                            switch(DO){
                                case 'remove':
                                    remove.loot_table(l_id);
                                    menus.main();
                                    return;
                                break;

                                case 'give':
                                    giveToPlayers(l_id);
                                    return;
                                break;

                                case 'item':
                                    let i_id = args.shift();

                                    if(i_id === 'new'){
                                        let item_name = args.shift().replace('_', ' '),
                                            quantity = parseInt(args.shift()),
                                            weight = parseInt(args.shift()),
                                            description = args.join(' ');

                                        if(!item_name || item_name === ''){
                                            message.error('No item name was given.');
                                            return;
                                        }

                                        create.item(l_id, item_name, quantity, weight, description);
                                    }

                                    let DO_ITEM = args.shift();

                                    switch(DO_ITEM){
                                        case 'remove':
                                            remove.item(l_id, i_id);
                                        break;
                                    }
                                break;
                            }

                            menus.loot_table(l_id);
                            return;
                        }

                        menus.main();
                    break;

                    default:
                        let page = parseInt(extracommand, 10);
                        menus.main((!page) ? 1 : page);
                    break;
                }
            }
        }
    },

    giveToPlayers = (l_id) => {
        let config = state[state_name].config,
            command = '!' + config.command,
            loot = get.loot_table(l_id);

        state[state_name].loot[l_id].given = true;

        let itemListItems = [];
        if(loot.items.length){
            loot.items.forEach((item, i_id) => {
                let quantity = '';
                if(item.quantity > 1){
                    quantity = '?{How many?';
                    for(var i = 1; i <= item.quantity; i++){
                        quantity += '|'+i;
                    }
                    quantity += '}';
                }
                let button = (item.taken) ? '<b style="'+styles.float.right+'">Taken</b>' : make.button('Take', command + ' take ' + l_id + ' ' + i_id + ' ' + quantity, styles.button + styles.float.right);
                let name = (item.quantity > 1) ? item.quantity + 'x ' + item.name : item.name;
                itemListItems.push(name + button);
            });
        }else{
            itemListItems.push('No treasure found.');
        }

        let contents = '';
        contents += make.list(itemListItems);

        make.menu(contents, 'Treasure', '');
    },

    addItemToInventory = (item, character, quantity) => {
        let prevAdded = [];
        let row = generateRowID();

        let attributes = {};
        attributes["repeating_inventory_"+row+"_itemname"] = item.name;
        attributes["repeating_inventory_"+row+"_equipped"] = '0';
        attributes["repeating_inventory_"+row+"_itemcount"] = quantity;
        attributes["repeating_inventory_"+row+"_itemweight"] = item.weight;
        attributes["repeating_inventory_"+row+"_itemcontent"] = replaceChars(item.description);

        setAttrs(character.get('id'), attributes);
    },

    get = {
        loot_table: (l_id) => state[state_name].loot[l_id],
    },

    create = {
        loot_table: (name) => state[state_name].loot.push({ name, given: false, items: [] }),
        item: (l_id, name, quantity=1, weight=0, description) => state[state_name].loot[l_id].items.push({
            name, 
            taken: false,
            quantity,
            weight,
            description
        }),
    },

    remove = {
        loot_table: (l_id) => state[state_name].loot.splice(l_id, 1),
        item: (l_id, i_id) => state[state_name].loot[l_id].items.splice(i_id, 1),
    },

    menus = {
        main: (page=1) => {
            let config = state[state_name].config,
                command = '!' + config.command,
                loot = state[state_name].loot;

            let buttons = {
                new: make.button('New Loot Table', command + ' loot_table new ?{Name}', styles.button),
                next: make.button('>', command + ' ' + parseInt(page+1), styles.button + styles.float.right),
                prev: make.button('<', command + ' ' + parseInt(page-1), styles.button + styles.float.left),
            }

            let lootListItems = [];
            if(loot.length){
                let start = (page-1)*10;
                let end = (page*10 >= loot.length-1) ? loot.length-1 : page*10-1;

                if(start > end){
                    lootListItems.push('No more loot tables.');
                }

                for(var i = start; i <= end; i++){
                    let itemButton = make.button(loot[i].name, command + ' loot_table ' + i, styles.textButton + styles.float.left);
                    let giveButton = make.button('G', command + ' loot_table ' + i + ' give', styles.button + styles.float.right);
                    //let removeButton = make.button('R', command + ' loot_table ' + i + ' remove', styles.button + styles.float.right);
                    lootListItems.push(itemButton + giveButton);
                }
            }else{
                lootListItems.push('No loot tables found.');
            }    
            
            let next = (loot.length > page*10);
            let prev = (page > 1);

            let contents = '';
            contents += make.list(lootListItems);
            if(prev || next){
                contents += '<hr>';
                contents += '<div style="'+styles.overflow+'">';
                contents += (prev) ? buttons.prev : '';
                contents += (next) ? buttons.next : '';
                contents += '</div>';
            }
            contents += '<hr>';
            contents += buttons.new;

            make.menu(contents, script_name + ' Menu', 'gm');
        },

        loot_table: (l_id) => {
            let config = state[state_name].config,
                command = '!' + config.command,
                loot = get.loot_table(l_id);

            let buttons = {
                add: make.button('Add Item', command + ' loot_table ' + l_id + ' item new ?{Item Name (replace spaces with _)} ?{Quantity} ?{Weight} ?{Description}', styles.button),
                give: make.button('Give Treasure', command + ' loot_table ' + l_id + ' give', styles.button + styles.fullWidth + ' background-color: green;'),
                remove: make.button('Remove', command + ' loot_table ' + l_id + ' remove', styles.button + styles.fullWidth + ' background-color: red;'),
                back: make.button('< Back', command, styles.button + styles.fullWidth),
            }

            let itemListItems = [];
            if(loot.items.length){
                loot.items.forEach((item, i_id) => {
                    itemListItems.push('<span style="'+styles.float.left+'">'+item.name+'<div style="font-size: 8pt;"><i>Q: '+item.quantity+' | W: '+item.weight+' | D: '+handleLongString(item.description, 10, '..')+'</i></div></span>' + make.button('<img src="https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579" />', command + ' loot_table ' + l_id + ' item ' + i_id + ' remove', styles.button + styles.float.right + 'width: 16px; height: 16px;'));
                });
            }else{
                itemListItems.push('No items added yet.');
            }

            let contents = '';
            contents += make.list(itemListItems);
            contents += '<hr>';
            contents += buttons.add;
            contents += '<hr>';
            contents += (loot.items.length) ? buttons.give : '';
            contents += '<hr>';
            contents += buttons.back;
            contents += buttons.remove;
            make.menu(contents, script_name + ' - ' + loot.name, 'gm');
        }
    },

    config_menus = {
        main: (first, message) => {
            let config = state[state_name].config,
                command = '!' + config.command;

            let buttons = {
                command: make.button('!'+config.command, command + ' config command|?{Command (without !)}', styles.button + styles.float.right),
                reset: make.button('Reset Config', command + ' reset ?{Are you sure? Type Yes}', styles.button + styles.fullWidth + ' background-color: red;'),
                importConfig: make.button('Import Config', command + ' import config ?{JSON}', styles.button + styles.fullWidth),
                exportConfig: make.button('Export Config', command + ' export config', styles.button + styles.fullWidth),
                importLoot: make.button('Import Loot', command + ' import loot ?{JSON}', styles.button + styles.fullWidth),
                exportLoot: make.button('Export Loot', command + ' export loot', styles.button + styles.fullWidth),
            }

            let configListItems = [];
            configListItems.push(make.buttonListItem('Command', buttons.command));

            let importListItems = [
                buttons.exportLoot,
                buttons.importLoot,
                buttons.exportConfig,
                buttons.importConfig,
                buttons.reset
            ]

            let title = (first) ? script_name + ' First Time Setup' : script_name + ' Config';

            let contents = (message) ? '<p>'+message+'</p>' : '';
            contents += make.list(configListItems);
            contents += '<hr>';
            contents += '<p style="font-size: 80%">You can always come back to this config by typing `!'+config.command+' config`.</p>';
            contents += '<hr>';
            contents += make.list(importListItems, styles.reset + styles.list + styles.overflow + ' margin-right: -5px');

            make.menu(contents, title, 'gm');
        },
    },

    message = {
        error: (message, whisper='gm', style='border-color: red; color: red;') => {
            make.menu(message, '', whisper, style);
        },

        normal: (message, whisper='gm', style='') => {
            make.menu(message, '', whisper, style)
        },

        success: (message, whisper='gm', style='border-color: green; color: green;') => {
            make.menu(message, '', whisper, style)
        },
    },

    make = {
        menu: (contents, title, whisper, style='') => {
            title = (title && title != '') ? make.title(title) : '';
            whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
            sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+style+'">'+title+contents+'</div>', null, {noarchive:true});
        },

        title: (title) => {
            return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
        },

        button: (title, href, style) => {
            return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
        },

        list: (items, listStyle=styles.reset + styles.list + styles.overflow, itemStyle=styles.overflow) => {
            let list = '<ul style="'+listStyle+'">';
            items.forEach((item) => {
                list += '<li style="'+itemStyle+'">'+item+'</li>';
            });
            list += '</ul>';
            return list;
        },

        buttonListItem: (title, button) => {
            return '<span style="'+styles.float.left+'">'+title+':</span> ' + button;
        },
    },

    jsonExport = (type='config') => {
        make.menu('<pre>'+HE(JSON.stringify(state[state_name][type]))+'</pre><p>Copy the entire content above and save it to your pc.</p>');
    },

    jsonImport = (type='config', json) => {
        try{
            json = JSON.parse(json);
        } catch(e) {
            message.error('This is not a valid JSON string.');
            return;
        }
        state[state_name][type] = json;
    },

    handleLongString = (str, max=8, end='') => (str.length > max) ? str.slice(0, max) + end : str,

    replaceChars = (text) => {
        text = text.replace('\&rsquo\;', '\'').replace('\&mdash\;','—').replace('\ \;',' ').replace('\&hellip\;','…');
        text = text.replace('\û\;','û').replace('’', '\'').replace(' ', ' ');
        text = text.replace(/<li[^>]+>/gi,'• ').replace(/<\/li>/gi,'');

        return text;
    },

    //return an array of objects according to key, value, or key and value matching, optionally ignoring objects in array of names
    getObjects = (obj, key, val, except) => {
        except = except || [];
        let objects = [];
        for (let i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                if (except.indexOf(i) != -1) {
                    continue;
                }
                objects = objects.concat(getObjects(obj[i], key, val));
            } else
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val === '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    },

    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
                //' ' : '&'+'nbsp'+';',
                '<' : '&'+'lt'+';',
                '>' : '&'+'gt'+';',
                "'" : '&'+'#39'+';',
                '@' : '&'+'#64'+';',
                '{' : '&'+'#123'+';',
                '|' : '&'+'#124'+';',
                '}' : '&'+'#125'+';',
                '[' : '&'+'#91'+';',
                ']' : '&'+'#93'+';',
                '"' : '&'+'quot'+';'
            },
            re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),

    generateUUID = (function() {
        let a = 0, b = [];
        return function() {
            let c = (new Date()).getTime() + 0, d = c === a;
            a = c;
            for (var e = new Array(8), f = 7; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++){
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    }()),

    generateRowID = function() {
        "use strict";
        return generateUUID().replace(/_/g, "Z");
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].debug){ make.menu(script_name + ' Ready! Debug On.', '', 'gm') }
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'loot',
            },
            loot: [
                {
                    name: "Example Loot Table",
                    given: false,
                    items: [
                        {
                            name: "Item 1",
                            taken: false,
                            quantity: 3,
                            weight: 2,
                            description: "Test item 1"
                        },
                        {
                            name: "Item 2",
                            taken: false,
                            quantity: 1,
                            weight: 2,
                            description: "Test item 2"
                        },
                    ]
                },
                {
                    name: "Example Loot Table 2",
                    given: false,
                    items: [
                        {
                            name: "Item 1",
                            taken: false,
                            quantity: 1,
                            weight: 2,
                            description: "Test item 1"
                        },
                        {
                            name: "Item 2",
                            taken: false,
                            quantity: 1,
                            weight: 2,
                            description: "Test item 2"
                        },
                    ]
                }
            ]
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
        }
        if(!state[state_name].loot){
            state[state_name].loot = defaults.loot;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            config_menus.main(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        checkInstall,
        registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    LazyLoot.checkInstall();
    LazyLoot.registerEventHandlers();
});