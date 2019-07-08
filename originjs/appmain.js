controlRerquest("data/control.smr", main)

// big1 big2
// jac1
// reg1 reg2

function main() {
    window.scrollTo(0, 0);
    let sbig;
    let notplaypaysound = false;
    let hyperzone = 0;
    let hypergame = 0;
    let lastPay = 0;
    let renCount = 0;
    let lastBonusCount = 0;
    const NBIG_PAY = 460;
    slotmodule.on("allreelstop", async function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0) return
            let matrix = e.hityaku[0].flashLine || e.hityaku[0].matrix;
            let count = 0;
            let { name } = e.hityaku[0];
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            notplaypaysound = false;
            switch (name) {
                default: slotmodule.setFlash(null, 0, function(e) {
                    slotmodule.setFlash(flashdata.default, 20)
                    slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                })
            }
        }
        replayFlag = false;
        let nexter = true;
        let changeBonusFlag = false;
        for (let i = 0; i < e.hityaku.length; i++) {
            let d = e.hityaku[i];
            // let matrix = d.matrix;
            console.log(d);
            switch (gameMode) {
                case 'normal':
                    switch (d.name) {
                        case 'リプレイ':
                            replayFlag = true;
                            break
                        case "SBIG":
                            renCount++;
                            bonusFlag = null;
                            setGamemode('SBIG');
                            let t = 4000 / (310 - lastBonusCount);
                            if (renCount == 1) lastBonusCount = 0;
                            let countUpFn;
                            let count = lastBonusCount;
                            setTimeout(countUpFn = () => {
                                segments.effectseg.setSegments('' + count);
                                count++;
                                if (count != 311) setTimeout(countUpFn, t);
                            }, t);
                            if (renCount == 1) {
                                lastBonusCount = 0;
                                await sounder.playSound('fan1');
                            } else {
                                await sounder.playSound('fan2');
                            }
                            sounder.playSound("big1", true, () => {}, 14.276);
                            bonusData = new BonusData.BigBonus5("SBIG", 310);
                            isEffected = false;
                            $('#disk').removeClass('show');
                            voltageReset();
                            playcount = 0;
                            break
                        case "NBIG":
                            setGamemode('NBIG');
                            renCount = 0;
                            bonusData = new BonusData.BigBonus5("NBIG", NBIG_PAY);
                            bonusFlag = null;
                            isEffected = false;
                            $('#disk').removeClass('show');
                            voltageReset();
                            playcount = 0;
                            bonusKokutid = true;
                            break
                        case 'REG': //CZに移行
                            setGamemode('REG');
                            bonusData = new BonusData.RegularBonus5("REG", 8, 8);
                            bonusFlag = null;
                            isEffected = false;
                            $('#disk').removeClass('show');
                            voltageReset();
                            playcount = 0;
                    }
                    break;
                case 'SBIG':
                    break;
                case 'NBIG':
                case 'JAC1':
                case 'JAC2':
                case 'JAC3':
                case 'JAC4':
                    switch (d.name) {
                        case "リプレイ":
                            replayFlag = true;
                            break
                        case 'REG':
                            setGamemode('REG');
                            bonusData.jacIn('REG', 8, 8);
                            bonusFlag = null;
                            playcount = 0;
                            bonusKokutid = true;
                            break
                        case 'JAC1':
                            setGamemode('JAC1');
                            bonusData.jacIn('JAC1', 8, 8);
                            bonusFlag = null;
                            bonusKokutid = true;
                            break
                        case "JAC2":
                            setGamemode('JAC2');
                            bonusData.jacIn('JAC2', 3, 3);
                            bonusFlag = null;
                            playcount = 0;
                            bonusKokutid = true;
                            break
                        case 'JAC3':
                            setGamemode('JAC3');
                            bonusData.jacIn('JAC3', 8, 8);
                            bonusFlag = null;
                            playcount = 0;
                            bonusKokutid = true;
                            break
                        case 'JAC4':
                            setGamemode('JAC4');
                            bonusData.jacIn('JAC4', 8, 8);
                            bonusFlag = null;
                            bonusKokutid = true;
                    }
                    break
                case 'REG':
                    switch (d.name) {
                        case 'リプレイ':
                            replayFlag = true;
                            break
                    }
            }
        }

        if (nexter) {
            e.stopend()
        }
    })
    slotmodule.on("bonusend", () => {
        sounder.stopSound("bgm")
        setGamemode("normal");
        bonusData = null;
        bonusFlag = null;
    });
    slotmodule.on("payend", function(e) {
        // console.log(e)
        if (gameMode != "normal") {
            bonusData.onNextGame(e.pay)
                // console.log(bonusData,e.pay,bonusData.getGameMode())
            setGamemode(bonusData.getGameMode());
            if (bonusData.isEnd == true) {
                sounder.stopSound("bgm");
                bonusData = null;
            }
        }
        changeBonusSeg();
    })
    slotmodule.on("leveron", function() {})
    slotmodule.on("bet", function(e) {
        changeBonusSeg();
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                let thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 70)
                } else {
                    e.betend();
                }
            })(e)
        }
        segments.payseg.reset();
        if (gameMode.includes('JAC')) {
            changeBonusSeg();
        }
    })
    slotmodule.on("pay", async(e) => {
        let pays = e.hityaku.pay;
        let loopPaySound = null;
        let payCount = 0;
        if (pays >= 2 && !notplaypaysound) sounder.playSound(loopPaySound = 'pay', true);
        if (replayFlag) {
            if (!notplaypaysound) {
                await sounder.playSound('replay');
            }
            e.replay();
            slotmodule.emit("bet", e.playingStatus);
            return
        }
        while (pays--) {
            coin++;
            payCount++;
            outcoin++;
            if (bonusData != null) {
                bonusData.onPay(1);
                changeBonusSeg();
            }
            changeCredit(1);
            segments.payseg.setSegments(payCount)
            await delay(50);
        }
        if (replayFlag) {
            e.replay();
            slotmodule.clearFlashReservation()
        } else {
            e.payend()
            if (loopPaySound) {
                sounder.stopSound(loopPaySound);
                loopPaySound = null;
            }
        }
    })
    let jacFlag = false;
    let firstHit = false;
    slotmodule.on("lot", function(e) {
        let ret = -1;
        let lotter = new Lotter(lotdata[gameMode]);
        let lot = window.power || lotter.lot().name;
        window.power = null;
        switch (gameMode) {
            case "normal":
                if (slotmodule.playControlData.betcoin != 3) {
                    ret = '1枚がけSBIG';
                    break;
                }
                switch (lot) {
                    case "リプレイ":
                        ret = "リプレイ"
                        break;
                    case "ベル":
                        ret = "ベル"
                        break
                    case "スイカ":
                        ret = "スイカ"
                        break
                    case "チェリー":
                        ret = "チェリー";
                        break;
                    case "SBIG":
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        ret = bonusFlag = "SBIG"
                        firstHit = true;
                        switch (rand(8)) {
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                                ret = "SBIG-3";
                                break
                            case 3:
                            case 2:
                                ret = "SBIG-2"
                                break
                            case 1:
                                ret = "SBIG"
                                break
                            case 0:
                                ret = "確定チェリー"
                                break
                        }
                        break;
                    case "NBIG":
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        firstHit = true;
                        ret = bonusFlag = "NBIG"
                        switch (rand(8)) {
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                                ret = "NBIG-3";
                                break
                            case 3:
                            case 2:
                                ret = "NBIG-2"
                                break
                            case 1:
                                ret = "NBIG"
                                break
                            case 0:
                                ret = "確定チェリー"
                                break
                        }
                        break;
                    case 'REG':
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        ret = bonusFlag = "REG"
                        switch (rand(8)) {
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                            case 3:
                            case 2:
                            case 1:
                                ret = "REG"
                                break
                            case 0:
                                ret = "確定チェリー"
                                break
                        }
                        break;
                    default:
                        ret = "通常はずれ"
                        if (bonusFlag) {
                            ret = bonusFlag;
                        }
                }
                break;
            case 'JAC1':
                switch (lot) {
                    case "リプレイ":
                        ret = "リプレイ"
                        break;
                    case "ベル":
                        ret = "ベル"
                        break
                    case "スイカ":
                        ret = "スイカ"
                        break
                    case "チェリー":
                        ret = "チェリー";
                        break;
                    case 'JAC1':
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        bonusFlag = ret = 'JAC1'
                        break
                    case 'JAC2':
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        bonusKokutid = false;
                        bonusFlag = 'JAC2';
                        switch (rand(6)) {
                            case 0:
                            case 1:
                            case 2:
                                ret = 'JAC2-2';
                                break
                            case 3:
                            case 4:
                                ret = 'JAC2';
                                break
                            case 5:
                                ret = '確定チェリー'
                        }
                        break
                    case 'JAC3':
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        bonusKokutid = false;
                        bonusFlag = 'JAC3';
                        switch (rand(6)) {
                            case 0:
                            case 1:
                                ret = 'JAC3-3';
                                break
                            case 2:
                            case 3:
                                ret = 'JAC3-2';
                                break
                            case 4:
                                ret = 'JAC3';
                                break
                            case 5:
                                ret = '確定チェリー'
                        }
                        break
                    default:
                        ret = "はずれ"
                        if (bonusFlag) {
                            ret = bonusFlag;
                        }
                }
                break;
            case 'JAC2':
                if (bonusFlag) lot = null;
                switch (lot) {
                    case 'JAC3':
                        bonusFlag = ret = 'JAC3'
                        break
                    case 'JAC1':
                        bonusFlag = 'JAC1';
                        ret = 'ベル'
                        break
                    default:
                        if (bonusFlag == 'JAC3') {
                            ret = 'JAC3'
                        } else {
                            ret = 'ベル'
                        }
                }
                break
            case 'JAC3':
                ret = bonusFlag = 'JAC4';
                break
            case 'JAC4':
                if (bonusFlag) lot = null;
                switch (lot) {
                    case 'JAC1':
                        bonusFlag = 'JAC1';
                        ret = 'JACGAME1'
                        break
                    case 'JAC4':
                        bonusFlag = 'JAC4';
                        ret = 'JACGAME2'
                        break
                    default:
                        if (bonusFlag == 'JAC1') {
                            ret = 'JACGAME1'
                        } else {
                            if (!rand(4)) {
                                ret = 'JACGAME2'
                            } else {
                                ret = 'JACGAME1'
                            }
                        }
                }
                break
            case 'NBIG':
                if (bonusFlag) lot = null;
                switch (lot) {
                    case 'REG':
                        ret = bonusFlag = "REG"
                        switch (rand(8)) {
                            case 7:
                            case 6:
                            case 5:
                            case 4:
                            case 3:
                            case 2:
                            case 1:
                                ret = "REG"
                                break
                            case 0:
                                ret = "確定チェリー"
                                break
                        }
                        bonusKokutid = false;
                        break
                    case 'JAC1':
                        bonusFlag = 'JAC1';
                        if (!rand(4)) {
                            ret = 'スイカ'
                        } else {
                            ret = 'ベル'
                        }
                        break
                    case 'JAC4':
                        bonusFlag = 'JAC4';
                        ret = 'JAC4'
                        if (!rand(8)) ret = 'スイカ'
                        break
                    default:
                        ret = bonusFlag;
                        if (/JAC[23]/.test(ret)) {
                            ret = 'ボーナスゲーム' + ret;
                        }
                }
                console.log({ lot, bonusFlag, ret });
                break
            case 'SBIG':
                ret = 'JACGAME1'
                break
            case 'REG':
                ret = lot;
        }
        effect(ret, lot);
        console.log(ret)
        return ret;
    })
    slotmodule.on("reelstop", function() {
        sounder.playSound("stop")
    })
    $("#saveimg").click(function() {
        SaveDataToImage();
    })
    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })
    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })
    $("#dummyfiler").change(function(e) {
        let file = this.files[0];
        let image = new Image();
        let reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                let canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                let ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                let imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                let loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })
    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 100)
        } else {
            sounder.playSound("start")
        }
        okure = false;
    })
    let okure = false;
    window.sounder = new Sounder();
    sounder.addFile("sound/stop.wav", "stop").addTag("se");
    sounder.addFile("sound/start.wav", "start").addTag("se").setVolume(0.5);
    sounder.addFile("sound/bet.wav", "3bet").addTag("se").setVolume(0.5);
    sounder.addFile("sound/yokoku_low.mp3", "yokoku_low").addTag("se");
    sounder.addFile("sound/yokoku_high.mp3", "yokoku_high").addTag("se");
    sounder.addFile("sound/pay.wav", "pay").addTag("se");
    sounder.addFile("sound/replay.wav", "replay").addTag("se");
    sounder.addFile("sound/NormalBIG.wav", "NBIG").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/big15.wav", "pay15")
    sounder.addFile("sound/SBIG.mp3", "SBIG").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/JACNABI.wav", "jacnabi").addTag("se");
    sounder.addFile("sound/big1hit.wav", "big1hit").addTag("se");
    sounder.addFile("sound/moonsuccess.mp3", "moonsuccess").addTag("se");
    sounder.addFile("sound/moonfailed.mp3", "moonfailed").addTag("se");
    sounder.addFile("sound/bell2.wav", "bell2").addTag("se");
    sounder.addFile("sound/nabi.wav", "nabi").addTag("voice").addTag("se");
    sounder.addFile("sound/reg.wav", "reg").addTag("bgm");
    sounder.addFile("sound/big1.mp3", "big1").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/moonstart.mp3", "moonstart").addTag("se").setVolume(0.2);
    sounder.addFile("sound/bigselect.mp3", "bigselect").addTag("se")
    sounder.addFile("sound/syoto.mp3", "syoto").addTag("se")
    sounder.addFile("sound/cherrypay.wav", "cherrypay").addTag("se");
    sounder.addFile("sound/bonuspay.wav", "bonuspay").addTag("voice").addTag("se");
    sounder.addFile("sound/bpay.wav", "bpay").addTag("se").setVolume(0.5);
    sounder.addFile("sound/chance.mp3", "chance").addTag("se").setVolume(0.5);
    sounder.addFile("sound/hitchance.mp3", "hitchance").addTag("se").setVolume(0.5);
    sounder.addFile("sound/fan1.mp3", "fan1").addTag("se").setVolume(0.5);
    sounder.addFile("sound/fan2.mp3", "fan2").addTag("se").setVolume(0.5);
    sounder.addFile("sound/chancezone.mp3", "chancezone").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/chancezoneend.mp3", "chancezoneend").addTag("se")
    sounder.addFile("sound/voltageup.mp3", "voltageup").addTag("se").setVolume(0.1)
    sounder.addFile("sound/leverstart.mp3", "leverstart").addTag("se")
    sounder.addFile("sound/leverpush.mp3", "leverpush").addTag("se")
    sounder.addFile("sound/win.mp3", "win").addTag("se")
    sounder.addFile("sound/lose.mp3", "lose").addTag("se")
    sounder.addFile("sound/geki.mp3", "geki").addTag("se")
    sounder.addFile("sound/title.mp3", "title").addTag("se")
    sounder.addFile("sound/type.mp3", "type").addTag("se")

    sounder.setMasterVolume(0.5)

    let normalLotter = new Lotter(lotdata.normal);
    let bigLotter = new Lotter(lotdata.big);
    let jacLotter = new Lotter(lotdata.jac);
    window.gameMode = "NBIG";
    let bonusFlag = 'JAC1'
    let coin = 0;
    window.bonusData = new BonusData.BigBonus5("NBIG", rand(NBIG_PAY) + 1);
    let replayFlag;
    let isCT = false;
    let CTBIG = false;
    let isSBIG;
    let ctdata = {};
    let regstart;
    let afterNotice;
    let bonusSelectIndex;
    let ctNoticed;
    let playcount = 0;
    let allplaycount = 0;
    let incoin = 0;
    let outcoin = 0;
    let bonuscounter = {
        count: {},
        history: []
    };
    slotmodule.on("leveron", function() {
        if (gameMode != "BIG1") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                bonuscounter.history.push({
                    bonus: gameMode,
                    game: playcount
                })
                playcount = 0;
            }
        }
        changeCredit(0)
    })

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "ゲッター7",
            id: "getter7"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        // slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }
    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }
    window.SaveData = function() {
        let savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }
    window.LoadData = function() {
        let savedata = localStorage.getItem("savedata")
        try {
            let data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }
    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;
        SaveData();
        changeCredit(0)
    }

    let oldGameMode = null;

    function setGamemode(mode) {
        oldGameMode = gameMode;
        console.log(`${gameMode} -> ${mode}`)
        switch (mode) {
            case 'normal':
                gameMode = 'normal';
                if (bonusFlag && bonusFlag.includes('JAC')) bonusFlag = null;
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                break
            case 'SBIG':
                gameMode = 'SBIG';
                slotmodule.setLotMode(2)
                slotmodule.setMaxbet(1);
                break
            case 'NBIG':
                gameMode = 'NBIG';
                slotmodule.setLotMode(1)
                slotmodule.setMaxbet(3);
                break
            case 'REG':
                gameMode = 'REG';
                slotmodule.setLotMode(2)
                slotmodule.setMaxbet(2);
                break
            case 'JAC1':
                gameMode = 'JAC1';
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                break
            case 'JAC2':
                gameMode = 'JAC2';
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                break
            case 'JAC3':
                gameMode = 'JAC3';
                slotmodule.setLotMode(1)
                slotmodule.setMaxbet(3);
                break
            case 'JAC4':
                gameMode = 'JAC4';
                slotmodule.setLotMode(2)
                slotmodule.setMaxbet(1);
        }
    }
    let segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 4)
    }
    let credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.effectseg.setOffColor(5, 5, 5);
    segments.creditseg.reset();
    segments.payseg.reset();
    segments.effectseg.reset();
    let lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        if (!this.bonusData || gameMode == 'NBIG' || gameMode.includes('JAC')) {
            segments.effectseg.setSegments("");
        } else {
            segments.effectseg.setSegments(bonusData.getBonusSeg());
        }
        // if (this.bonusData instanceof BonusData.RegularBonus5) return;
        if (gameMode.includes('JAC')) {
            if (gameMode == 'JAC1' && bonusData.payCount > 3) {
                return;
            }
            let val = Math.min(bonusData.payCount, bonusData.gameCount);
            segments.payseg.setSegments("" + val)
        }
    }
    const VoltageMap = {
        CZ: {
            low: [
                [50, 49, 1, 0, 0, ],
                [0, 50, 49, 1, 0, ],
                [0, 0, 60, 40, 0, ],
                [0, 0, 0, 99, 1, ],
                [0, 0, 0, 0, 100],
            ],
            high: [
                [30, 62, 7, 1, 0],
                [0, 30, 62, 7, 1],
                [0, 0, 59, 40, 1],
                [0, 0, 0, 80, 15],
                [0, 0, 0, 0, 100],
            ],
        },
        normal: {
            'JAC1': [995, 5, 0, 0, 0],
            'はずれ': [50, 40, 9, 0, 1],
            'リプレイ': [68, 30, 2, 0, 0],
            'ベル': [20, 40, 30, 8, 2],
            'チェリー': [20, 0, 20, 50, 10],
            'スイカ': [20, 0, 20, 50, 10],
            'JAC2': [5, 5, 40, 30, 20],
            'JAC3': [15, 5, 10, 30, 40],
            'NBIG': [15, 5, 10, 30, 40],
            'SBIG': [15, 5, 5, 5, 70],
            'REG': [5, 25, 35, 35, 0]
        }
    }

    function ArrayLot(list) {
        let sum = list.reduce((a, b) => a + b);
        let r = rand(sum);
        return list.findIndex(n => {
            return (r -= n) < 0;
        })
    }

    const voltageElements = [...$('.colorBar')].map($);

    async function upVoltage(from, to) {

        while (from < to) {
            let el = voltageElements[from]
            if (!el) {
                from++;
                continue;
            }
            el.addClass('show');
            await sounder.playSound('voltageup')
            from++;
        }
    }

    function voltageReset() {
        $('.colorBar').removeClass('show');
    }

    async function bonusKokuti(isGet) {
        if (isEffected) return;
        isEffected = true;
        let typewritter = false;
        $('#renda').removeClass('show');
        $('#geki').removeClass('show');
        $('#itigeki').removeClass('show');
        if (!rand(32) && isGet) {
            typewritter = true;
            isGet = false;
            slotmodule.once('reelstop', () => {
                slotmodule.freeze();
                Typewriter("ボーナス確定!!", {
                    speed: 150,
                    delay: 5000,
                }).change((t) => {
                    t != "\n" && sounder.playSound('type');
                }).title(() => {
                    sounder.playSound('title');
                }).finish((e) => {
                    e.parentNode.removeChild(e);
                    setTimeout(() => {
                        $('#disk').addClass('show');
                        slotmodule.resume();
                    }, 1000)
                });
            })
        }
        if (isGet) {
            $('#disk').addClass('show');
            await sounder.playSound('win');
        } else {
            $('#disk').removeClass('show');
            await sounder.playSound('lose');
        }
        slotmodule.resume();
    }

    async function leverChance(isGet) {
        const typeTable = { true: [20, 80], false: [80, 20] }[isGet];
        let downEvent;
        let fn;
        const gekiFlag = !!ArrayLot({ true: [95, 5], false: [99, 1] }[isGet]);
        window.addEventListener('keydown', downEvent = (e) => {
            if (fn) {
                fn();
            }
        })
        $('canvas')[0].addEventListener('touchstart', downEvent);
        const $disk = $('#disk');
        slotmodule.freeze();
        if (gekiFlag) {
            sounder.playSound('geki');
            $('#geki').addClass('show')
        }
        await sounder.playSound('leverstart');
        if (ArrayLot(typeTable) == 0) {
            $('#renda').addClass('show');
            let pushCount = isGet ? 1 + rand(15) : -1;
            fn = async() => {
                pushCount--;
                sounder.playSound('leverpush');
                if (!$disk.hasClass('show')) {
                    $disk.addClass('show');
                    setTimeout(() => {
                        if (!isEffected) $disk.removeClass('show');
                    }, 100)
                }
                if (pushCount != 0) return;
                window.removeEventListener('keydown', downEvent);
                $('canvas')[0].removeEventListener('touchstart', downEvent);
                await bonusKokuti(isGet);
            }
            if (!isEffected) {
                setTimeout(async() => {
                    window.removeEventListener('keydown', downEvent);
                    $('canvas')[0].removeEventListener('touchstart', downEvent);
                    await bonusKokuti(isGet);
                }, 3000)
            }
        } else {
            $('#itigeki').addClass('show');
            fn = async() => {
                sounder.playSound('leverpush')
                window.removeEventListener('keydown', downEvent);
                $('canvas')[0].removeEventListener('touchstart', downEvent);
                await bonusKokuti(isGet);
            }
        }
    }


    async function TypeWra(text, timing = 0) {
        return new Promise(r => {
            let f = (cb) => {
                slotmodule.freeze();
                Typewriter(text, {
                    speed: 150,
                    delay: 5000,
                }).change((t) => {
                    t != "\n" && sounder.playSound('type');
                }).title(() => {
                    sounder.playSound('title');
                }).finish((e) => {
                    e.parentNode.removeChild(e);
                    setTimeout(() => {
                        slotmodule.resume();
                        r();
                    }, 1000)
                });
            }
            if (timing == 0) return f();
            let f2 = () => {
                slotmodule.once('reelstop', async() => {
                    timing--;
                    if (timing == 0) {
                        slotmodule.freeze();
                        await sleep(2000);
                        return f();
                    }
                    f2();
                })
            }
            f2();
        })


    }

    const TypeWriterTable = {
        'はずれ': [{
            name: 'リーチ目を盗め！',
            value: 1 / 256
        }],
        'ベル': [{
            name: 'プラムを盗め！',
            value: 1 / 128
        }],
        'スイカ': [{
            name: 'スイカを盗め！',
            value: 1 / 8
        }],
        'チェリー': [{
            name: 'チェリーを盗め！',
            value: 1 / 128
        }],
        '確定チェリー': [{
            name: 'チェリーを盗め！',
            value: 1 / 16
        }],
        'JAC3': [{
            name: 'リーチ目を盗め！',
            value: 1 / 32,
        }, {
            name: 'プラムを盗め！',
            value: 1 / 24
        }, {
            name: 'スイカを盗め！',
            value: 1 / 16
        }, {
            name: 'チェリーを盗め！',
            value: 1 / 16
        }, {
            name: '俺の名は<br>イケゾリ三世',
            value: 1 / 32
        }]
    }
    TypeWriterTable.NBIG = TypeWriterTable.JAC3;
    TypeWriterTable.SBIG = Object.assign(TypeWriterTable.JAC3, {});
    TypeWriterTable.SBIG.push({
        name: 'スーパービッグボーナス<br>確定！',
        value: 1 / 32
    })

    let voltageIndex;
    let isEffected = false;
    let isGekiLamp;
    let bonusKokutid = true;
    async function effect(control, lot) {
        switch (gameMode) {
            case 'NBIG':
                voltageIndex = 0;
                console.log({ oldGameMode })
                if (oldGameMode != 'JAC4' && oldGameMode != 'NBIG') {
                    if (bonusFlag === 'JAC2' || bonusFlag === 'JAC3') {

                        console.log(bonusKokutid);
                        if (bonusKokutid == false) {
                            slotmodule.freeze();
                            slotmodule.setFlash(flashdata.BlueFlash);
                            await sounder.playSound('win');
                            slotmodule.resume();
                            slotmodule.clearFlashReservation();
                            bonusKokutid = true;
                        }
                    } else {
                        if (control == 'JAC4') {
                            if (rand(8)) {
                                let type = !rand(4) == 0 ? 'スイカを盗め！' : 'プラムを盗め！';
                                await TypeWra(type, !rand(6) ? 1 : 0);
                                if (!rand(8)) {
                                    await TypeWra('俺の名は<br>イケゾリ三世')
                                }
                            }
                        } else {
                            if (control == 'スイカ') {
                                if (rand(4)) {
                                    TypeWra('スイカを盗め！', !rand(32) ? 1 : 0)
                                }
                            }
                            if (control == 'ベル') {
                                if (rand(4)) {
                                    TypeWra('プラムを盗め！', !rand(32) ? 1 : 0)
                                }
                            }

                        }
                    }

                }
                break
            case 'SBIG':
                break
            case 'JAC1':
            case 'normal':
                $('.colorBar').removeClass('show');
                voltageIndex = 0;
                if (bonusFlag == null && gameMode === 'JAC1' && bonusData.gameCount <= 4) {
                    slotmodule.once('payend', async() => {
                        if (gameMode !== 'JAC1' && gameMode !== 'NBIG') return;
                        slotmodule.freeze();
                        let v = 4 - bonusData.gameCount;
                        await upVoltage(voltageIndex, voltageIndex = v);
                        slotmodule.resume();
                    })
                }
                let effectLot = bonusFlag || lot || 'はずれ';
                if (TypeWriterTable[effectLot]) {
                    if (bonusFlag === null || firstHit) {
                        let TypeWraLotter = new Lotter(TypeWriterTable[effectLot]);
                        let r = TypeWraLotter.lot();
                        if (r.name !== null) {
                            let timing = (bonusFlag !== null ? !rand(4) : !rand(32));
                            firstHit = false
                            bonusKokutid = true;
                            return await TypeWra(r.name, timing ? 1 : 0)
                        }
                    }
                }


                let arr = VoltageMap.normal[effectLot];
                let idx = ArrayLot(arr);
                let effected = false;


                if (bonusFlag !== null && bonusFlag !== 'JAC1') {
                    if (idx > 0 && !rand(8)) {
                        await slotmodule.once('stop');
                        effected = true;
                        upVoltage(voltageIndex, voltageIndex = idx);
                    }
                }
                if (!effected) {
                    upVoltage(voltageIndex, voltageIndex = idx);
                }
                firstHit = false;
                break
            case 'JAC2':
                break
            case 'JAC3':
                break
            case 'JAC4':
        }
    }
    $(window).bind("unload", function() {
        SaveData();
    });
    LoadData();
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function rand(m, n = 0) {
    return Math.floor(Math.random() * m) + n;
}

function replaceMatrix(base, matrix, front, back) {
    let out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    let out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    let cangvas = $(selector)[0];
    let sc = new SegmentControler(cangvas, size, 0, -3, 50, 30);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}

function delay(ms) {
    return new Promise(r => {
        setTimeout(r, ms);
    })
}

async function sleep(t) {
    return new Promise(r => {
        setTimeout(r, t);
    })
}