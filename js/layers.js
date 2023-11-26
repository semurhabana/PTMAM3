function getEnergyMultiplier() {
  let multiplier = new Decimal(1)
  multiplier = multiplier.mul(tmp.a.vipMultiplier)
  multiplier = multiplier.mul(tmp.p.buyables[22].effect)
  if (hasUpgrade("tok", 12)) multiplier = multiplier.mul(tmp.tok.upgrades[12].calc)
  if (hasUpgrade("tok", 22)) multiplier = multiplier.mul(tmp.tok.upgrades[22].calc)
  if (hasUpgrade("tok", 32)) multiplier = multiplier.mul(tmp.tok.upgrades[32].calc)
  return multiplier
}

function calculateVipGainMult() {
	let gain = new Decimal(1)
	if (hasUpgrade("tok", 21)) gain = gain.mul(tmp.tok.upgrades[21].calc)
	if (hasUpgrade("tok", 31)) gain = gain.mul(tmp.tok.upgrades[31].calc)
	return gain
}

function calculateVipGen() {
	let gain = player.a.vipGen
	if (player.p.buyables[23].gte(1)) gain = gain.add(tmp.p.buyables[23].calc)
	gain = gain.mul(calculateVipGainMult())
	return gain
}

function merge(layer, id, merge, autoMerge=false) {
  let data = new Decimal(getGridData(layer, id))
 // if (new Decimal(data).lt(1)) return
  if (new Decimal(getGridData(layer, (autoMerge?merge:player[layer].currentMerge))).eq(data)) {
	if (new Decimal(data).lt(1)) return
    if (autoMerge) {
    player[layer].merges = player[layer].merges.add(1)
    setGridData(layer, merge, new Decimal(0))
    setGridData(layer, id, new Decimal(data).add(1))
    if (layer == "p") {
		if (player.lev.buyables[11].gte(0)) {
		  if (Math.random() < tmp.lev.buyables[11].effect[0].div(100).toNumber()) {
			player.a.vip = player.a.vip.add(tmp.lev.buyables[11].effect[1])
		  }
		}
		if (player.lev.buyables[12].gte(0)) {
		  if (Math.random() < tmp.lev.buyables[12].effect[0].div(100).toNumber()) {
			let data2 = new Decimal(getGridData(layer, id))
			setGridData(layer, id, new Decimal(data2).add(1))
		  }
		}
		if (player.lev.buyables[21].gte(0)) {
		  if (Math.random() < tmp.lev.buyables[11].effect[0].div(100).toNumber()) {
			player.p.timeSinceLastMergeable = player.p.timeSinceLastMergeable + tmp.lev.buyables[21].effect[1].toNumber()
		  }
		}
	}
    } else {
      player[layer].merges = player[layer].merges.add(1)
      setGridData(layer, player[layer].currentMerge, new Decimal(0))
      setGridData(layer, id, new Decimal(data).add(1))
		if (layer == "p") {
			if (player.tok.upgrades.includes(14)) {
			  player.a.vip = player.a.vip.add(tmp.tok.upgrades[14].calc)
			}
			if (player.tok.upgrades.includes(24)) {
			  player.points = player.points.add(tmp.tok.upgrades[24].calc)
			}
		  if (player.lev.buyables[11].gte(0)) {
			if (Math.random() < tmp.lev.buyables[11].effect[0].div(100).toNumber()) {
			  player.a.vip = player.a.vip.add(tmp.lev.buyables[11].effect[1])
			}
		  }
		  if (player.lev.buyables[12].gte(0)) {
			if (Math.random() < tmp.lev.buyables[12].effect[0].div(100).toNumber()) {
			  let data2 = new Decimal(getGridData(layer, id))
			  setGridData(layer, id, new Decimal(data2).add(1))
			}
		  }
		  if (player.lev.buyables[21].gte(0)) {
			if (Math.random() < tmp.lev.buyables[11].effect[0].div(100).toNumber()) {
			  player.p.timeSinceLastMergeable = player.p.timeSinceLastMergeable + tmp.lev.buyables[21].effect[1].toNumber()
			}
		  }
		}
      player[layer].currentMerge = null
    }
  } else if (!autoMerge) {
    let number1 = getGridData(layer, player[layer].currentMerge)
    let number2 = getGridData(layer, id)
    setGridData(layer, id, new Decimal(number1))
    setGridData(layer, player[layer].currentMerge, new Decimal(number2))
    player[layer].currentMerge = null
  }
}

function getImprovedAutoMergeSpeed(layer) {
  let speed = 60
  switch(layer) {
    case "p":
      speed = speed / (buyableEffect("p", 21).toNumber())
      if (hasUpgrade("tok", 34)) speed = speed / (tmp.tok.upgrades[34].calc.toNumber())
      break;
  }
  return speed
}

