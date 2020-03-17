# Decentralized Internet
![npm](https://img.shields.io/npm/dt/decentralized-internet?label=NPM%20Downloads) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet?ref=badge_shield)
| ![Crates.io](https://img.shields.io/crates/d/decentralized-internet?label=crates.io%20Downloads) | [![Discord](https://img.shields.io/discord/639489591664967700)](https://discord.gg/buTafPc) | [![Gitter](https://img.shields.io/gitter/room/Decentralized-Internet/community)](https://gitter.im/Decentralized-Internet/community?source=orgpage) | [![Read the Docs](https://img.shields.io/readthedocs/lonero)](https://lonero.readthedocs.io/en/latest/)

The NPM library is a collection of the following repos made for the purpose of building decentralized web projects:

[lotion](https://github.com/nomic-io/lotion) | [bitcoin-peg](https://www.npmjs.com/package/bitcoin-peg) | [clusterpost](https://github.com/juanprietob/clusterpost) | [gridbee-framework](https://github.com/BME-IK/gridbee-framework) | [Reinvent-the-Internet](https://github.com/Mentors4EDU/Reinvent-the-Internet)

Also special thanks to:
[The Lonero Dev Team](https://github.com/lonero-team)
   
 * May need some updates in Seed Migration for some of the org repos
 
Papers worth checking out:
[Lonero Whitepaper (Original)](https://www.academia.edu/37041064/Lonero_Whitepaper_v1)  | [CrowdCoin Scientific Whitepaper](https://www.academia.edu/37832290/CrowdCoin_Scientific_Whitepaper)

This NPM library/package is being mantained by the folks [here](starkdrones.org/home/os)

#### Lotion Sample (State Machines):
* From original [Lotion](https://lotionjs.com/) [repo](https://github.com/nomic-io/lotion) (shown on installation page for demo purposes)

```
// app.js
let lotion = require('lotion')
let app = lotion({
	initialState: {
		count: 0
	}
})
function transactionHandler(state, transaction) {
	if (state.count === transaction.nonce) {
		state.count++
	}
}
let connect = require('lotion-connect')
app.use(transactionHandler)
app.start().then(appInfo => console.log(appInfo.GCI))
```

#### ccxml Device Connection Sample Code:
- xml taken from TI's IDE in device config for driver
```
<connection XML_version="1.2" id="TI MSP430 USB1">
```
#### Installation Methods
Install via NPM: `npm i decentralized-internet`  
Install via DUB: `dub add decentralized-internet`  
Install via YARN: `yarn add decentralized-internet`  
Install via PIP: `pip install decentralized-internet`  
Install via APM: `apm install decentralized-internet`  
Install via GEM: `gem install decentralized-internet`  
Install via PNPM: `pnpm install decentralized-internet`  
Ember Installation:  `ember install decentralized-internet`  
Install via Spack: `./spack install decentralized-internet`  
Install via VS Code: `ext install Lonero.decentralized-internet`  
Install through Leiningen/Boot: `[decentralized-internet "0.1.0"]`  
Install via SNAP: `sudo snap install decentralized-internet --edge`  
Install via Docker: `docker pull gamer456148/decentralized-internet`  
Install via Bower: `bower install Lonero-Team/Decentralized-Internet`  
Use Clojure CLI/deps.edn: `decentralized-internet {:mvn/version "0.1.0"}`  
Use Gradle:`Compile 'decentralized-internet:decentralized-internet:0.1.0'`  
Use wget: `sudo wget -O decentralized-internet.tar.gz "https://git.io/JvR7b"`  
##### Export Components: 
`bit export decentralized-internet.lonero_decentralized-internet`  
##### Add via Maven
```
<dependency>
  <groupId>decentralized-internet</groupId>
  <artifactId>decentralized-internet</artifactId>
  <version>0.1.0</version>
</dependency>
```  
##### Sysget Users:
`sysget install decentralized-internet`  
*Pick either option: 4, 14, 15, 18 or 20*  
##### Arch Linux Installation Instructions:
```
git clone https://aur.archlinux.org/snapd.git
cd snapd
makepkg -si
sudo systemctl enable --now snapd.socket
sudo ln -s /var/lib/snapd/snap /snap
sudo snap install decentralized-internet --edge
```  
##### Install via Dart:
Add to your pubspec.yaml file:
```
dependencies:
  decentralized_internet: ^3.4.1
```
Run: `pub get`
##### Use this Module via Puppet:
Add this to your Puppetfile as a declaration:  
`mod 'gamer456148-decentralized_internet', '3.0.0'`  
Next run the command:  
`bolt puppetfile install`  
Instead of the above, you can also try adding:  
`mod 'gamer456148-decentralized_internet', '3.0.0'`  
This mod line is for those who use r10k or Code Manager  
Learn more [here](https://puppet.com/docs/pe/2019.2/managing_puppet_code.html)
###### App to add GitHub metrics tracking to select repos [here](https://github.com/apps/decentralized-internet) 
###### [Potential BitBucket Marketplace App](https://bitbucket.org/gamer456148/decentralized-internet/src/master/)
###### See original compatibility status update [here](https://www.minds.com/newsfeed/1040672641569824768?referrer=LoneroLNR)
***** See NPM v.Updates

#### For Mac Users:
[![MAC](https://jaywcjlove.github.io/sb/download/macos.svg)](https://github.com/Lonero-Team/Decentralized-Internet/releases/download/v1.0_mac/Decentralized-Internet.dmg)
##### Sketch Plugin: `wget https://git.io/Jv2pk`

###### Latest Git Release Package [here](https://github.com/Lonero-Team/Decentralized-Internet/releases/tag/v3.6.9)  
[![GitPod](https://jaywcjlove.github.io/sb/open/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Lonero-Team/Decentralized-Internet)  
## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet?ref=badge_large)
