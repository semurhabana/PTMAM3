let modInfo = {
	name: "Another Prestige Tree Mod Where You Merge Things, Now With Much More Time To Waste! Also, There Isn't Even A Tree Anymore So It's Just A Prestige Mod",
	id: "aptmwymtnwmmttw",
	author: "Technokaguya",
	pointsName: "energy",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.1",
	name: "Literally nothing v2",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0.1</h3><br>
		- Patched the game.<br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

function getMergeableWorkBoosts() {
  let boost=new Decimal(0)
  for(var i in player.p.grid) {
    if (new Decimal(getGridData("p", i)).gt(0)) boost=boost.add(layers.p.grid.getEffect(new Decimal(getGridData("p", i)), i))
  }
  return boost
}

function getMergeableLevelBoosts() {
  let boost=new Decimal(1)
  for(var i in player.tok.grid) {
    if (new Decimal(getGridData("tok", i)).gt(0)) boost=boost.mul(layers.tok.grid.getEffect(new Decimal(getGridData("tok", i)), i))
  }
  return boost
}


function getHighestMergeable(layer) {
  let boost=new Decimal(0)
  for(var i in player[layer].grid) {
    if (new Decimal(getGridData(layer, i)).gt(boost)) boost=new Decimal(getGridData(layer, i))
  }
  return boost
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = getMergeableWorkBoosts().times(928383738287378282746471564634783243743383426687241)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
  seedColor: getRNGSeed()
}}

// Display extra things at the top of the page
var displayThings = [
  function() {
    if (!player.lev.unlocked) 
    return "Unlock Leveling at 10,000 energy ("+format(player.points.div(100))+"%)"
    if (!player.lev.levels.gte(10)) 
    return "Unlock a new set of upgrades at level 10 ("+format(player.lev.levels.add((player.a.vip.div(layers.lev.toNextLevel()))).mul(10))+"%)"
    if (!player.tok.unlocked) 
    return "Unlock Mergent Tokens at mergeable tier 12 ("+format(getHighestMergeable("p").div(12).mul(100))+"%)"
    if (!player.tok.unlockedGilded) 
    return "Unlock Gilded Mergeables after getting all mergent upgrades ("+format(new Decimal(player.tok.upgrades.length).div(15).mul(100))+"%)"
    if (!player.lev.unlockedNewUpgrades) 
    return "Unlock more leveling upgrades at gilded mergeable tier 4 ("+format(new Decimal(getHighestMergeable("tok").div(4).mul(100)))+"%)"
	else
    return "All content unlocked."
  },
  function() {
    return "You have merged "+formatWhole(player.p.merges)+" times."
  },
  function() {
    return "You have "+formatWhole(player.a.vip)+tmp.a.vipGenDesc+"VIP Points."
  },
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(120) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
	if (oldVersion == "0.0") {
		if (player.tok.total.gte(1)) {
			layerDataReset("tok")
			player.tok.points = player.tok.points.add(1)
			player.tok.best = player.tok.best.add(1)
			player.tok.total = player.tok.total.add(1)

		}
		if (player.lev.levels.gte(17)) {
			player.lev.levels = new Decimal(0)
			tmp.lev.buyables.respec()
			player.lev.spent = new Decimal(0)
		}
	}
}