function getRandomMergeableColor(layer, id) {
  let value = Math.min(random(player.seedColor*Math.sin(((new Decimal(getGridData(layer, id)).toNumber()*(player.seedColor**1.2))))), 16777216)
  if (layer == "tok") {
	  value = Math.min(random(player[layer].seedColor*Math.sin(((new Decimal(getGridData(layer, id)).toNumber()*(player[layer].seedColor**1.2))))), 16777216)
  }
  let string = ("#"+value.toString(16).split('0.')[1])
  string = string.slice(0, -2);
  if (string.length < 7) {
     do {
      string = string + "0"
    }
     while (string.length < 7)
  }
  string = string + "ff"
  return string
}

function buyAMergeable(layer, id) {
    setGridData(layer, id, new Decimal(1))
	player[layer].boughtMergents = player[layer].boughtMergents.add(1)
}

function clickAFuckingMergeable(layer, id) {
  let data = new Decimal(getGridData(layer, id))
  if (player[layer].currentMerge != id && player[layer].currentMerge != null) {
    merge(layer, id)
  } else if (player[layer].currentMerge == id && data.gt(new Decimal(0))) {
    player[layer].currentMerge = null
  } else if (player[layer].currentMerge == null && data.gt(new Decimal(0))) {
    player[layer].currentMerge = id
  } else if (layer == "tok" && data.eq(new Decimal(0))) {
	if (player[layer].points.gte(tmp[layer].grid.getCost)) {
		player[layer].points = player[layer].points.sub(tmp[layer].grid.getCost)
		buyAMergeable(layer, id)
	}
  }
}
function pushMergeable(layer) {
  let id1 = Math.floor(Math.random()*(tmp[layer].grid.cols))+1
  let id2 = Math.floor(Math.random()*(tmp[layer].grid.rows))+1
  let id = id2*100+id1
  if (new Decimal(getGridData(layer, id)).eq(0)) {
      setGridData(layer, id, new Decimal(1))
      player[layer].timeSinceLastMergeable -= layers[layer].mergeableRate()
      return
  }
}

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new Decimal(0),
        timeSinceLastMergeable: 30,
        timeSinceLastAMerge: 60,
        merges: new Decimal(0)
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    grid: {
      rows() {
        let number = 3
        number += tmp[this.layer].buyables[13].effect
        return number
      },
      maxRows: 9,
      cols() {
        let number = 3
        number += tmp[this.layer].buyables[12].effect
        return number
      },
      maxCols: 9,
      getStartData() {
        return new Decimal(0)
      },
      getTitle(data, id) {
        if (new Decimal(data).eq(new Decimal(0))) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
      getDisplay(data, id) { // Everything else displayed in the buyable button after the title
        if (data.eq(new Decimal(0))) {
          return ""
        }
        return "Giving +" + format(gridEffect(this.layer, id)) + " energy per second."
      },
      getEffect(data, id) {
        let effect = new Decimal(0)
        effect = effect.add(Decimal.pow(3, new Decimal(data)).div(3))
        effect = effect.mul(getEnergyMultiplier())
        return effect
      },
      getUnlocked(id) { 
        return true
      },
      getCanClick(data, id) {
        return true
      },
      onClick(data, id) {
        console.log(id)
       clickAFuckingMergeable(this.layer, id)
      },
      getStyle(data, id) {
        if (player[this.layer].currentMerge == id) return { 'background-color': "#ffffff", 'box-shadow': "0 0 40px #ccffcc" }
        if (new Decimal(getGridData(this.layer, id)).eq(new Decimal(0))) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, id) }
      },
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row) layerDataReset(this.layer, ["points"]) 
		player.seedColor = getRNGSeed()
    },
        buyables: {
            11: {
                title: "Faster Mergeables", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(10).pow(player[this.layer].buyables[this.id].div(3)).mul(25)
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.15, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " energy\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/25\n\
                    Mergeables spawn "+ formatWhole(data.effect.sub(1).mul(100))+"% faster"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(25),
            },
            12: {
                title: "Expanded Space X", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(100).pow(player[this.layer].buyables[this.id]).mul(100)
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = x.toNumber()
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " energy\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/6\n\
                    Adds +"+ formatWhole(data.effect)+" more columns"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(6),
            },
            13: {
                title: "Expanded Space Y", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(100).pow(player[this.layer].buyables[this.id]).mul(10000)
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = x.toNumber()
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " energy\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/6\n\
                    Adds +"+ formatWhole(data.effect)+" more rows"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)
                },
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(6),
            },
            21: {
                title: "Automatic Merge", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(100).pow(player[this.layer].buyables[this.id].div(10)).mul(1e8)
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.3, x.sub(1))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let effect = "Auto-merge acts "+ formatWhole(data.effect.sub(1).mul(100))+"% faster"
                    if (player[this.layer].buyables[this.id].lte(1)) effect = " "
                    return "Cost: " + format(data.cost) + " energy\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/10\n\
                    Enables Auto-Merge (at 60 seconds initially)\n" + effect
                },
                unlocked() { return player.lev.levels.gte(10) }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
            22: {
                title: "Improved Mergeables", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(10).pow(player[this.layer].buyables[this.id]).mul(1e9)
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(4, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " energy\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/10\n\
                    Mergeables produce "+ formatWhole(data.effect)+"x more energy."
                },
                unlocked() { return player.lev.levels.gte(10) }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
            23: {
                title: "VIP Point Generation", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(10).pow(player[this.layer].buyables[this.id]).mul(1e10)
                    return cost
                },
                calc() {
                  return player.points.sqrt().add(1).log10().sub(1).mul(player[this.layer].buyables[this.id].add(1))
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " energy\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "\n\
                    Grants +"+format(tmp[this.layer].buyables[this.id].calc)+" VIP Points per second."
                },
                unlocked() { return player.lev.levels.gte(10) },
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
        },
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
  mergeableRate() {
    let c = 30
    c /= (tmp[this.layer].buyables[11].effect.toNumber())
    return c
  },

    bars: {
        longBoi: {
            fillStyle: {'background-color' : "#8a989c"},
            baseStyle: {'background-color' : "#2e4045"},
            textStyle: {'color': '#5c6466'},
            borderStyle() {return {}},
            direction: UP,
            width: 20,
            height() {
              return 240 * layers[this.layer].grid.rows()/3
            },
            progress() {
                return (player[this.layer].timeSinceLastMergeable / (layers.p.mergeableRate()))
            },
            unlocked: true,

        },
        longBoi2: {
            fillStyle: {'background-color' : "#8a989c"},
            baseStyle: {'background-color' : "#2e4045"},
            textStyle: {'color': '#5c6466'},
            borderStyle() {return {}},
            direction: UP,
            width: 20,
            height() {
              return 240 * layers[this.layer].grid.rows()/3
            },
            progress() {
                return (player[this.layer].timeSinceLastAMerge / (getImprovedAutoMergeSpeed("p")))
            },
            unlocked() {
              return player.lev.levels.gte(10) && player.p.buyables[21].gte(1)
            },

        },
    },
    layerShown(){return true},
    update(diff) {
	  if (player.lev.buyables[32].gte(1)) {
		  if (hasUpgrade("tok", 15) && player.p.buyables[21].lt(player.lev.buyables[32].add(1))) {
			  player.p.buyables[21] = new Decimal(player.lev.buyables[32].add(1))
		  }
	  }
	  if (hasUpgrade("tok", 15) && player.p.buyables[21].lt(1)) {
		  player.p.buyables[21] = new Decimal(1)
	  }
	  if (player.lev.buyables[31].gte(1)) {
		  if (hasUpgrade("tok", 25) && player.p.buyables[11].lt(player.lev.buyables[31].add(20))) {
			  player.p.buyables[11] = new Decimal(player.lev.buyables[31].add(20))
		  }
	  }
	  if (hasUpgrade("tok", 25) && player.p.buyables[11].lt(20)) {
		  player.p.buyables[11] = new Decimal(20)
	  }	  
	  if (player.lev.buyables[22].gte(1)) {
		  if (hasUpgrade("tok", 35) && player.p.buyables[12].lt(player.lev.buyables[22].add(3))) {
			  player.p.buyables[12] = new Decimal(player.lev.buyables[22].add(3))
		  }
	  }
	  if (player.lev.buyables[23].gte(1)) {
		  if (hasUpgrade("tok", 35) && player.p.buyables[13].lt(player.lev.buyables[23].add(3))) {
			  player.p.buyables[13] = new Decimal(player.lev.buyables[23].add(3))
		  }
	  }
	  if (player.lev.buyables[33].gte(1)) {
		  if (player.p.buyables[22].lt(player.lev.buyables[33])) {
			  player.p.buyables[22] = new Decimal(player.lev.buyables[33])
		  }
	  }
	  if (hasUpgrade("tok", 35) && player.p.buyables[12].lt(3)) {
		  player.p.buyables[12] = new Decimal(3)
	  }
	  if (hasUpgrade("tok", 35) && player.p.buyables[13].lt(3)) {
		  player.p.buyables[13] = new Decimal(3)
	  }

      player.p.timeSinceLastMergeable += diff
      if (player.p.timeSinceLastMergeable >= layers.p.mergeableRate()) {
        pushMergeable("p")
      }
      if (player.lev.levels.gte(10) && player.p.buyables[21].gte(1)) {
        player.p.timeSinceLastAMerge += diff
        if (player.p.timeSinceLastAMerge >= getImprovedAutoMergeSpeed("p")) {
            player[this.layer].timeSinceLastAMerge = 0
              //merge
              let viableClickables = []
              for (var i in player.p.grid) {
                if (i%100 < (tmp[this.layer].grid.rows) && Math.floor(i/100) < (tmp[this.layer].grid.cols)) viableClickables.push(i)
              }
              let moreViableClickables = []
              let mergeNum = 0
              for (var i in player.p.grid) {
                if (!moreViableClickables[new Decimal(player.p.grid[i]).toNumber()]) {
                  moreViableClickables[new Decimal(player.p.grid[i]).toNumber()] = []
                  moreViableClickables[new Decimal(player.p.grid[i]).toNumber()].push(i)
                } else {
                  moreViableClickables[new Decimal(player.p.grid[i]).toNumber()].push(i)
                }
                for (var i in moreViableClickables) {
                  while (moreViableClickables[i].length > 1) {
                    merge(this.layer, moreViableClickables[i][0], moreViableClickables[i][1], true)
                    moreViableClickables[i].pop()
                    moreViableClickables[i].pop()
                  }
                }
                mergeNum = 0
                  //merge
            }
          }
        }
    },
    tabFormat: [
      ["row", ["grid", ["bar", "longBoi"], ["bar", "longBoi2"]]], "buyables"
    ]
})

