# Roll20 API Scripts

* Skype: RobinKuiper.eu
* Discord: Atheos#1014
* Roll20: https://app.roll20.net/users/1226016/robin-k
* Reddit: https://www.reddit.com/user/robinkuiper/

---

**Table of Contents**
* [BeyondImporter](#beyondimporter)
* [StatusInfo](#statusinfo)

---

## BeyondImporter

```
NOTICE: The commands are changed since the last update, read the description below.
```

Beyond Importer let's you import a character sheet from DNDBeyond into Roll20 **5eOGL Character Sheet**.

At the moment this is still in development. But the main import is working, let me know if you find any errors or if you have any suggestions.

### How it works
Go to the character page on DNDBeyond and put '/json' after the url, eg:

```
https://www.dndbeyond.com/profile/Atheos/characters/1307201/json
```

Copy the entire content of that page, and go to Roll20.
In the Roll20 chat type the command `!beyond import` and paste the copied contents after that, eg:

```
!beyond import {"character":{"id":1307201,"name":"Qroohk","player":"Atheos","age":null,"hair":null,"eyes":null,"skin":null,"height":null,"weight":null,"size":"Medium","alignment":"Lawful Good" ..........
```

Your character will be imported now!

### Commands

* **!beyond help** - Shows the help menu.
* **!beyond config** - Shows the config menu.
* **!beyond import [CHARACTER JSON]** - Imports a character from the DNDBeyond json.

![Config Menu](https://i.imgur.com/WLb76Uy.png "Config Menu")

Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets

---

## StatusInfo

StatusInfo works nicely together with [Tokenmod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825).
It shows condition descriptions whenever a statusmarker is set or when the command `!condition` is used, eg: `!condition prone`.

![Prone Description](https://i.imgur.com/NhASVq0.png "Prone Description")

It uses the following condition/statusmarker list:

* Blinded, bleeding-eye
* Charmed, broken-heart
* Deafened, edge-crack
* Frightened, screaming
* Grappled, grab
* Invisibility, ninja-mask
* Incapacitated, interdiction
* Paralyzed, pummeled
* Petrified, frozen-orb
* Poisoned, chemical-bolt
* Prone, back-pain
* Restrained, fishing-net
* Stunned, fist
* Unconscious, sleepy

I run this with the following Tokenmod macro:

```
!token-mod ?{Status|Concentrating, --set statusmarkers#!blue|Readying, --set statusmarkers#!stopwatch|-, |Blinded, --set statusmarkers#!bleeding-eye --flip light_hassight|Charmed, --set statusmarkers#!broken-heart|Deafened, --set statusmarkers#!edge-crack|Frightened, --set statusmarkers#!screaming|Grappled, --set statusmarkers#!grab|Invisibility, --set statusmarkers#!ninja-mask|Incapacitated, --set statusmarkers#!interdiction|Paralyzed, --set statusmarkers#!pummeled|Petrified, --set statusmarkers#!frozen-orb|Poisoned, --set statusmarkers#!chemical-bolt|Prone, --set statusmarkers#!back-pain|Restrained, --set statusmarkers#!fishing-net|Stunned, --set statusmarkers#!fist|Unconscious, --set statusmarkers#!sleepy|-, |Blessed, --set statusmarkers#!angel-outfit|Raging, --set statusmarkers#!overdrive|Marked, --set statusmarkers#!archery-target|-, |Dead, --set statusmarkers#=dead|-, |Clear Conditions, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-dead|Clear All, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-angel-outfit#-overdrive#-blue#-stopwatch#-archery-target#-dead}
```

Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo