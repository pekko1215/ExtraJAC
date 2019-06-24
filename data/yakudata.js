/**
 * Created by pekko1215 on 2017/07/15.
 */

var dummnyLines = {
    "中段":[
        [0,0,0],
        [1,1,1],
        [0,0,0]
    ],
    "上段":[
        [1,1,1],
        [0,0,0],
        [0,0,0]
    ],
    "下段":[
        [0,0,0],
        [0,0,0],
        [1,1,1]
    ],
    "右下がり":[
        [1,0,0],
        [0,1,0],
        [0,0,1]
    ],
    "右上がり":[
        [0,0,1],
        [0,1,0],
        [1,0,0]
    ],
    "なし":[
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ]
}

var YakuData = [
    {
        name: "はずれ",
        pay: [0, 0, 0]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
    },
    {
        name: "ベル",
        pay: [9, 9, 0],
    },
    {
        name: "チェリー",
        pay: [8 ,8 ,8 ],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "スイカ",
        pay: [15, 15, 15],
    },
    {
        name: "JAC1",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "JAC4",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "1枚役2",
        pay: [1, 1, 1],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "SBIG",
        pay: [0, 0, 0]
    },
    {
        name: "NBIG",
        pay: [0, 0, 0]
    },
    {
        name: "JAC3",
        pay: [0, 0, 0]
    },
    {
        name: "JAC2",
        pay: [0, 0, 0]
    },
    {
        name: "REG",
        pay: [0, 0, 0],
    },
    {
        name: "1枚役1",
        pay: [1, 1, 1],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "JACGAME",
        pay: [0, 0, 15],
        flashLine:dummnyLines["右上がり"]
    },
    {
        name: "JACGAME",
        pay: [0, 0, 15],
        flashLine:dummnyLines["右上がり"]
    },
    {
        name: "JACGAME",
        pay: [0, 0, 15],
        flashLine:dummnyLines["中段"]
    },
    {
        name: "JACGAME",
        pay: [0, 0, 12],
        flashLine:dummnyLines["右下がり"]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "リプレイ",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },
    {
        name: "JAC4",
        pay: [0, 0, 0],
        flashLine:dummnyLines["なし"]
    },

]