addLayer("a", {
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new Decimal(0),
        vip: new Decimal(0),
        vipGen: new Decimal(0)
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	row: 0,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    vipMultiplier() {
      let effect = player[this.layer].vip.div(100)
      return effect.add(1)
    },
    vipGenDesc() {
      if (calculateVipGen().lte(0)) return " "
      return " (+"+format(calculateVipGen())+"/s) "
    },
    totalUpgrades() {
      let effect = player.p.buyables[11]
      effect = effect.add(player.p.buyables[12])
      effect = effect.add(player.p.buyables[13])
      return effect
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row) player[this.layer].vip = new Decimal(0)
    },
    achievements: {
        101: {
            name: "Kineticism I",
            done() {return player.p.merges.gte(5)}, // This one is a freebie
            tooltip: "Reach 5 normal merges. <br>+1 VIP Point", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(1)}
        },
        102: {
            name: "Kineticism II",
            done() {return player.p.merges.gte(15)}, // This one is a freebie
            tooltip: "Reach 15 normal merges. <br>+2 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(2)}
        },
        103: {
            name: "Kineticism III",
            done() {return player.p.merges.gte(25)}, // This one is a freebie
            tooltip: "Reach 25 normal merges. <br>+3 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(3)}
        },
        104: {
            name: "Kineticism IV",
            done() {return player.p.merges.gte(50)}, // This one is a freebie
            tooltip: "Reach 50 normal merges. <br>+5 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(5)}
        },
        105: {
            name: "Kineticism V",
            done() {return player.p.merges.gte(75)}, // This one is a freebie
            tooltip: "Reach 75 normal merges. <br>+10 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(10)}
        },
        106: {
            name: "Kineticism VI",
            done() {return player.p.merges.gte(100)}, // This one is a freebie
            tooltip: "Reach 100 normal merges. <br>+15 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(15)}
        },
        107: {
            name: "Kineticism VII",
            done() {return player.p.merges.gte(150)}, // This one is a freebie
            tooltip: "Reach 150 normal merges. <br>+25 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(25)}
        },
        108: {
            name: "Kineticism VIII",
            done() {return player.p.merges.gte(200)}, // This one is a freebie
            tooltip: "Reach 200 normal merges. <br>+50 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(50)}
        },
        109: {
            name: "Kineticism IX",
            done() {return player.p.merges.gte(250)}, // This one is a freebie
            tooltip: "Reach 250 normal merges. <br>+75 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(75)}
        },
        110: {
            name: "Kineticism X",
            done() {return player.p.merges.gte(500)}, // This one is a freebie
            tooltip: "Reach 500 normal merges. <br>+1 VIP Points each second", // Shows when achievement is not completed
            onComplete() {player[this.layer].vipGen = player[this.layer].vipGen.add(1)}
        },
        111: {
            name: "Kineticism XI",
            done() {return player.p.merges.gte(750)}, // This one is a freebie
            tooltip: "Reach 750 normal merges. <br>+250 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(250)}
        },
        112: {
            name: "Kineticism XII",
            done() {return player.p.merges.gte(1000)}, // This one is a freebie
            tooltip: "Reach 1000 normal merges. <br>+350 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(350)}
        },
        113: {
            name: "Kineticism XIII",
            done() {return player.p.merges.gte(1250)}, // This one is a freebie
            tooltip: "Reach 1250 normal merges. <br>+500 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(500)}
        },
        114: {
            name: "Kineticism XIV",
            done() {return player.p.merges.gte(1500)}, // This one is a freebie
            tooltip: "Reach 1500 normal merges. <br>+750 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(750)}
        },
        115: {
            name: "Kineticism XV",
            done() {return player.p.merges.gte(1750)}, // This one is a freebie
            tooltip: "Reach 1750 normal merges. <br>+"+format(1000)+" VIP Points, +4 VIP Points each second", // Shows when achievement is not completed
            onComplete() {
              player[this.layer].vip = player[this.layer].vip.add(1000)
              player[this.layer].vipGen = player[this.layer].vipGen.add(4)
            }
        },
        201: {
            name: "Synergism I",
            done() {return player.points.gte(2500)}, // This one is a freebie
            tooltip: "Reach "+format(2500)+" energy. <br>+1 VIP Point", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(1)}
        },
        202: {
            name: "Synergism II",
            done() {return player.points.gte(10000)}, // This one is a freebie
            tooltip: "Reach "+format(10000)+" energy. <br>+2 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(2)}
        },
        203: {
            name: "Synergism III",
            done() {return player.points.gte(200000)}, // This one is a freebie
            tooltip: "Reach "+format(200000)+" energy. <br>+3 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(3)}
        },
        204: {
            name: "Synergism IV",
            done() {return player.points.gte(500000)}, // This one is a freebie
            tooltip: "Reach "+format(500000)+" energy. <br>+5 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(5)}
        },
        205: {
            name: "Synergism V",
            done() {return player.points.gte(1500000)}, // This one is a freebie
            tooltip: "Reach "+format(1500000)+" energy. <br>+10 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(10)}
        },
        206: {
            name: "Synergism VI",
            done() {return player.points.gte(3000000)}, // This one is a freebie
            tooltip: "Reach "+format(3000000)+" energy. <br>+15 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(15)}
        },
        207: {
            name: "Synergism VII",
            done() {return player.points.gte(5000000)}, // This one is a freebie
            tooltip: "Reach "+format(5000000)+" energy. <br>+20 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(20)}
        },
        208: {
            name: "Synergism VIII",
            done() {return player.points.gte(9000000)}, // This one is a freebie
            tooltip: "Reach "+format(9000000)+" energy. <br>+25 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(25)}
        },
        209: {
            name: "Synergism IX",
            done() {return player.points.gte(20000000)}, // This one is a freebie
            tooltip: "Reach "+format(20000000)+" energy. <br>+50 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(50)}
        },
        210: {
            name: "Synergism X",
            done() {return player.points.gte(100000000)}, // This one is a freebie
            tooltip: "Reach "+format(100000000)+" energy. <br>+250 VIP Points, +0.5 VIP Point each second", // Shows when achievement is not completed
            onComplete() {
              player[this.layer].vip = player[this.layer].vip.add(250)
              player[this.layer].vipGen = player[this.layer].vipGen.add(0.5)
            }
        },
        211: {
            name: "Synergism XI",
            done() {return player.points.gte(300000000)}, // This one is a freebie
            tooltip: "Reach "+format(300000000)+" energy. <br>+500 VIP Points", // Shows when achievement is not completed
            onComplete() {
              player[this.layer].vip = player[this.layer].vip.add(500)
            }
        },
        212: {
            name: "Synergism XII",
            done() {return player.points.gte(500000000)}, // This one is a freebie
            tooltip: "Reach "+format(500000000)+" energy. <br>+750 VIP Points", // Shows when achievement is not completed
            onComplete() {
              player[this.layer].vip = player[this.layer].vip.add(750)
            }
        },
        213: {
            name: "Synergism XIII",
            done() {return player.points.gte(1000000000)}, // This one is a freebie
            tooltip: "Reach "+format(1000000000)+" energy. <br>+"+format(1000)+" VIP Points", // Shows when achievement is not completed
            onComplete() {
              player[this.layer].vip = player[this.layer].vip.add(1000)
            }
        },
        301: {
            name: "Hypotheticism I",
            done() {return getHighestMergeable("p").gte(5)}, // This one is a freebie
            tooltip: "Reach a tier "+format(5)+" mergeable. <br>+10 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(10)}
        },
        302: {
            name: "Hypotheticism II",
            done() {return getHighestMergeable("p").gte(7)}, // This one is a freebie
            tooltip: "Reach a tier "+format(7)+" mergeable. <br>+20 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(20)}
        },
        303: {
            name: "Hypotheticism III",
            done() {return getHighestMergeable("p").gte(10)}, // This one is a freebie
            tooltip: "Reach a tier "+format(10)+" mergeable. <br>+50 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(50)}
        },
        304: {
            name: "Hypotheticism IV",
            done() {return getHighestMergeable("p").gte(12)}, // This one is a freebie
            tooltip: "Reach a tier "+format(12)+" mergeable. <br>+200 VIP Points", // Shows when achievement is not completed
            onComplete() {player[this.layer].vip = player[this.layer].vip.add(200)}
        },
        305: {
            name: "Hypotheticism V",
            done() {return getHighestMergeable("p").gte(15)}, // This one is a freebie
            tooltip: "Reach a tier "+format(15)+" mergeable. <br>+"+format(500)+" VIP Points, +2 VIP Points each second", // Shows when achievement is not completed
            onComplete() {
				player[this.layer].vip = player[this.layer].vip.add(500)
				player[this.layer].vipGen = player[this.layer].vipGen.add(2)
			 }
        },
    },
    update(diff) {
      player[this.layer].vip = player[this.layer].vip.add(calculateVipGen().mul(diff))
    },
    tabFormat: [
      ["display-text", function() { return "You have "+formatWhole(player[this.layer].vip)+tmp[this.layer].vipGenDesc+" VIP Points, giving a "+format(tmp[this.layer].vipMultiplier)+"x multiplier to energy gain."}], "achievements"
    ],
})
addLayer("lev", {
    name: "levels", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: ":", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0),
        levels: new Decimal(0),
        spent: new Decimal(0),
		unlockedNewUpgrades: false
    }},
    color: "#0000FF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "levels", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    toNextLevel() {
      let effect = new Decimal(5)
      effect = effect.mul(Decimal.pow(2, player[this.layer].levels))
	  if (player[this.layer].levels.gt(200)) {
		  effect = effect.sub(Decimal.mul(5, Decimal.pow(2, 200))).tetrate(1.005).add(Decimal.mul(5, Decimal.pow(2, 200)))
	  }
	  if (hasUpgrade("tok", 13)) effect = effect.div(tmp.tok.upgrades[13].calc)
	  if (hasUpgrade("tok", 23)) effect = effect.div(tmp.tok.upgrades[23].calc)
	  effect = effect.div(getMergeableLevelBoosts().max(1))
      return effect
    },
    levelTokens() {
      let tokens = player[this.layer].levels
      tokens = tokens.sub(player[this.layer].spentOnBuyables)
      return tokens
    },
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row) layerDataReset(this.layer) 
    },
    bars: {
        longBoi: {
            fillStyle: {'background-color' : "#8a989c"},
            baseStyle: {'background-color' : "#2e4045"},
            textStyle: {'color': '#5c6466'},
            borderStyle() {return {}},
            direction: RIGHT,
            width: 400,
            height: 20,
            progress() {
                return (player.a.vip.div(layers.lev.toNextLevel())).toNumber()
            },
            display() {
                return formatWhole(player.a.vip) + " / " + formatWhole(layers.lev.toNextLevel()) + " VIP points"
            },
            unlocked: true
        },
    },
        buyables: {
            showRespec: true,
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                for (i in player[this.layer].buyables) {
                  player[this.layer].buyables[i] = new Decimal(0)
                }
                player[this.layer].spentOnBuyables = new Decimal(0)
            },
            respecText: "Respec Upgrades", // Text on Respec button, optional
            respecMessage: "If you respec upgrades, you will be able to choose another build. Are you sure?",
            11: {
                title: "VIP Point Chance", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.1).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [Decimal.log10(x.add(1).pow(20)).min(100), (Decimal.mul(x.div(5).add(1).pow(2).floor(), calculateVipGainMult()))]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/100\n\
                    Adds a "+ format(data.effect[0])+"% chance to get "+ formatWhole(data.effect[1])+" VIP Points when merging."
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(100),
            },
            12: {
                title: "Better Mergeable Chance", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.3).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [Decimal.log10(x.add(1).pow(10)).min(100)]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/100\n\
                    Adds a "+ format(data.effect[0])+"% chance to gain +1 tier when merging."
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(100),
            },
            13: {
                title: "More Mergent Tokens", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.4).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [Decimal.pow(1.3, player[this.layer].buyables[this.id])]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/25\n\
                    You gain "+ format(data.effect[0])+"x more mergent tokens."
                },
                unlocked() { return player[this.layer].unlockedNewUpgrades }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(25),
            },
            21: {
                title: "Quicker Mergeable Spawn", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.1).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [Decimal.log10(x.add(1).pow(10)).min(100), (Decimal.log10(x.add(1).pow(20)).div(10))]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/50\n\
                    Adds a "+ format(data.effect[0])+"% chance to make the next mergeable spawn "+ formatTime(data.effect[1])+" earlier upon merge."
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(50),
            },
            22: {
                title: "Bonus Auto Upgrade X", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(3).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [new Decimal(1)]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/3\n\
                    You always have +"+ format(data.effect[0])+" Expanded Space X levels."
                },
                unlocked() { return player[this.layer].unlockedNewUpgrades }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(3),
            },
            23: {
                title: "Bonus Auto Upgrade Y", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(3).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [new Decimal(1)]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/3\n\
                    You always have +"+ format(data.effect[0])+" Expanded Space Y levels."
                },
                unlocked() { return player[this.layer].unlockedNewUpgrades }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(3),
            },
            31: {
                title: "Bonus Faster Mergeables", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.4).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [new Decimal(1)]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/5\n\
                    You always have +"+ format(data.effect[0])+" Faster Mergeable levels."
                },
                unlocked() { return player[this.layer].unlockedNewUpgrades }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(5),
            },
	        32: {
                title: "Bonus Automatic Merge", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.3).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [new Decimal(1)]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/9\n\
                    You always have +"+ format(data.effect[0])+" Automatic Merge levels."
                },
                unlocked() { return player[this.layer].unlockedNewUpgrades }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(9),
            },
	        33: {
                title: "Bonus Improved Mergeables", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = new Decimal(1.3).pow(player[this.layer].buyables[this.id]).floor()
                    return cost
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = [new Decimal(1)]
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + formatWhole(data.cost) + " level tokens\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + "/10\n\
                    You always have +"+ format(data.effect[0])+" Improved Mergeables levels."
                },
                unlocked() { return player[this.layer].unlockedNewUpgrades }, 
                canAfford() {
                    return layers.lev.levelTokens().gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
        },
    update(diff) {
      if (player.points.gte(1e4)) {
        player[this.layer].unlocked = true
      }
      if (player.a.vip.gte(layers.lev.toNextLevel())) {
        player[this.layer].levels = player[this.layer].levels.add(1)
      }
	  if (getHighestMergeable("tok").gte(4)) {
		player[this.layer].unlockedNewUpgrades = true
	  }
    },
    tabFormat: [
      ["display-text", function() { return "You have "+formatWhole(player[this.layer].levels)+" levels."}], ["display-text", function() { return "You have "+formatWhole(tmp[this.layer].levelTokens)+" level tokens."}], ["bar", "longBoi"], "buyables"
    ]
})

addLayer("tok", {
    name: "token", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: ":", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
		total: new Decimal(0),
		best: new Decimal(0),
		resets: new Decimal(0),
        spent: new Decimal(0),
		unlockedGilded: false,
		boughtMergents: new Decimal(0),
		currentMerge: null,
		merges: new Decimal(0),
		seedColor: getRNGSeed()
    }},
    color: "#00FFFF",
    requires() {
		requirement = new Decimal(12)
		if (player[this.layer].total.gt(0)) requirement = requirement.sub(4)
		return requirement
	}, // Can be a function that takes requirement increases into account
    resource: "mergent tokens", // Name of prestige currency
    baseResource: "highest mergeable tier", // Name of resource prestige is based on
    baseAmount() {return getHighestMergeable("p")}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 10, // Prestige currency exponent
	roundUpCost: true,
    row: 1,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
		if (hasUpgrade("tok", 33)) mult = mult.mul(2)
		if (tmp.lev.buyables[13].effect[0].gte(1)) mult = mult.mul(tmp.lev.buyables[13].effect[0])
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    update(diff) {
      if (getHighestMergeable("p").gte(12)) {
        player[this.layer].unlocked = true
      }
	  if (player[this.layer].upgrades.length >= 15) {
		player[this.layer].unlockedGilded = true
	  }
    },
    grid: {
      rows() {
        let number = 3
        return number
      },
      maxRows: 9,
      cols() {
        let number = 3
        return number
      },
      maxCols: 9,
      getStartData() {
        return new Decimal(0)
      },
      getTitle(data, id) {
        if (new Decimal(data).eq(new Decimal(0))) {
          return "Empty Spot"
        } else {
          return "Tier " + formatWhole(data)
        }
      },
	  getCost(data, id) {
		let number = Decimal.pow(1.3, player[this.layer].boughtMergents).floor()
		return number
	  },
      getDisplay(data, id) { // Everything else displayed in the buyable button after the title
        if (data.eq(new Decimal(0))) {
          return "Purchase for "+formatWhole(tmp[this.layer].grid.getCost)+" mergent tokens"
        }
        return "Decreasing level requirement by " + format(gridEffect(this.layer, id).sub(1).mul(100)) + "%."
      },
      getEffect(data, id) {
        let effect = new Decimal(0)
        effect = effect.add(Decimal.pow(1.03, Decimal.pow(2, data)))
        return effect
      },
      getUnlocked(id) { 
        return true
      },
      getCanClick(data, id) {
        return true
      },
      onClick(data, id) {
       clickAFuckingMergeable(this.layer, id)
      },
      getStyle(data, id) {
        if (player[this.layer].currentMerge == id) return { 'background-color': "#ffffff", 'box-shadow': "0 0 40px #ccffcc" }
        if (new Decimal(getGridData(this.layer, id)).eq(new Decimal(0))) return { 'background-color': "#525252" }
        return { 'background-color': getRandomMergeableColor(this.layer, id) }
      },
    },
    upgrades: {
        11: {
            title: "VIP Gain",
            description() {
				return "Gain 2 VIP Points every second for each total mergent token.\n\
				Grants +"+format(tmp[this.layer].upgrades[this.id].calc)+" VIP Points per second."
			},
            cost: new Decimal(1),
            calc() {
                return player.tok.total.mul(2)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        12: {
            title: "Energy Gain",
            description() {
				return "Multiplies energy gain by 5x for each total mergent token.\n\
				Grants "+format(tmp[this.layer].upgrades[this.id].calc)+"x energy gain."
			},
            cost: new Decimal(1),
            calc() {
                return Decimal.mul(5, player.tok.total).add(1)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        13: {
            title: "Levels Gain",
            description() {
				return "Reduces the leveling threshold by 100% for each total mergent token.\n\
				Leveling is "+format(tmp[this.layer].upgrades[this.id].calc.sub(1).mul(100))+"% faster."
			},
            cost: new Decimal(1),
            calc() {
                return Decimal.mul(1, player.tok.total).add(1)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        14: {
            title: "Active Boost",
            description() {
				return "You gain 200% of the idle VIP Point gain whenever you perform a merge.\n\
				Each merge gives you "+format(tmp[this.layer].upgrades[this.id].calc)+" VIP points."
			},
            cost: new Decimal(1),
            calc() {
                return calculateVipGen().mul(2)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        15: {
            title: "Auto Boost",
            description() {
				return "If you have less than one level in Automatic Merge, you will gain a level."
			},
            cost: new Decimal(1),
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        21: {
            title: "VIP Gain II",
            description() {
				return "Increases VIP Point gain by 10% for each total mergent token.\n\
				You gain "+format(tmp[this.layer].upgrades[this.id].calc)+"x VIP Points."
			},
            cost: new Decimal(1),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(11)},
            calc() {
                return Decimal.div(player.tok.total, 10).add(1)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        22: {
            title: "Energy Gain II",
            description() {
				return "Increases energy gain by 50% for each level.\n\
				You gain "+format(tmp[this.layer].upgrades[this.id].calc)+"x energy."
			},
            cost: new Decimal(1),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(12)},
            calc() {
                return Decimal.div(player.lev.levels, 2).add(1)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        23: {
            title: "Levels Gain II",
            description() {
				return "Reduces the leveling threshold by 0.02% for each merge.\n\
				Leveling is "+format(tmp[this.layer].upgrades[this.id].calc.sub(1).mul(100))+"% faster."
			},
            cost: new Decimal(2),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(13)},
            calc() {
                return Decimal.pow(1.0002, player.p.merges)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        24: {
            title: "Active Boost II",
            description() {
				return "You gain 50% of the idle energy gain whenever you merge.\n\
				Each merge gives "+format(tmp[this.layer].upgrades[this.id].calc)+" energy."
			},
            cost: new Decimal(2),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(14)},
            calc() {
                return getPointGen().div(2)
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        25: {
            title: "Auto Upgrade",
            description() {
				return "If you have less than twenty levels in Faster Mergeables, you will gain those levels."
			},
            cost: new Decimal(2),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(15)},
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        31: {
            title: "VIP Gain III",
            description() {
				return "Increases VIP Point gain by 1.1x for each mergent upgrade\n\
				You gain "+format(tmp[this.layer].upgrades[this.id].calc)+"x VIP Points."
			},
            cost: new Decimal(1),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(21)},
            calc() {
                return Decimal.pow(1.1, player[this.layer].upgrades.length) 
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        32: {
            title: "Energy Gain III",
            description() {
				return "Increases energy gain by 1.3x for each mergent upgrade.\n\
				You gain "+format(tmp[this.layer].upgrades[this.id].calc)+"x energy."
			},
            cost: new Decimal(1),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(22)},
            calc() {
                return Decimal.pow(1.3, player[this.layer].upgrades.length) 
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        33: {
            title: "Mergent Boost",
            description() {
				return "Doubles mergent point gain."
			},
            cost: new Decimal(9),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(23)},
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        34: {
            title: "Auto Boost II",
            description() {
				return "Increases auto-merge speed by 3% for each mergent upgrade.\n\
				Auto-merge is "+format(tmp[this.layer].upgrades[this.id].calc.sub(1).mul(100))+"% faster."
			},
            cost: new Decimal(5),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(24) && player[this.layer].upgrades.includes(11)},
            calc() {
                return Decimal.pow(1.03, player[this.layer].upgrades.length) 
            },
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
        35: {
            title: "Auto Upgrade II",
            description() {
				return "If you have less than three levels in Expanded Space X/Y, you will gain those levels."
			},
            cost: new Decimal(5),
            canAfford(){return player[this.layer].points.gte(tmp[this.layer].upgrades[this.id].cost) && player[this.layer].upgrades.includes(25)},
            unlocked() { return true }, // The upgrade is only visible when this is true
        },
    },
	microtabs: {
        stuff: {
            "upgrades": {
                content: ["upgrades"]
            },
            "mergeables": {
                content: ["grid"],
				unlocked() {return player.tok.upgrades.length >= 15 || player.tok.unlockedGilded},
            },
        },
        otherStuff: {
                // There could be another set of microtabs here
        }
    },
    tabFormat: [
		"main-display", "prestige-button", "resource-display", ["microtabs", "stuff", {'border-style': 'none'}]
    ]
})


addLayer("meta", {
    color: "#FFFFFF",
    tabFormat: {
        "main tab": {
            buttonStyle() {return  {'color': 'orange'}},
            shouldNotify: true,
            embedLayer: "p"
        },
        "missions": {
            buttonStyle() {return  {'color': 'orange'}},
            shouldNotify: true,
            embedLayer: "a"
        },
        "leveling": {
            buttonStyle() {return  {'color': 'blue'}},
            shouldNotify: true,
            unlocked() {return player.points.gte(1e6) || player.lev.unlocked},
            embedLayer: "lev"
        },
        "tokens": {
            buttonStyle() {return  {'color': 'cyan'}},
            shouldNotify: true,
            unlocked() {return getHighestMergeable("p").gte(13) || player.tok.unlocked},
            embedLayer: "tok"
        },
    },
    previousTab: "",
    leftTab: true,
})
